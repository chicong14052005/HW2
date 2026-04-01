# File: src/engine/board.py
from engine.pieces import Pawn, Knight, Bishop, Rook, Queen, King

class Board:
    def __init__(self):
        self.grid = [[None for _ in range(8)] for _ in range(8)]
        self.turn = 'white'
        self.move_history = []
        self.white_pieces = []
        self.black_pieces = []
        # Tracking di chuyển của các quân (cho nhập thành và en passant)
        self.piece_moved = {}  # {(r, c): True/False}
        self.last_move = None  # ((start_r, start_c), (end_r, end_c)) hoặc None
        self.setup_board()

    def setup_board(self):
        # Đặt quân Tốt (Pawn)
        for i in range(8):
            self.grid[1][i] = Pawn('black', 'P')
            self.grid[6][i] = Pawn('white', 'P')

        # Đặt các quân hàng cuối
        order = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]
        for i, cls in enumerate(order):
            self.grid[0][i] = cls('black', cls.__name__[0] if cls != Knight else 'N')
            self.grid[7][i] = cls('white', cls.__name__[0] if cls != Knight else 'N')

        # Điền danh sách vị trí quân cờ
        for r in range(8):
            for c in range(8):
                piece = self.grid[r][c]
                if piece:
                    if piece.color == 'white':
                        self.white_pieces.append((r, c))
                    else:
                        self.black_pieces.append((r, c))
                    # Ban đầu, tất cả quân cờ chưa di chuyển
                    self.piece_moved[(r, c)] = False

    def copy(self):
        """Tạo một bản sao của bàn cờ (Rất cần cho AI)"""
        import copy
        return copy.deepcopy(self)

    def get_piece(self, pos):
        return self.grid[pos[0]][pos[1]]

    def move_piece(self, start_pos, end_pos):
        piece = self.get_piece(start_pos)
        captured_piece = self.get_piece(end_pos)
        self.move_history.append((start_pos, end_pos, captured_piece))
        
        self.grid[end_pos[0]][end_pos[1]] = piece
        self.grid[start_pos[0]][start_pos[1]] = None
        
        # Cập nhật danh sách vị trí
        if captured_piece:
            if captured_piece.color == 'white':
                self.white_pieces.remove(end_pos)
            else:
                self.black_pieces.remove(end_pos)
        
        if piece.color == 'white':
            self.white_pieces.remove(start_pos)
            self.white_pieces.append(end_pos)
        else:
            self.black_pieces.remove(start_pos)
            self.black_pieces.append(end_pos)
        
        # Tracking: quân này đã di chuyển
        self.piece_moved[end_pos] = True
        if start_pos in self.piece_moved:
            del self.piece_moved[start_pos]
        
        # Lưu nước đi cuối để kiểm tra en passant
        self.last_move = (start_pos, end_pos)
        
        self.turn = 'black' if self.turn == 'white' else 'white'

    def undo_move(self):
        if not self.move_history: return
        start_pos, end_pos, captured_piece = self.move_history.pop()
        piece = self.grid[end_pos[0]][end_pos[1]]
        self.grid[start_pos[0]][start_pos[1]] = piece
        self.grid[end_pos[0]][end_pos[1]] = captured_piece
        
        # Hoàn tác danh sách vị trí
        if piece.color == 'white':
            self.white_pieces.remove(end_pos)
            self.white_pieces.append(start_pos)
        else:
            self.black_pieces.remove(end_pos)
            self.black_pieces.append(start_pos)
        
        if captured_piece:
            if captured_piece.color == 'white':
                self.white_pieces.append(end_pos)
            else:
                self.black_pieces.append(end_pos)
        
        # Hoàn tác tracking di chuyển
        if start_pos in self.piece_moved:
            del self.piece_moved[start_pos]
        self.piece_moved[end_pos] = True  # Hoàn lại trạng thái cũ nếu có
        
        # Hoàn tác last_move
        if len(self.move_history) > 0:
            prev_move = self.move_history[-1]
            self.last_move = (prev_move[0], prev_move[1])
        else:
            self.last_move = None
        
        self.turn = 'black' if self.turn == 'white' else 'white'

    def is_check(self, color):
        """
        Kiểm tra xem Vua của phe color có đang bị chiếu không.
        
        Thuật toán:
        1. Tìm vị trí Vua của phe color
        2. Duyệt tất cả quân cờ của đối phương
        3. Nếu bất kỳ quân nào có thể ăn được Vua -> Đang bị chiếu
        
        Chi phí: O(29) vì tối đa ~16 quân đối phương x ~3-4 nước đi cơ bản
        """
        # 1. Tìm vị trí quân Vua của phe mình
        king_pos = None
        for r in range(8):
            for c in range(8):
                piece = self.grid[r][c]
                if piece and piece.name == 'K' and piece.color == color:
                    king_pos = (r, c)
                    break
            if king_pos:
                break
        
        if not king_pos:  # Không tìm thấy Vua (không bao giờ xảy ra)
            return False
        
        # 2. Kiểm tra xem có quân đối thủ nào có thể ăn được Vua không
        opponent_color = 'black' if color == 'white' else 'white'
        opponent_pieces = self.white_pieces if opponent_color == 'white' else self.black_pieces
        
        for pos in opponent_pieces:
            piece = self.grid[pos[0]][pos[1]]
            if piece and piece.color == opponent_color:
                # Lấy các nước đi cơ bản của quân đối thủ
                moves = piece.get_valid_moves(pos, self.grid)
                if king_pos in moves:
                    return True
        
        return False

    def is_checkmate(self, color):
        """
        Kiểm tra xem phe color có bị chiếu bí không.
        Chiếu bí = đang bị chiếu AND không còn nước đi hợp lệ nào.
        """
        if not self.is_check(color):
            return False
        
        # Nhập khẩu hàm để kiểm tra nước đi hợp lệ
        from engine.movelogic import get_all_legal_moves
        legal_moves = get_all_legal_moves(self, color)
        
        return len(legal_moves) == 0

    def is_stalemate(self, color):
        """
        Kiểm tra xem phe color có bị bế tắc không.
        Bế tắc = KHÔNG bị chiếu AND không còn nước đi hợp lệ nào.
        Hòa cờ (Draw).
        """
        if self.is_check(color):
            return False
        
        # Nhập khẩu hàm để kiểm tra nước đi hợp lệ
        from engine.movelogic import get_all_legal_moves
        legal_moves = get_all_legal_moves(self, color)
        
        return len(legal_moves) == 0

    def is_terminal(self):
        """
        Kiểm tra xem ván đấu có kết thúc hay không.
        
        Trả về:
        - 1: Phe white thắng (black bị chiếu bí)
        - -1: Phe black thắng (white bị chiếu bí)
        - 0: Hòa cờ (bế tắc)
        - None: Trò chơi vẫn đang tiếp diễn
        
        Hàm này giúp AI biết khi nào nên dừng duyệt cây (Alpha-Beta)
        hoặc dừng mô phỏng (MCTS).
        """
        # Kiểm tra chiếu bí cho phe đỏ (phe không có lượt đi)
        if self.turn == 'white':
            # Nước đi tiếp theo là của white, nên black vừa đi xong
            if self.is_checkmate('white'):
                return -1  # Black thắng
            if self.is_stalemate('white'):
                return 0   # Hòa
        else:
            # Nước đi tiếp theo là của black, nên white vừa đi xong
            if self.is_checkmate('black'):
                return 1   # White thắng
            if self.is_stalemate('black'):
                return 0   # Hòa
        
        # Trò chơi vẫn đang tiếp diễn
        return None