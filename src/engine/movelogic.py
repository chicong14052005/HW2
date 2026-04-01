# ============================================================================
# NHÓM 1: HÀM KIỂM TRA HỢP LỆ (VALIDATION)
# ============================================================================

def is_move_safe(board, start_pos, end_pos, color):
    """
    Hàm phụ trợ: Kiểm tra xem một nước đi có an toàn không.
    
    Cơ chế:
    1. Giả lập di chuyển (move_piece)
    2. Kiểm tra Vua có bị chiếu không (is_in_check)
    3. Hoàn tác di chuyển (undo_move)
    4. Trả về kết quả
    
    Args:
        board: Board object
        start_pos: Vị trí hiện tại (r, c)
        end_pos: Vị trí đích (r, c)
        color: Màu phe ('white' hoặc 'black')
        
    Returns:
        bool: True nếu nước đi an toàn, False nếu làm Vua bị chiếu
    """
    board.move_piece(start_pos, end_pos)
    is_safe = not is_in_check(board, color)
    board.undo_move()
    return is_safe


def get_all_legal_moves(board, color):
    """
    Tìm tất cả các nước đi "sạch" (hợp lệ) cho một phe.
    
    Cơ chế:
    1. Duyệt qua tất cả quân cờ của phe color (sử dụng danh sách optimized)
    2. Lấy các nước đi tiềm năng từ pieces.py (get_valid_moves)
    3. Kiểm tra mỗi nước đi có an toàn không (Vua không bị chiếu sau khi đi)
    4. Thêm vào danh sách nước đi hợp lệ
    
    Chi phí: O(n*m) với n = số quân, m = số nước đi trung bình per quân
    Với cây tìm kiếm AI, hàm này được gọi hàng triệu lần → tối ưu rất quan trọng!
    
    Args:
        board: Board object
        color: Màu phe ('white' hoặc 'black')
        
    Returns:
        list: Danh sách các nước đi hợp lệ [((r1, c1), (r2, c2)), ...]
    """
    legal_moves = []
    pieces_positions = board.white_pieces if color == 'white' else board.black_pieces
    
    for pos in pieces_positions:
        piece = board.grid[pos[0]][pos[1]]
        if piece and piece.color == color:
            potential_moves = piece.get_valid_moves(pos, board.grid)
            for move in potential_moves:
                # Kiểm tra xem nước đi có an toàn không
                if is_move_safe(board, pos, move, color):
                    legal_moves.append((pos, move))
    
    return legal_moves


def is_in_check(board, color):
    """
    Kiểm tra xem quân Vua của phe color có đang bị tấn công (chiếu) không.
    
    Thuật toán:
    1. Tìm vị trí Vua của phe color
    2. Duyệt tất cả quân đối phương (sử dụng danh sách optimized)
    3. Lấy các nước đi tiềm năng của quân đối phương
    4. Nếu bất kỳ nước đi nào chỉ tới Vua → Đang bị chiếu
    
    Lưu ý: Hàm này KHÔNG kiểm tra nước đi hợp lệ của quân đối phương.
    Nó chỉ kiểm tra nước đi tiềm năng theo luật từng quân.
    
    Chi phí: O(29) - Tối ưu hơn so với duyệt 64 ô
    
    Args:
        board: Board object
        color: Màu phe ('white' hoặc 'black')
        
    Returns:
        bool: True nếu đang bị chiếu, False nếu an toàn
    """
    # 1. Tìm vị trí quân Vua
    king_pos = None
    for r in range(8):
        for c in range(8):
            piece = board.grid[r][c]
            if piece and piece.name == 'K' and piece.color == color:
                king_pos = (r, c)
                break
        if king_pos:
            break
    
    if not king_pos:
        return False  # Không tìm thấy Vua (không bao giờ xảy ra)
    
    # 2. Kiểm tra xem có quân đối phương nào có thể ăn được Vua không
    opponent_color = 'black' if color == 'white' else 'white'
    opponent_pieces = board.white_pieces if opponent_color == 'white' else board.black_pieces
    
    for pos in opponent_pieces:
        piece = board.grid[pos[0]][pos[1]]
        if piece and piece.color == opponent_color:
            moves = piece.get_valid_moves(pos, board.grid)
            if king_pos in moves:
                return True
    
    return False


