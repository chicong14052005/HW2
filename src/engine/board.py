# File: src/engine/board.py
from engine.pieces import Pawn, Knight, Bishop, Rook, Queen, King

class Board:
    def __init__(self):
        self.grid = [[None for _ in range(8)] for _ in range(8)]
        self.turn = 'white'
        self.move_history = []
        self.white_pieces = []
        self.black_pieces = []
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
        
        self.turn = 'black' if self.turn == 'white' else 'white'