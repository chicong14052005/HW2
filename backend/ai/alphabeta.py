"""
Alpha-Beta Pruning với Iterative Deepening & Time Management.

Các tính năng tối ưu:
1. Iterative Deepening: Tìm kiếm từ depth 1, 2, 3... cho đến khi hết thời gian.
2. Dynamic Time Limit: Tự động scale thời gian suy nghĩ theo độ sâu (depth) được chọn.
3. Quiescence Search: Chống hiệu ứng chân trời (sửa lỗi không tìm thấy cách thoát chiếu).
4. Fast Evaluation: Bỏ quét hanging pieces tĩnh, nhường nhiệm vụ đó cho cây Minimax tự tính toán.
5. Deterministic Selection: Loại bỏ hàm random, giữ nguyên nước đi sắc bén nhất.
"""
import time
from ai.evaluation import PIECE_VALUES, get_piece_position_value
from engine.movelogic import get_all_legal_moves, is_in_check

# Giá trị quân cho MVV-LVA move ordering
MVV_LVA_VALUES = {
    'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100
}

class TimeLimitExceeded(Exception):
    """Custom exception dùng để thoát khỏi đệ quy sâu ngay lập tức khi hết giờ."""
    pass


def fast_evaluate(board):
    """
    Đánh giá bàn cờ SIÊU TỐC.
    Chỉ dùng Material và Piece-Square Tables (Vị trí).
    Tuyệt đối không dùng các hàm quét nặng ở đây, Minimax sẽ tự tính được việc ai ăn ai ở các Node lá.
    """
    score = 0
    for r in range(8):
        for c in range(8):
            p = board.grid[r][c]
            if p:
                val = PIECE_VALUES.get(p.name, 0) + get_piece_position_value(p.name, r, c, p.color)
                if p.color == 'white':
                    score += val
                else:
                    score -= val
    return score


def _get_board_hash(board):
    parts = []
    for r in range(8):
        for c in range(8):
            piece = board.grid[r][c]
            if piece:
                parts.append('{}{}{}{}'.format(piece.color[0], piece.name, r, c))
    parts.append(board.turn)
    return '|'.join(parts)


def _count_repetitions(board):
    if len(board.move_history) < 4:
        return 0

    current_hash = _get_board_hash(board)
    count = 0
    undone = []
    history_len = len(board.move_history)
    check_limit = min(history_len, 16)

    for i in range(check_limit):
        if not board.move_history:
            break
        start_pos, end_pos, captured = board.move_history[-1]
        board.undo_move()
        undone.append((start_pos, end_pos, captured))

        h = _get_board_hash(board)
        if h == current_hash:
            count += 1

    for start_pos, end_pos, captured in reversed(undone):
        board.move_piece(start_pos, end_pos)

    return count


def order_moves(board, moves):
    """
    Sắp xếp nước đi TỐI ƯU NHẤT: Chỉ dùng MVV-LVA (Most Valuable Victim - Least Valuable Attacker).
    Tốc độ cực nhanh, giúp Alpha-Beta cắt tỉa xuất sắc.
    """
    scored = []
    for move in moves:
        start, end = move
        attacker = board.grid[start[0]][start[1]]
        victim = board.grid[end[0]][end[1]]
        score = 0
        
        if victim:
            # Ưu tiên ăn quân có giá trị lớn bằng quân có giá trị nhỏ
            score = 100 + 10 * MVV_LVA_VALUES.get(victim.name, 0) - MVV_LVA_VALUES.get(attacker.name, 0)
        
        scored.append((score, move))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    return [m for _, m in scored]


