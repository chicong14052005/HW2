# Piece values in centipawns (standard chess evaluation)
PIECE_VALUES = {
    'P': 100,   # Pawn
    'N': 320,   # Knight
    'B': 330,   # Bishop
    'R': 500,   # Rook
    'Q': 900,   # Queen
    'K': 20000  # King
}

# Piece-Square Tables (PST)
# Values represent position bonuses from white's perspective
# Higher values = better positions
# Black's table is mirrored vertically

PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
]

KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
]

BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
]

ROOK_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
]

QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
]

KING_MIDDLEGAME_TABLE = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
]

PIECE_TABLES = {
    'P': PAWN_TABLE,
    'N': KNIGHT_TABLE,
    'B': BISHOP_TABLE,
    'R': ROOK_TABLE,
    'Q': QUEEN_TABLE,
    'K': KING_MIDDLEGAME_TABLE
}


def get_piece_position_value(piece_name, row, col, color):
    table = PIECE_TABLES.get(piece_name)
    if not table:
        return 0
    if color == 'white':
        return table[row][col]
    else:
        return table[7 - row][col]


def get_attacked_squares(board, color):
    """
    Trả về set các ô đang bị tấn công bởi quân của một màu.
    Dùng để phát hiện nước đi nguy hiểm.
    """
    attacked = set()
    for r in range(8):
        for c in range(8):
            piece = board.grid[r][c]
            if piece and piece.color == color:
                # Lấy các nước đi có thể của quân này
                targets = piece.get_valid_moves((r, c), board.grid)
                for target in targets:
                    attacked.add(target)
    return attacked


def get_hanging_pieces_penalty(board, color):
    """
    Tính penalty cho quân cờ đang bị đe dọa mà không được bảo vệ.
    "Hanging piece" = quân bị tấn công nhưng không có quân đồng minh bảo vệ.
    """
    enemy_color = 'black' if color == 'white' else 'white'
    enemy_attacks = get_attacked_squares(board, enemy_color)
    own_defends = get_attacked_squares(board, color)
    
    penalty = 0
    for r in range(8):
        for c in range(8):
            piece = board.grid[r][c]
            if piece and piece.color == color and piece.name != 'K':
                pos = (r, c)
                if pos in enemy_attacks:
                    # Quân này đang bị đe dọa
                    piece_val = PIECE_VALUES.get(piece.name, 0)
                    if pos not in own_defends:
                        # Không được bảo vệ - mất miễn phí
                        penalty += piece_val
                    else:
                        # Được bảo vệ nhưng vẫn có nguy cơ trao đổi bất lợi
                        # Tìm quân tấn công nhỏ nhất
                        min_attacker_val = 10000
                        for ar in range(8):
                            for ac in range(8):
                                att = board.grid[ar][ac]
                                if att and att.color == enemy_color:
                                    att_moves = att.get_valid_moves((ar, ac), board.grid)
                                    if pos in att_moves:
                                        att_val = PIECE_VALUES.get(att.name, 0)
                                        if att_val < min_attacker_val:
                                            min_attacker_val = att_val
                        
                        # Nếu attacker nhỏ hơn defender, vẫn có penalty nhẹ
                        if min_attacker_val < piece_val:
                            penalty += (piece_val - min_attacker_val) // 2
    
    return penalty


def evaluate_board(board):
    """
    Đánh giá bàn cờ với threat detection.
    - Material value
    - Position bonus (PST)
    - Hanging pieces penalty
    """
    score = 0

    for row in range(8):
        for col in range(8):
            piece = board.grid[row][col]
            if piece is None:
                continue

            piece_value = PIECE_VALUES.get(piece.name, 0)
            position_bonus = get_piece_position_value(piece.name, row, col, piece.color)
            total_value = piece_value + position_bonus
            if piece.color == 'white':
                score += total_value
            else:
                score -= total_value

    # Thêm penalty cho hanging pieces
    white_hanging = get_hanging_pieces_penalty(board, 'white')
    black_hanging = get_hanging_pieces_penalty(board, 'black')
    score -= white_hanging  # White bị penalty khi có quân hanging
    score += black_hanging  # Black bị penalty (từ góc nhìn white là +)

    return score