# ============================================================================
# NHÓM 2: HÀM KIỂM TRA KẾT THÚC (END GAME)
# ============================================================================

def is_checkmate(board, color):
    """
    Kiểm tra xem phe color có bị chiếu bí (checkmate) không.
    
    Điều kiện: 
    - Đang bị chiếu (is_in_check = True)
    - KHÔNG còn nước đi hợp lệ nào (get_all_legal_moves trống)
    
    Nếu chiếu bí → Phe đối diện thắng!
    
    Args:
        board: Board object
        color: Màu phe ('white' hoặc 'black')
        
    Returns:
        bool: True nếu bị chiếu bí, False nếu không
    """
    if not is_in_check(board, color):
        return False
    
    legal_moves = get_all_legal_moves(board, color)
    return len(legal_moves) == 0


def is_stalemate(board, color):
    """
    Kiểm tra xem phe color có bị bế tắc (stalemate) không.
    
    Điều kiện:
    - KHÔNG bị chiếu (is_in_check = False)
    - KHÔNG còn nước đi hợp lệ nào (get_all_legal_moves trống)
    
    Kết quả: HÒA CỜ (Draw)
    
    Args:
        board: Board object
        color: Màu phe ('white' hoặc 'black')
        
    Returns:
        bool: True nếu bế tắc, False nếu không
    """
    if is_in_check(board, color):
        return False
    
    legal_moves = get_all_legal_moves(board, color)
    return len(legal_moves) == 0


def is_insufficient_material(board):
    """
    Kiểm tra xem có hòa cờ do không đủ quân để chiếu bí không.
    
    Trường hợp hòa:
    - Chỉ còn 2 Vua
    - Vua + Mã đấu Vua
    - Vua + Tượng đấu Vua (chỉ Tượng cùng màu ô)
    
    Ký hiệu quân cờ:
    - K: Vua (King)
    - N: Mã (Knight)
    - B: Tượng (Bishop)
    - R: Xe (Rook)
    - Q: Hậu (Queen)
    - P: Tốt (Pawn)
    
    Args:
        board: Board object
        
    Returns:
        bool: True nếu hòa do không đủ quân, False nếu có thể tiếp tục
    """
    white_pieces = []
    black_pieces = []
    
    for r in range(8):
        for c in range(8):
            piece = board.grid[r][c]
            if piece:
                if piece.color == 'white':
                    white_pieces.append(piece.name)
                else:
                    black_pieces.append(piece.name)
    
    # Kiểm tra các trường hợp hòa do insufficient material
    def has_sufficient_material(pieces):
        """Kiểm tra xem phe có đủ quân để chiếu bí"""
        # Nếu có Hậu, Xe, Tốt → Đủ quân
        if 'Q' in pieces or 'R' in pieces or 'P' in pieces:
            return True
        # Nếu có nhiều hơn 1 Mã hoặc nhiều hơn 1 Tượng → Đủ quân
        if pieces.count('N') > 1 or pieces.count('B') > 1:
            return True
        # Nếu có Mã và Tượng → Đủ quân
        if 'N' in pieces and 'B' in pieces:
            return True
        # Nếu có 1 Mã hoặc 1 Tượng → Tùy từng tình huống, nhưng để đơn giản coi như hòa
        # (Thực tế, cơ chế hòa Mã hoặc Tượng đơn độc rất khó)
        return False
    
    # Nếu KHÔNG phe nào đủ quân → Hòa
    return not has_sufficient_material(white_pieces) and not has_sufficient_material(black_pieces)


