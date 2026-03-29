"AI GEN RA NÊN CHỈ THAM KHẢO THÔI"

class Piece:
    def __init__(self, color, name):
        self.color = color  # 'white' hoặc 'black'
        self.name = name    # 'P', 'N', 'B', 'R', 'Q', 'K'
        
    def get_valid_moves(self, position, board):
        """Hàm trừu tượng, mỗi quân cờ sẽ tự định nghĩa cách đi riêng"""
        pass

class Knight(Piece):
    def get_valid_moves(self, pos, board):
        # Logic di chuyển hình chữ L
        moves = []
        directions = [(2,1), (2,-1), (-2,1), (-2,-1), (1,2), (1,-2), (-1,2), (-1,-2)]
        for r, c in directions:
            target = (pos[0] + r, pos[1] + c)
            if 0 <= target[0] < 8 and 0 <= target[1] < 8:
                piece = board[target[0]][target[1]]
                if piece is None or piece.color != self.color:
                    moves.append(target)
        return moves

# Tương tự cho các quân Pawn, Bishop, Rook, Queen, King...