"AI GEN RA NÊN CHỈ THAM KHẢO THÔI"

def get_all_legal_moves(board, color):
    """
    Tìm tất cả các nước đi hợp lệ cho một phe.
    Cần kiểm tra xem sau khi đi, Vua có bị chiếu không.
    """
    legal_moves = []
    for r in range(8):
        for c in range(8):
            piece = board.grid[r][c]
            if piece and piece.color == color:
                potential_moves = piece.get_valid_moves((r, c), board.grid)
                for move in potential_moves:
                    # Giả lập nước đi
                    board.move_piece((r, c), move)
                    # Nếu đi xong mà Vua mình không bị chiếu -> Hợp lệ
                    if not is_in_check(board, color):
                        legal_moves.append(((r, c), move))
                    # Hoàn tác để kiểm tra nước khác
                    board.undo_move()
    return legal_moves

def is_in_check(board, color):
    """Kiểm tra xem quân Vua của phe 'color' có đang bị tấn công không"""
    # 1. Tìm vị trí quân Vua
    # 2. Kiểm tra xem có quân đối phương nào có thể ăn được Vua ở vị trí đó không
    return False

def is_checkmate(board, color):
    """Nếu đang bị chiếu và không còn nước đi hợp lệ nào -> Chiếu bí"""
    if is_in_check(board, color) and len(get_all_legal_moves(board, color)) == 0:
        return True
    return False