def is_draw(board):
    """
    Tổng hợp tất cả các điều kiện hòa cờ.
    
    Trường hợp hòa:
    1. Bế tắc (stalemate) - lượt hiện tại không chiếu nhưng không có nước đi
    2. Không đủ quân để chiếu bí (insufficient material)
    3. (Tùy tuỳ): 50 nước đi không có tốt cũng không ăn quân
    4. (Tùy tuỳ): Lặp lại 3 lần thế cờ
    
    Hiện tại: Chỉ kiểm tra bế tắc và insufficient material
    
    Args:
        board: Board object
        
    Returns:
        bool: True nếu hòa cờ, False nếu chưa hòa
    """
    # Kiểm tra bế tắc
    if is_stalemate(board, board.turn):
        return True
    
    # Kiểm tra insufficient material
    if is_insufficient_material(board):
        return True
    
    return False


# ============================================================================
# NHÓM 3: HÀM XỬ LỶ NƯỚC ĐI ĐẶC BIỆT (ADVANCED RULES)
# ============================================================================

def can_castle(board, color, side):
    """
    Kiểm tra điều kiện Nhập thành (Castling).
    
    Đây là nước đi đặc biệt cho Vua, được phép trong những điều kiện nhất định.
    
    Điều kiện Castling:
    1. Vua chưa di chuyển (self.piece_moved[king_pos] = False)
    2. Xe (Rook) chưa di chuyển (self.piece_moved[rook_pos] = False)
    3. Các ô giữa Vua và Xe phải trống
    4. Vua KHÔNG được đi qua những ô bị chiếu
    5. Vua KHÔNG được bắt đầu ở vị trí bị chiếu
    
    Loại nhập thành:
    - 'K' hoặc 'kingside': Vua đi về phía bên phải (Xe ở góc)
    - 'Q' hoặc 'queenside': Vua đi về phía bên trái (Xe ở góc)
    
    Args:
        board: Board object
        color: Màu phe ('white' hoặc 'black')
        side: 'K' (kingside) hoặc 'Q' (queenside)
        
    Returns:
        bool: True nếu có thể nhập thành, False nếu không
    """
    # Xác định vị trí Vua và Xe tùy từng màu
    if color == 'white':
        king_start = (7, 4)  # White King
        rook_k_start = (7, 7)  # White Kingside Rook
        rook_q_start = (7, 0)  # White Queenside Rook
    else:
        king_start = (0, 4)  # Black King
        rook_k_start = (0, 7)  # Black Kingside Rook
        rook_q_start = (0, 0)  # Black Queenside Rook
    
    # Kiểm tra Vua chưa di chuyển
    if board.piece_moved.get(king_start, False):
        return False
    
    # Kiểm tra không bị chiếu
    if is_in_check(board, color):
        return False
    
    # Kiểm tra tùy loại
    if side == 'K':
        # Kingside: Vua tại (7, 4), Xe tại (7, 7)
        rook_pos = rook_k_start
        # Kiểm tra Xe chưa di chuyển
        if board.piece_moved.get(rook_pos, False):
            return False
        # Kiểm tra ô giữa trống: (7, 5), (7, 6)
        if board.grid[king_start[0]][5] is not None or board.grid[king_start[0]][6] is not None:
            return False
        # Kiểm tra Vua không đi qua ô bị chiếu
        # Vua sẽ đi từ (7, 4) → (7, 5) → (7, 6)
        board.move_piece(king_start, (king_start[0], 5))
        if is_in_check(board, color):
            board.undo_move()
            return False
        board.undo_move()
        
        return True
        
    elif side == 'Q':
        # Queenside: Vua tại (7, 4), Xe tại (7, 0)
        rook_pos = rook_q_start
        # Kiểm tra Xe chưa di chuyển
        if board.piece_moved.get(rook_pos, False):
            return False
        # Kiểm tra ô giữa trống: (7, 1), (7, 2), (7, 3)
        if (board.grid[king_start[0]][1] is not None or
            board.grid[king_start[0]][2] is not None or
            board.grid[king_start[0]][3] is not None):
            return False
        # Kiểm tra Vua không đi qua ô bị chiếu
        # Vua sẽ đi từ (7, 4) → (7, 3) → (7, 2)
        board.move_piece(king_start, (king_start[0], 3))
        if is_in_check(board, color):
            board.undo_move()
            return False
        board.undo_move()
        
        return True
    
    return False


