class Piece:
    def __init__(self, color, name):
        self.color = color  # 'white' hoặc 'black'
        self.name = name    # 'P', 'N', 'B', 'R', 'Q', 'K'
        
    def get_valid_moves(self, position, board):
        """Hàm trừu tượng, mỗi quân cờ sẽ tự định nghĩa cách đi riêng"""
        pass

class Pawn(Piece):
    def get_valid_moves(self, pos, grid):
        moves = []
        direction = -1 if self.color == 'white' else 1
        r, c = pos
        # Đi thẳng 1 ô
        if 0 <= r + direction < 8 and grid[r + direction][c] is None:
            moves.append((r + direction, c))
            # Đi thẳng 2 ô từ vị trí xuất phát
            start_row = 6 if self.color == 'white' else 1
            if r == start_row and grid[r + 2 * direction][c] is None:
                moves.append((r + 2 * direction, c))
        # Ăn chéo
        for dc in [-1, 1]:
            if 0 <= r + direction < 8 and 0 <= c + dc < 8:
                target = grid[r + direction][c + dc]
                if target and target.color != self.color:
                    moves.append((r + direction, c + dc))
        return moves
    
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
    
class Bishop(Piece):
    def get_valid_moves(self, pos, grid):
        return self.get_sliding_moves(pos, grid, [(1,1), (1,-1), (-1,1), (-1,-1)])

    def get_sliding_moves(self, pos, grid, directions):
        moves = []
        for dr, dc in directions:
            r, c = pos[0] + dr, pos[1] + dc
            while 0 <= r < 8 and 0 <= c < 8:
                if grid[r][c] is None:
                    moves.append((r, c))
                elif grid[r][c].color != self.color:
                    moves.append((r, c))
                    break
                else: break
                r, c = r + dr, c + dc
        return moves

class Rook(Piece):
    def get_valid_moves(self, pos, grid):
        # Tương tự Bishop nhưng hướng là [(0,1), (0,-1), (1,0), (-1,0)]
        return Bishop.get_sliding_moves(self, pos, grid, [(0,1), (0,-1), (1,0), (-1,0)])

class Queen(Piece):
    def get_valid_moves(self, pos, grid):
        directions = [(1,1), (1,-1), (-1,1), (-1,-1), (0,1), (0,-1), (1,0), (-1,0)]
        return Bishop.get_sliding_moves(self, pos, grid, directions)

class King(Piece):
    def get_valid_moves(self, pos, grid):
        moves = []
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0: continue
                r, c = pos[0] + dr, pos[1] + dc
                if 0 <= r < 8 and 0 <= c < 8:
                    if grid[r][c] is None or grid[r][c].color != self.color:
                        moves.append((r, c))
        return moves