def quiescence_search(board, alpha, beta, maximizing_player, depth_limit, start_time, max_time):
    if time.time() - start_time > max_time:
        raise TimeLimitExceeded()

    stand_pat = fast_evaluate(board)

    if depth_limit <= 0:
        return stand_pat

    if maximizing_player:
        if stand_pat >= beta:
            return beta
        if stand_pat > alpha:
            alpha = stand_pat

        color = 'white'
        legal_moves = get_all_legal_moves(board, color)
        in_check = is_in_check(board, color)
        
        # Nếu đang bị chiếu, BẮT BUỘC xét tất cả nước đi để chạy trốn thay vì chỉ xét nước ăn quân
        moves_to_search = legal_moves if in_check else [m for m in legal_moves if board.grid[m[1][0]][m[1][1]] is not None]

        for move in order_moves(board, moves_to_search):
            board.move_piece(move[0], move[1])
            score = quiescence_search(board, alpha, beta, False, depth_limit - 1, start_time, max_time)
            board.undo_move()

            if score >= beta:
                return beta
            if score > alpha:
                alpha = score
        return alpha
    else:
        if stand_pat <= alpha:
            return alpha
        if stand_pat < beta:
            beta = stand_pat

        color = 'black'
        legal_moves = get_all_legal_moves(board, color)
        in_check = is_in_check(board, color)
        
        moves_to_search = legal_moves if in_check else [m for m in legal_moves if board.grid[m[1][0]][m[1][1]] is not None]

        for move in order_moves(board, moves_to_search):
            board.move_piece(move[0], move[1])
            score = quiescence_search(board, alpha, beta, True, depth_limit - 1, start_time, max_time)
            board.undo_move()

            if score <= alpha:
                return alpha
            if score < beta:
                beta = score
        return beta


def alpha_beta_search(board, depth, alpha, beta, maximizing_player, start_time, max_time):
    if time.time() - start_time > max_time:
        raise TimeLimitExceeded()

    color = 'white' if maximizing_player else 'black'

    if _count_repetitions(board) >= 2:
        return (0, None)

    legal_moves = get_all_legal_moves(board, color)

    if not legal_moves:
        if is_in_check(board, color):
            # FIXED: Nếu đang bị chiếu bí, penalty sẽ phạt nặng nhánh nào chết sớm, chuộng nhánh nào giãy giụa lâu hơn (+ depth)
            return (-100000 + depth, None) if maximizing_player else (100000 - depth, None)
        else:
            return (0, None)

    if depth == 0:
        q_score = quiescence_search(board, alpha, beta, maximizing_player, 4, start_time, max_time)
        return (q_score, None)

    ordered_moves = order_moves(board, legal_moves)
    # Bỏ tính năng random đi bừa, luôn lấy nước đi đầu tiên (tốt nhất) làm mặc định
    best_move = ordered_moves[0]

    if maximizing_player:
        max_eval = float('-inf')
        for move in ordered_moves:
            board.move_piece(move[0], move[1])
            eval_score, _ = alpha_beta_search(board, depth - 1, alpha, beta, False, start_time, max_time)
            board.undo_move()

            if eval_score > max_eval:
                max_eval = eval_score
                best_move = move

            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break

        return (max_eval, best_move)

    else:
        min_eval = float('inf')
        for move in ordered_moves:
            board.move_piece(move[0], move[1])
            eval_score, _ = alpha_beta_search(board, depth - 1, alpha, beta, True, start_time, max_time)
            board.undo_move()

            if eval_score < min_eval:
                min_eval = eval_score
                best_move = move

            beta = min(beta, eval_score)
            if beta <= alpha:
                break

        return (min_eval, best_move)


def find_best_move(board, depth=5, max_time=None):
    # Tính toán lại max_time theo depth nếu không được gán sẵn
    if max_time is None:
        max_time = 5.0 + (2 ** (depth - 2)) if depth >= 2 else 5.0

    start_time = time.time()
    maximizing = (board.turn == 'white')
    
    #print(f"Bắt đầu tìm kiếm với depth={depth}, max_time={max_time}s")
    
    best_move_overall = None
    legal_moves = get_all_legal_moves(board, board.turn)
    if legal_moves:
        best_move_overall = legal_moves[0]

    for current_depth in range(1, depth + 1):
        try:
            _, best_move_at_this_depth = alpha_beta_search(
                board, 
                current_depth, 
                float('-inf'), 
                float('inf'), 
                maximizing, 
                start_time, 
                max_time
            )
            
            if best_move_at_this_depth:
                best_move_overall = best_move_at_this_depth
                
            print(f"Alpha-Beta: Finished Depth {current_depth} in {round(time.time() - start_time, 2)}s")

        except TimeLimitExceeded:
            print(f"Alpha-Beta: Timeout {max_time}s. Stopped early at Depth {current_depth}.")
            break

    return best_move_overall