def is_pawn_promotion(move, piece):
    """
    Kiểm tra xem quân Tốt đã đi đến hàng cuối chưa.
    
    Nếu quân Tốt trắng đi đến hàng 0 hoặc quân Tốt đen đi đến hàng 7
    thì cảnh báo GUI để người chơi chọn quân thay thế (Hậu, Xe, Tượng, Mã).
    
    Args:
        move: Tuple ((start_r, start_c), (end_r, end_c))
        piece: Piece object
        
    Returns:
        bool: True nếu là quân tốt và đã đến hàng cuối, False nếu không
    """
    # Kiểm tra là quân Tốt không
    if piece.name != 'P':
        return False
    
    end_r = move[1][0]
    
    # White tốt đến hàng 0 hoặc Black tốt đến hàng 7
    if piece.color == 'white' and end_r == 0:
        return True
    if piece.color == 'black' and end_r == 7:
        return True
    
    return False


def can_en_passant(board, start_pos, end_pos, piece):
    """
    Kiểm tra luật Bắt chốt qua đường (En Passant).
    
    En Passant là một nước đi đặc biệt của Tốt:
    - Quân đối phương vừa di chuyển tốt của họ 2 ô (từ hàng xuất phát)
    - Lúc này tốt của mình ở cạnh tốt đối phương (trên cùng hàng)
    - Mình có thể "ăn" tốt đó như thể nó chỉ di chuyển 1 ô
    
    Cơ chế:
    1. Kiểm tra piece là Tốt
    2. Kiểm tra last_move là Tốt đối phương di chuyển 2 ô
    3. Kiểm tra tốt đối phương ở vị trí cặp
    4. Kiểm tra đích là ô trống (ô ở giữa)
    
    Args:
        board: Board object
        start_pos: Vị trí Tốt mình (r, c)
        end_pos: Vị trí đích (r, c) - nên là ô trống
        piece: Piece object (Tốt mình)
        
    Returns:
        bool: True nếu có thể bắt chốt qua đường, False nếu không
    """
    # Kiểm tra là quân Tốt
    if piece.name != 'P':
        return False
    
    # Kiểm tra last_move tồn tại
    if board.last_move is None:
        return False
    
    last_start, last_end = board.last_move
    
    # Kiểm tra nước cuối là Tốt di chuyển 2 ô (di chuyển từ vị trí xuất phát)
    last_piece = board.grid[last_end[0]][last_end[1]]
    if not last_piece or last_piece.name != 'P' or last_piece.color == piece.color:
        return False
    
    # Kiểm tra là nước di chuyển 2 ô (đen từ hàng 1 → 3, trắng từ hàng 6 → 4)
    if abs(last_end[0] - last_start[0]) != 2:
        return False
    
    # Kiểm tra Tốt đối phương nằm cạnh Tốt mình (cùng hàng)
    if start_pos[0] != last_end[0]:
        return False
    
    if abs(start_pos[1] - last_end[1]) != 1:
        return False
    
    # Kiểm tra đích là ô ở giữa (điểm en passant)
    # En passant target: tốt đối phương dừng lại ở last_end, nhưng bạn ăn ở giữa
    expected_target = ((last_start[0] + last_end[0]) // 2, last_end[1])
    
    # Thực tế, người chơi sẽ chọn ô đó (nằm giữa)
    # Có thể kiểm tra end_pos == expected_target hoặc để cho game logic xử lý
    
    return end_pos == expected_target