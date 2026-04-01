import math
import random
from engine.movelogic import get_all_legal_moves
from engine.board import Board

class MCTSNode:
    def __init__(self, board, parent=None, move=None):
        self.board = board
        self.parent = parent
        self.move = move
        self.children = []
        self.wins = 0
        self.visits = 0

        self.untried_moves = get_all_legal_moves(board, board.turn)

    def is_fully_expanded(self):
        return len(self.untried_moves) == 0

    def ucb1(self, c=1.414):
        if self.visits == 0:
            return float('inf')
        return (self.wins / self.visits) + c * math.sqrt(
            math.log(self.parent.visits) / self.visits
        )

    def select(self):
        return max(self.children, key=lambda n: n.ucb1())

    def expand(self):
        move = self.untried_moves.pop()
        start_pos, end_pos = move
        new_board = self.board.copy() 
        new_board.move_piece(start_pos, end_pos) 
        child = MCTSNode(new_board, parent=self, move=move)
        self.children.append(child)
        return child

    def simulate(self):
        current_board = self.board.copy()
        while current_board.is_terminal() is None:
            legal_moves = get_all_legal_moves(current_board, current_board.turn)
            if not legal_moves:
                break
            move = random.choice(legal_moves)
            current_board.move_piece(move[0], move[1])
        
        result = current_board.is_terminal()
        if result == 1: 
            return 1
        elif result == -1: 
            return 0
        return 0.5 

    def backpropagate(self, result):
        self.visits += 1
        self.wins += result
        if self.parent:
            self.parent.backpropagate(result)

def find_best_move(board, iterations=1000):

    root = MCTSNode(board.copy())

    for _ in range(iterations):
        node = root

        # 1. Selection
        while node.is_fully_expanded() and node.children:
            node = node.select()

        # 2. Expansion
        if node.board.is_terminal() is None:
            node = node.expand()

        # 3. Simulation
        result = node.simulate()
        
        # 4. Backpropagation
        node.backpropagate(result)

    if not root.children:
        return None
        
    best_child = max(root.children, key=lambda n: n.visits)
    return best_child.move
