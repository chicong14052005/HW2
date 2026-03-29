"AI GEN RA NÊN CHỈ THAM KHẢO THÔI"

from engine.pieces import Knight, Piece # và các quân khác

class Board:
    def __init__(self):
        # Khởi tạo mảng 2 chiều 8x8
        self.grid = [[None for _ in range(8)] for _ in range(8)]
        self.turn = 'white'  # Lượt đi hiện tại
        self.move_history = []
        self.setup_board()

    def setup_board(self):
        """Đặt các quân cờ vào vị trí khởi đầu tiêu chuẩn"""
        # Ví dụ đặt quân Mã trắng
        self.grid[7][1] = Knight('white', 'N')
        self.grid[7][6] = Knight('white', 'N')
        # ... đặt các quân còn lại ...

    def get_piece(self, pos):
        return self.grid[pos[0]][pos[1]]

    def move_piece(self, start_pos, end_pos):
        """Thực hiện di chuyển quân cờ và cập nhật lượt đi"""
        piece = self.get_piece(start_pos)
        captured_piece = self.get_piece(end_pos)
        
        # Lưu lại lịch sử để có thể Undo (phục vụ Alpha-Beta)
        self.move_history.append((start_pos, end_pos, captured_piece))
        
        self.grid[end_pos[0]][end_pos[1]] = piece
        self.grid[start_pos[0]][start_pos[1]] = None
        self.turn = 'black' if self.turn == 'white' else 'white'

    def undo_move(self):
        """Hoàn tác nước đi cuối cùng"""
        if not self.move_history: return
        
        start_pos, end_pos, captured_piece = self.move_history.pop()
        piece = self.grid[end_pos[0]][end_pos[1]]
        
        self.grid[start_pos[0]][start_pos[1]] = piece
        self.grid[end_pos[0]][end_pos[1]] = captured_piece
        self.turn = 'black' if self.turn == 'white' else 'white'