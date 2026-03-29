"AI GEN NÊN CHỈ MANG TÍNH CHẤT THAM KHẢO"


import math
import random

class MCTSNode:
    def __init__(self, board, parent=None, move=None):
        self.board = board.copy()
        self.parent = parent
        self.move = move
        self.children = []
        self.wins = 0
        self.visits = 0
        self.untried_moves = list(board.legal_moves)

    def ucb1_value(self, exploration_constant=1.41):
        if self.visits == 0:
            return float('inf')
        return (self.wins / self.visits) + exploration_constant * math.sqrt(math.log(self.parent.visits) / self.visits)

def mcts_search(root_board, iterations=1000):
    """
    Thực hiện tìm kiếm Monte Carlo trong số lượt iterations cho trước.
    """
    root_node = MCTSNode(root_board)

    for _ in range(iterations):
        node = root_node
        
        # 1. Selection: Chọn nút có UCB1 cao nhất
        while not node.untried_moves and node.children:
            node = max(node.children, key=lambda c: c.ucb1_value())
            
        # 2. Expansion: Mở rộng nước đi mới
        if node.untried_moves:
            move = random.choice(node.untried_moves)
            node.untried_moves.remove(move)
            new_board = node.board.copy()
            new_board.push(move)
            new_node = MCTSNode(new_board, parent=node, move=move)
            node.children.append(new_node)
            node = new_node
            
        # 3. Simulation (Rollout): Đánh ngẫu nhiên đến hết ván
        temp_board = node.board.copy()
        while not temp_board.is_game_over():
            legal_moves = list(temp_board.legal_moves)
            temp_board.push(random.choice(legal_moves))
        
        # 4. Backpropagation: Cập nhật kết quả thắng/thua ngược lên gốc
        result = 1 if temp_board.result() == "1-0" else 0 # Giả sử Trắng thắng
        while node is not None:
            node.visits += 1
            node.wins += result
            node = node.parent
            
    # Trả về nước đi của nút con được ghé thăm nhiều nhất
    return max(root_node.children, key=lambda c: c.visits).move