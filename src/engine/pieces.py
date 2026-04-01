class Piece:
    """
    Lớp cơ sở cho tất cả các quân cờ.
    Mỗi quân cờ sẽ kế thừa từ lớp này và hiện thực hàm get_valid_moves().
    """
    
    def __init__(self, color, name):
        """
        Khởi tạo quân cờ.
        
        Args:
            color (str): 'white' hoặc 'black'
            name (str): Tên viết tắt (P, N, B, R, Q, K)
        """
        self.color = color
        self.name = name
        
    def get_valid_moves(self, pos, grid):
        """
        Hàm trừu tượng: Mỗi quân cờ cụ thể sẽ override để trả về danh sách nước đi hợp lệ.
        
        Args:
            pos (tuple): Vị trí hiện tại (row, col)
            grid (list): Bàn cờ 8x8
            
        Returns:
            list: Danh sách vị trí có thể đi tới
        """
        return []
    
    @staticmethod
    def is_on_board(pos):
        """
        Kiểm tra xem tọa độ có nằm trong bàn cờ không.
        
        Args:
            pos (tuple): Vị trí (row, col)
            
        Returns:
            bool: True nếu 0 <= row < 8 AND 0 <= col < 8
        """
        r, c = pos
        return 0 <= r < 8 and 0 <= c < 8
    
    @staticmethod
    def get_sliding_moves(pos, grid, directions, color):
        """
        Hàm bổ trợ: Tính các nước đi cho quân có khả năng trượt (Xe, Tượng, Hậu).
        
        Cơ chế: Chạy vòng lặp while theo mỗi hướng cho đến khi gặp:
        - Biên bàn cờ → Dừng
        - Quân cùng phe → Dừng không thêm ô này
        - Quân đối phương → Thêm ô này (có thể ăn quân) rồi Dừng
        
        Args:
            pos (tuple): Vị trí hiện tại (row, col)
            grid (list): Bàn cờ 8x8
            directions (list): Danh sách hướng di chuyển, ví dụ [(1,0), (0,1), ...]
            color (str): Màu sắc của quân cờ ('white' hoặc 'black')
            
        Returns:
            list: Danh sách tất cả vị trí có thể đi tới
        """
        moves = []
        for dr, dc in directions:
            r, c = pos[0] + dr, pos[1] + dc
            while Piece.is_on_board((r, c)):
                target_piece = grid[r][c]
                if target_piece is None:
                    # Ô trống → Thêm vào và tiếp tục
                    moves.append((r, c))
                elif target_piece.color != color:
                    # Quân đối phương → Thêm vào (có thể ăn) rồi dừng
                    moves.append((r, c))
                    break
                else:
                    # Quân cùng phe → Dừng ngay
                    break
                r, c = r + dr, c + dc
        return moves


class Pawn(Piece):
    """
    Quân Tốt: Đi thẳng 1 ô (hoặc 2 ô từ vị trí xuất phát), ăn chéo 1 ô.
    Hướng đi: White đi lên (row - 1), Black đi xuống (row + 1)
    """
    
    def get_valid_moves(self, pos, grid):
        moves = []
        r, c = pos
        
        # Hướng di chuyển: White đi lên (-1), Black đi xuống (+1)
        direction = -1 if self.color == 'white' else 1
        start_row = 6 if self.color == 'white' else 1
        
        # 1. Đi thẳng 1 ô
        next_r = r + direction
        if Piece.is_on_board((next_r, c)) and grid[next_r][c] is None:
            moves.append((next_r, c))
            
            # 2. Đi thẳng 2 ô từ vị trí xuất phát
            if r == start_row:
                next_next_r = r + 2 * direction
                if grid[next_next_r][c] is None:
                    moves.append((next_next_r, c))
        
        # 3. Ăn chéo
        for dc in [-1, 1]:
            next_r = r + direction
            next_c = c + dc
            if Piece.is_on_board((next_r, next_c)):
                target = grid[next_r][next_c]
                if target and target.color != self.color:
                    moves.append((next_r, next_c))
        
        return moves


class Knight(Piece):
    """
    Quân Mã: Di chuyển theo hình chữ L (8 hướng).
    Là quân duy nhất có thể nhảy qua các quân khác.
    """
    
    def get_valid_moves(self, pos, grid):
        moves = []
        # 8 hướng di chuyển của quân Mã (hình chữ L)
        directions = [
            (2, 1), (2, -1), (-2, 1), (-2, -1),
            (1, 2), (1, -2), (-1, 2), (-1, -2)
        ]
        
        for dr, dc in directions:
            target_pos = (pos[0] + dr, pos[1] + dc)
            if Piece.is_on_board(target_pos):
                target = grid[target_pos[0]][target_pos[1]]
                # Mã có thể đi tới ô trống hoặc ăn quân đối phương
                if target is None or target.color != self.color:
                    moves.append(target_pos)
        
        return moves


class Bishop(Piece):
    """
    Quân Tượng: Di chuyển theo 4 đường chéo cho đến khi gặp vật cản.
    """
    
    def get_valid_moves(self, pos, grid):
        # 4 hướng chéo
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        return Piece.get_sliding_moves(pos, grid, directions, self.color)


class Rook(Piece):
    """
    Quân Xe: Di chuyển theo 4 hướng ngang/dọc cho đến khi gặp vật cản.
    """
    
    def get_valid_moves(self, pos, grid):
        # 4 hướng ngang và dọc
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        return Piece.get_sliding_moves(pos, grid, directions, self.color)


class Queen(Piece):
    """
    Quân Hậu: Kết hợp khả năng của Xe và Tượng (8 hướng).
    """
    
    def get_valid_moves(self, pos, grid):
        # 8 hướng: ngang, dọc, và chéo
        directions = [
            (1, 1), (1, -1), (-1, 1), (-1, -1),  # Chéo (Tượng)
            (0, 1), (0, -1), (1, 0), (-1, 0)     # Ngang/dọc (Xe)
        ]
        return Piece.get_sliding_moves(pos, grid, directions, self.color)


class King(Piece):
    """
    Quân Vua: Di chuyển 1 ô về mọi hướng xung quanh (8 ô).
    """
    
    def get_valid_moves(self, pos, grid):
        moves = []
        r, c = pos
        
        # 8 hướng xung quanh
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                # Bỏ qua chính vị trí của Vua
                if dr == 0 and dc == 0:
                    continue
                
                target_pos = (r + dr, c + dc)
                if Piece.is_on_board(target_pos):
                    target = grid[target_pos[0]][target_pos[1]]
                    # Vua có thể đi tới ô trống hoặc ăn quân đối phương
                    if target is None or target.color != self.color:
                        moves.append(target_pos)
        
        return moves

