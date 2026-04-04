"""
MCTS (Monte Carlo Tree Search) — Phiên bản Heuristic-Enhanced.

Cải tiến Đột Phá để đánh bại Alpha-Beta:
1. Heuristic Expansion: Sắp xếp untried_moves bằng MVV-LVA để MCTS khám phá nhánh tốt trước.
2. Threat Awareness (Mới): Phạt cực nặng các nước đi "hiến quân" vào ô bị địch kiểm soát.
3. Greedy Playouts: Quá trình rollout không còn random mù quáng mà ưu tiên ăn quân có lợi.
4. Early Termination: Dừng mô phỏng ngay lập tức nếu độ chênh lệch quân số quá lớn (Mất Hậu).
5. Dynamic Time Management: Thời gian suy nghĩ linh hoạt theo số iterations.
"""
import math
import random
import time
from engine.movelogic import get_all_legal_moves
from ai.evaluation import PIECE_VALUES, get_piece_position_value, get_attacked_squares

# Độ sâu tối đa cho một lần mô phỏng
MAX_SIMULATION_DEPTH = 40


def _ultra_fast_evaluate(board):
    """
    Đánh giá trạng thái tại Node lá.
    """
    white_score = 0
    black_score = 0
    
    for pos in board.white_pieces:
        p = board.grid[pos[0]][pos[1]]
        if p:
            white_score += PIECE_VALUES.get(p.name, 0) + get_piece_position_value(p.name, pos[0], pos[1], 'white')
            
    for pos in board.black_pieces:
        p = board.grid[pos[0]][pos[1]]
        if p:
            black_score += PIECE_VALUES.get(p.name, 0) + get_piece_position_value(p.name, pos[0], pos[1], 'black')
            
    diff = white_score - black_score
    
    # Sigmoid-like scaling để ra xác suất thắng
    if board.turn == 'white':
        if diff > 900: return 1.0   # Lợi Hậu -> Thắng chắc
        elif diff < -900: return 0.0
        else: return max(0.0, min(1.0, 0.5 + (diff / 2000.0)))
    else:
        if diff < -900: return 1.0
        elif diff > 900: return 0.0
        else: return max(0.0, min(1.0, 0.5 - (diff / 2000.0)))


