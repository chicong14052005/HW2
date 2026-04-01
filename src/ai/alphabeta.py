from ai.evaluation import evaluate_board
from engine.movelogic import get_all_legal_moves, is_checkmate, is_stalemate

# Move ordering piece values for sorting captures
MVV_LVA_VALUES = {
    'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 10
}


def order_moves(board, moves):
    """
    Uses MVV-LVA (Most Valuable Victim - Least Valuable Attacker) heuristic.
    
    Captures are ordered by: victim_value - attacker_value
    Higher value captures come first.
    """
    scored_moves = []
    
    for move in moves:
        start_pos, end_pos = move
        attacker = board.grid[start_pos[0]][start_pos[1]]
        victim = board.grid[end_pos[0]][end_pos[1]]
        
        # Score: captures get positive score, others get 0
        score = 0
        if victim:
            # MVV-LVA: prioritize capturing high-value pieces with low-value pieces
            score = 10 * MVV_LVA_VALUES.get(victim.name, 0) - MVV_LVA_VALUES.get(attacker.name, 0)
        
        scored_moves.append((score, move))
    
    # Sort by score descending
    scored_moves.sort(key=lambda x: x[0], reverse=True)
    return [move for _, move in scored_moves]


def alpha_beta_search(board, depth: int, alpha: float, beta: float, maximizing_player: bool):
    color = 'white' if maximizing_player else 'black'
    
    if is_checkmate(board, color):
        if maximizing_player:
            return (-100000 - depth, None)  # White is checkmated
        else:
            return (100000 + depth, None)   # Black is checkmated
    
    if is_stalemate(board, color):
        return (0, None)  # Draw
    
    legal_moves = get_all_legal_moves(board, color)
    if depth == 0 or not legal_moves:
        return (evaluate_board(board), None)
    
    # Order moves for better pruning
    ordered_moves = order_moves(board, legal_moves)
    
    best_move = ordered_moves[0] if ordered_moves else None
    
    if maximizing_player:
        max_eval = float('-inf')
        for move in ordered_moves:
            start_pos, end_pos = move
            board.move_piece(start_pos, end_pos)
            eval_score, _ = alpha_beta_search(board, depth - 1, alpha, beta, False)
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
            start_pos, end_pos = move
            board.move_piece(start_pos, end_pos)
            eval_score, _ = alpha_beta_search(board, depth - 1, alpha, beta, True)
            board.undo_move()
            if eval_score < min_eval:
                min_eval = eval_score
                best_move = move
            beta = min(beta, eval_score)
            
            if beta <= alpha:
                break
        
        return (min_eval, best_move)


def find_best_move(board, depth: int = 4):
    # use this function to find the best move for the current player
    maximizing = (board.turn == 'white')
    _, best_move = alpha_beta_search(board, depth, float('-inf'), float('inf'), maximizing)
    return best_move
