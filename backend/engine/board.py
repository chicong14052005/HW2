# File: src/engine/board.py
from engine.pieces import Pawn, Knight, Bishop, Rook, Queen, King

# Map class name -> constructor for deserialization
PIECE_CLASS_MAP = {
    'P': Pawn, 'N': Knight, 'B': Bishop, 'R': Rook, 'Q': Queen, 'K': King
}


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
        self.white_pieces = []
        self.black_pieces = []
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

    def _update_piece_list(self, pos, action, color=None):
        """
        Cập nhật danh sách pieces.
        action: 'add' hoặc 'remove'
        """
        if action == 'add':
            if color == 'white':
                if pos not in self.white_pieces:
                    self.white_pieces.append(pos)
            else:
                if pos not in self.black_pieces:
                    self.black_pieces.append(pos)
        elif action == 'remove':
            if color == 'white':
                if pos in self.white_pieces:
                    self.white_pieces.remove(pos)
            else:
                if color == 'black':
                    if pos in self.black_pieces:
                        self.black_pieces.remove(pos)

    def move_piece(self, start_pos, end_pos):
        piece = self.get_piece(start_pos)
        captured_piece = self.get_piece(end_pos)
        self.move_history.append((start_pos, end_pos, captured_piece))

        self.grid[end_pos[0]][end_pos[1]] = piece
        self.grid[start_pos[0]][start_pos[1]] = None

        # Cập nhật danh sách vị trí
        if captured_piece:
            self._update_piece_list(end_pos, 'remove', captured_piece.color)

        self._update_piece_list(start_pos, 'remove', piece.color)
        self._update_piece_list(end_pos, 'add', piece.color)

        # Tracking: quân này đã di chuyển
        old_moved = self.piece_moved.get(start_pos, False)
        self.piece_moved[end_pos] = True
        if start_pos in self.piece_moved:
            del self.piece_moved[start_pos]

        # Lưu nước đi cuối để kiểm tra en passant
        self.last_move = (start_pos, end_pos)

        self.turn = 'black' if self.turn == 'white' else 'white'

    def undo_move(self):
        if not self.move_history:
            return
        start_pos, end_pos, captured_piece = self.move_history.pop()
        piece = self.grid[end_pos[0]][end_pos[1]]
        self.grid[start_pos[0]][start_pos[1]] = piece
        self.grid[end_pos[0]][end_pos[1]] = captured_piece

        # Hoàn tác danh sách vị trí
        self._update_piece_list(end_pos, 'remove', piece.color)
        self._update_piece_list(start_pos, 'add', piece.color)

        if captured_piece:
            self._update_piece_list(end_pos, 'add', captured_piece.color)

        # Hoàn tác tracking di chuyển - khôi phục trạng thái cũ
        if end_pos in self.piece_moved:
            del self.piece_moved[end_pos]
        # Kiểm tra xem quân này đã từng di chuyển trước đó chưa
        # bằng cách xem trong move_history còn nước đi nào từ/tới start_pos
        was_moved = False
        for prev_start, prev_end, _ in self.move_history:
            if prev_end == start_pos:
                was_moved = True
                break
        self.piece_moved[start_pos] = was_moved

        # Hoàn tác last_move
        if len(self.move_history) > 0:
            prev_move = self.move_history[-1]
            self.last_move = (prev_move[0], prev_move[1])
        else:
            self.last_move = None

        self.turn = 'black' if self.turn == 'white' else 'white'

    def is_check(self, color):
        """Kiểm tra xem Vua của phe color có đang bị chiếu không."""
        king_pos = None
        for r in range(8):
            for c in range(8):
                piece = self.grid[r][c]
                if piece and piece.name == 'K' and piece.color == color:
                    king_pos = (r, c)
                    break
            if king_pos:
                break

        if not king_pos:
            return False

        opponent_color = 'black' if color == 'white' else 'white'
        opponent_pieces = self.white_pieces if opponent_color == 'white' else self.black_pieces

        for pos in list(opponent_pieces):  # list() copy để tránh mutation issue
            piece = self.grid[pos[0]][pos[1]]
            if piece and piece.color == opponent_color:
                moves = piece.get_valid_moves(pos, self.grid)
                if king_pos in moves:
                    return True

        return False

    def is_checkmate(self, color):
        """Kiểm tra xem phe color có bị chiếu bí không."""
        if not self.is_check(color):
            return False
        from engine.movelogic import get_all_legal_moves
        legal_moves = get_all_legal_moves(self, color)
        return len(legal_moves) == 0

    def is_stalemate(self, color):
        """Kiểm tra xem phe color có bị bế tắc không."""
        if self.is_check(color):
            return False
        from engine.movelogic import get_all_legal_moves
        legal_moves = get_all_legal_moves(self, color)
        return len(legal_moves) == 0

    def is_terminal(self):
        """
        Kiểm tra xem ván đấu có kết thúc hay không.
        Returns: 1 (White thắng), -1 (Black thắng), 0 (Hòa), None (đang chơi)
        """
        if self.turn == 'white':
            if self.is_checkmate('white'):
                return -1
            if self.is_stalemate('white'):
                return 0
        else:
            if self.is_checkmate('black'):
                return 1
            if self.is_stalemate('black'):
                return 0
        return None

    # ========================================================================
    # Serialization - Lưu và khôi phục board state
    # ========================================================================

    def to_dict(self):
        """Serialize board thành dict để lưu vào JSON."""
        grid_data = []
        for r in range(8):
            row = []
            for c in range(8):
                piece = self.grid[r][c]
                if piece:
                    row.append({'type': piece.name, 'color': piece.color})
                else:
                    row.append(None)
            grid_data.append(row)

        # Serialize piece_moved, convert tuple keys to strings
        piece_moved_data = {}
        for pos, moved in self.piece_moved.items():
            piece_moved_data['{},{}'.format(pos[0], pos[1])] = moved

        # Serialize move_history
        history_data = []
        for start, end, captured in self.move_history:
            cap = None
            if captured:
                cap = {'type': captured.name, 'color': captured.color}
            history_data.append({
                'start': list(start),
                'end': list(end),
                'captured': cap
            })

        return {
            'grid': grid_data,
            'turn': self.turn,
            'piece_moved': piece_moved_data,
            'last_move': [list(self.last_move[0]), list(self.last_move[1])] if self.last_move else None,
            'move_history': history_data,
        }

    @classmethod
    def from_dict(cls, data):
        """Deserialize board từ dict."""
        board = cls.__new__(cls)
        board.grid = [[None for _ in range(8)] for _ in range(8)]
        board.white_pieces = []
        board.black_pieces = []
        board.piece_moved = {}
        board.move_history = []

        # Restore grid
        for r in range(8):
            for c in range(8):
                cell = data['grid'][r][c]
                if cell:
                    piece_cls = PIECE_CLASS_MAP.get(cell['type'])
                    if piece_cls:
                        board.grid[r][c] = piece_cls(cell['color'], cell['type'])
                        if cell['color'] == 'white':
                            board.white_pieces.append((r, c))
                        else:
                            board.black_pieces.append((r, c))

        board.turn = data.get('turn', 'white')

        # Restore piece_moved
        for key, val in data.get('piece_moved', {}).items():
            parts = key.split(',')
            board.piece_moved[(int(parts[0]), int(parts[1]))] = val

        # Restore last_move
        lm = data.get('last_move')
        board.last_move = (tuple(lm[0]), tuple(lm[1])) if lm else None

        # Restore move_history
        for entry in data.get('move_history', []):
            captured = None
            if entry.get('captured'):
                cap = entry['captured']
                piece_cls = PIECE_CLASS_MAP.get(cap['type'])
                if piece_cls:
                    captured = piece_cls(cap['color'], cap['type'])
            board.move_history.append(
                (tuple(entry['start']), tuple(entry['end']), captured)
            )

        return board