class MCTSNode(object):
    __slots__ = ['board', 'parent', 'move', 'children', 'wins', 'visits', 'untried_moves', 'color']

    def __init__(self, board, parent=None, move=None):
        self.board = board
        self.parent = parent
        self.move = move
        self.children = []
        self.wins = 0.0
        self.visits = 0
        self.color = board.turn
        
        # Chỉ lấy legal moves thực sự cho Tree Policy
        self.untried_moves = get_all_legal_moves(board, board.turn)
        self._prioritize_moves()
    
    def _prioritize_moves(self):
        """
        Sắp xếp untried_moves theo Heuristic (MVV-LVA) VÀ Kiểm tra an toàn.
        Điều này đảm bảo MCTS ưu tiên nhánh tốt và tránh xa các nước đi "tự sát".
        """
        enemy_color = 'black' if self.color == 'white' else 'white'
        enemy_attacks = get_attacked_squares(self.board, enemy_color)
        
        scored_moves = []
        for move in self.untried_moves:
            attacker = self.board.grid[move[0][0]][move[0][1]]
            target = self.board.grid[move[1][0]][move[1][1]]
            score = 0
            
            if target:
                # Ăn quân: Giá trị mục tiêu càng cao, quân ăn càng nhỏ -> Điểm càng cao
                score = 1000 + 10 * PIECE_VALUES.get(target.name, 0) - PIECE_VALUES.get(attacker.name, 0)
            else:
                # Nếu không ăn quân, ưu tiên chiếm trung tâm hoặc đi quân có giá trị (PST)
                score = get_piece_position_value(attacker.name, move[1][0], move[1][1], attacker.color)
                
            # THREAT AWARENESS: Phạt nặng nếu đi vào ô đang bị đối phương kiểm soát
            if move[1] in enemy_attacks:
                if target:
                    # Nếu là nước trao đổi quân (ăn miếng trả miếng)
                    if PIECE_VALUES.get(attacker.name, 0) > PIECE_VALUES.get(target.name, 0):
                        score -= PIECE_VALUES.get(attacker.name, 0) # Lỗ vốn -> Phạt nặng
                else:
                    # Hiến quân miễn phí (đưa quân vào chỗ chết không vì mục đích gì)
                    score -= PIECE_VALUES.get(attacker.name, 0) * 2 # Phạt cực nặng
                
            scored_moves.append((score, move))
            
        # Sắp xếp giảm dần. Nước đi tốt nằm đầu, nước đi hiến quân bị đẩy xuống cuối.
        scored_moves.sort(key=lambda x: x[0], reverse=True)
        self.untried_moves = [m for s, m in scored_moves]

    def is_fully_expanded(self):
        return len(self.untried_moves) == 0

    def ucb1(self, c=1.414):
        # Tăng tham số c (Exploration) lên một chút vì chúng ta đã sắp xếp nhánh (Exploitation) rất mạnh tay
        c = 2.0 
        if self.visits == 0:
            return float('inf')
        return (self.wins / self.visits) + c * math.sqrt(
            math.log(self.parent.visits) / self.visits # type: ignore
        )

    def select(self):
        return max(self.children, key=lambda n: n.ucb1())

    def expand(self):
        move = self.untried_moves.pop(0) # Luôn lấy nước đi tốt nhất theo Heuristic
        start_pos, end_pos = move
        
        self.board.move_piece(start_pos, end_pos)
        child_board = self.board.copy()
        child = MCTSNode(child_board, parent=self, move=move)
        self.board.undo_move()
        
        self.children.append(child)
        return child

    def simulate(self):
        """
        Greedy Pseudo-Legal Rollout.
        Mô phỏng nhanh nhưng "thông minh" hơn. Ưu tiên ăn quân có lợi.
        """
        board = self.board
        moves_made = 0
        original_turn = board.turn
        result = None
        
        # Lấy điểm Material hiện tại để kiểm tra Early Termination
        current_material_diff = 0
        for pos in board.white_pieces:
            p = board.grid[pos[0]][pos[1]]
            if p: current_material_diff += PIECE_VALUES.get(p.name, 0)
        for pos in board.black_pieces:
            p = board.grid[pos[0]][pos[1]]
            if p: current_material_diff -= PIECE_VALUES.get(p.name, 0)

        for _ in range(MAX_SIMULATION_DEPTH):
            current_color = board.turn
            pieces = board.white_pieces if current_color == 'white' else board.black_pieces
            
            pseudo_legal_moves = []
            best_capture = None
            best_capture_score = -9999
            
            for pos in pieces:
                attacker = board.grid[pos[0]][pos[1]]
                if attacker:
                    moves = attacker.get_valid_moves(pos, board.grid)
                    for target in moves:
                        target_piece = board.grid[target[0]][target[1]]
                        
                        # Điều kiện thắng ngay lập tức: Ăn Vua
                        if target_piece and target_piece.name == 'K':
                            result = 1.0 if current_color == original_turn else 0.0
                            break 
                            
                        move_tuple = (pos, target)
                        pseudo_legal_moves.append(move_tuple)
                        
                        if target_piece:
                            # Tính điểm capture
                            cap_score = 10 * PIECE_VALUES.get(target_piece.name, 0) - PIECE_VALUES.get(attacker.name, 0)
                            if cap_score > best_capture_score:
                                best_capture_score = cap_score
                                best_capture = move_tuple
                                
                if result is not None: break
            if result is not None: break
                
            if not pseudo_legal_moves:
                result = 0.5
                break
            
            # CHỌN NƯỚC ĐI: 80% chọn capture ngon nhất (nếu có), 20% random để khám phá
            if best_capture and best_capture_score > 0 and random.random() < 0.8:
                move = best_capture
            else:
                move = random.choice(pseudo_legal_moves)
            
            # Cập nhật chênh lệch quân số để kiểm tra dừng sớm
            target_piece = board.grid[move[1][0]][move[1][1]]
            if target_piece:
                val = PIECE_VALUES.get(target_piece.name, 0)
                if current_color == 'white': current_material_diff += val
                else: current_material_diff -= val
                
            board.move_piece(move[0], move[1])
            moves_made += 1
            
            # EARLY TERMINATION: Nếu chênh lệch > 900 (Mất Hậu), dừng mô phỏng.
            if current_material_diff > 900:
                result = 1.0 if original_turn == 'white' else 0.0
                break
            elif current_material_diff < -900:
                result = 0.0 if original_turn == 'white' else 1.0
                break

        # Đánh giá nếu chưa tìm ra kết quả cuối cùng
        if result is None:
            eval_score = _ultra_fast_evaluate(board)
            result = eval_score if board.turn == original_turn else 1.0 - eval_score

        for _ in range(moves_made):
            board.undo_move()

        return result

    def backpropagate(self, result):
        self.visits += 1
        self.wins += result
        if self.parent:
            self.parent.backpropagate(1.0 - result)


def find_best_move(board, iterations=500, max_time=None):
    """
    Hàm MCTS chính.
    Nếu max_time không được cấu hình cụ thể, tự động tính toán dựa trên công thức.
    """
    # Dynamic Time Calculation
    if max_time is None:
        if iterations > 500:
            max_time = 5.0 + ((iterations - 500) / 250.0)
        else:
            max_time = 5.0

    root = MCTSNode(board)
    start_time = time.time()
    count = 0

    while True:
        elapsed = time.time() - start_time
        if elapsed >= max_time:
            break
        if iterations > 0 and count >= iterations:
            break

        node = root

        # 1. Selection
        while node.is_fully_expanded() and node.children:
            node = node.select()

        # Dùng move_piece đi dọc theo cây từ Root đến Node được chọn
        moves_down = []
        temp_node = node
        while temp_node.parent is not None:
            moves_down.append(temp_node.move)
            temp_node = temp_node.parent
        
        for m in reversed(moves_down):
            board.move_piece(m[0], m[1])

        # 2. Expansion
        if node.untried_moves and board.is_terminal() is None:
            node = node.expand()
            if node.move:
                board.move_piece(node.move[0], node.move[1])
                moves_down.insert(0, node.move)

        # 3. Simulation
        result = node.simulate()

        # 4. Backpropagation
        node.backpropagate(result)
        count += 1
        
        for _ in range(len(moves_down)):
            board.undo_move()

    print(f"MCTS: Completed {count} iterations in {round(time.time() - start_time, 2)}s (Limit: {round(max_time, 1)}s)")

    if not root.children:
        return None

    # Robust Child: Chọn nút có số lượt thăm nhiều nhất
    best_child = max(root.children, key=lambda n: n.visits)
    return best_child.move