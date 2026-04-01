def get_all_legal_moves(board, color):
    """
    Tìm tất cả các nước đi hợp lệ cho một phe.
    Cần kiểm tra xem sau khi đi, Vua có bị chiếu không.
    """
    legal_moves = []
    # Sử dụng danh sách vị trí quân cờ thay vì lặp 64 ô
    if color == 'white':
        pieces_positions = board.white_pieces
    else:
        pieces_positions = board.black_pieces
    
    for pos in pieces_positions:
        piece = board.grid[pos[0]][pos[1]]
        if piece and piece.color == color:  # Kiểm tra thêm để đảm bảo
            potential_moves = piece.get_valid_moves(pos, board.grid)
            for move in potential_moves:
                # Giả lập nước đi
                board.move_piece(pos, move)
                # Nếu đi xong mà Vua mình không bị chiếu -> Hợp lệ
                if not is_in_check(board, color):
                    legal_moves.append((pos, move))
                # Hoàn tác để kiểm tra nước khác
                board.undo_move()
    return legal_moves

def is_in_check(board, color):
    # 1. Tìm vị trí quân Vua của phe mình
    king_pos = None
    for r in range(8):
        for c in range(8):
            p = board.grid[r][c]
            if p and p.name == 'K' and p.color == color:
                king_pos = (r, c)
                break
        if king_pos: break

    # 2. Kiểm tra xem có quân đối thủ nào có thể ăn được Vua không
    opponent_color = 'black' if color == 'white' else 'white'
    for r in range(8):
        for c in range(8):
            p = board.grid[r][c]
            if p and p.color == opponent_color:
                # Lấy các nước đi cơ bản của quân đối thủ
                moves = p.get_valid_moves((r, c), board.grid)
                if king_pos in moves:
                    return True
    return False

def is_draw(board, color):
    if not is_in_check(board, color) and len(get_all_legal_moves(board, color)) == 0:
        return True # Stalemate
    # Có thể thêm logic kiểm tra 50 nước đi hoặc lặp lại thế cờ
    return False

def is_checkmate(board, color):
    """Nếu đang bị chiếu và không còn nước đi hợp lệ nào -> Chiếu bí"""
    if is_in_check(board, color) and len(get_all_legal_moves(board, color)) == 0:
        return True
    return False