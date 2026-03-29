# Điểm số cơ bản cho từng quân cờ
PIECE_VALUES = {
    'P': 10,  # Tốt
    'N': 30,  # Mã
    'B': 30,  # Tượng
    'R': 50,  # Xe
    'Q': 90,  # Hậu
    'K': 900  # Vua
}

def evaluate_board(board):
    """
    Hàm lượng giá trạng thái bàn cờ hiện tại.
    Dương (+) là ưu thế cho Trắng, Âm (-) là ưu thế cho Đen.
    """
    if board.is_checkmate():
        if board.turn: return -9999 # Đen thắng
        else: return 9999          # Trắng thắng
        
    if board.is_stalemate() or board.is_insufficient_material():
        return 0

    score = 0
    # 1. Tính tổng điểm quân cờ trên bàn
    # (Bạn sẽ duyệt qua tất cả ô cờ và cộng/trừ điểm theo PIECE_VALUES)
    
    # 2. Cộng điểm vị trí (Piece-Square Tables)
    # Ví dụ: Mã ở giữa bàn cờ được cộng thêm điểm.
    
    return score