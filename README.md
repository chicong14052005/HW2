# CHESS-USING ALPHA-BETA AND MCTS ALGO

## 1. Giới thiệu dự án

Đây là một dự án cờ vua đầy đủ với giao diện (Frontend) viết bằng **React, TypeScript, Vite** và logic xử lý, hệ thống Trí tuệ nhân tạo (Backend) viết bằng **Python (Flask)**. Dự án hỗ trợ người chơi đấu với Agent AI hoặc Agent AI tự đấu với nhau trong hệ thống mô phỏng game theo thời gian thực.
Hệ thống AI được tích hợp tập trung vào hai thuật toán chính yếu trong lĩnh vực game AI là **Alpha-Beta Pruning** và **Monte Carlo Tree Search (MCTS)** tích hợp cùng các heuristic chuyên sâu để tối ưu hiệu suất, mang lại lối chơi sát với con người trên mọi thao tác.

## 2. Giới thiệu các thuật toán đã sử dụng và cách hiện thực

Hệ thống AI được hiện thực trong thư mục `backend/ai/`.

### 2.1. Thuật toán Alpha-Beta Pruning (`alphabeta.py`)

Alpha-Beta là thuật toán cải tiến từ Minimax được sử dụng để giảm thiểu lượng node phải duyệt trên cây trò chơi. Các tính năng tối ưu chính đã được áp dụng trong hàm `find_best_move` bao gồm:

- **Iterative Deepening & Time Management (Strict Time Limit):** AI tiến hành tìm kiếm nông từ `depth 1, 2, 3...` và dừng tìm kiếm ném ngoại lệ cắt nhánh ngay lập tức khi vượt quá khoảng thời gian giới hạn (`max_time`).
- **Quiescence Search (Tìm kiếm tĩnh):** Giải quyết "hiệu ứng chân trời" (Horizon Effect) để đảm bảo nhánh đi không đưa vua vào rủi ro ở nước đi ngay sát sau giới hạn độ sâu.
- **Fast Evaluation (Đánh giá siêu tốc):** Sử dụng bàn cờ tối giản đánh giá theo giá trị quân lực thuần túy (Material) và chỉ số ô vị trí (Piece-Square Tables) trên bàn.
- **Move Ordering MVV-LVA (Most Valuable Victim - Least Valuable Attacker):** Sắp xếp ưu tiên các nước đi tốt lên trước qua việc đánh giá nước ăn quân lời nhất. Điều này cải thiện đáng kể luồng cắt tỉa của Alpha-Beta.
- **Deterministic Selection:** Không sử dụng `random` tràn lan mà trực tiếp lấy node sâu sắc và tốt nhất để tối ưu thời gian.

### 2.2. Thuật toán Monte Carlo Tree Search - MCTS (`mcts.py`)

MCTS duyệt cây dựa theo mô phỏng mẫu ngẫu nhiên (Playout/Rollout) nhằm tìm nước đi tạo ra tỷ lệ thắng kỳ vọng cao. MCTS có các cơ chế (Heuristic-Enhanced) mạnh mẽ như sau:

- **Heuristic Expansion & Prioritization:** Thay vì mở node một cách mù quáng, các node `untried_moves` được sắp xếp bằng MVV-LVA để MCTS khám phá nhánh có tiềm năng lợi ích lớn đầu tiên.
- **Threat Awareness (Nhận thức rủi ro):** Tự động phạt nặng các chiến thuật đi cờ "hiến quân" đưa quân vào vùng kiểm soát nguy hiểm của đối phương mà không vì mục đích thu lợi. Chức năng này tạo bức tường an toàn cho AI.
- **Greedy Playouts:** Ở giai đoạn rollout (Mô phỏng đệ quy lá), thay vì nhặt nước đi random, AI chú trọng vào 80% trường hợp ăn quân ngon nhất có thể, nếu không có mới đi random cho 20% khả năng khám phá.
- **Early Termination:** Cải tiến dừng mô phỏng ngay từ sớm tại Node Rollout nếu độ chênh lệch quân số quá lớn (VD: Mất Hậu đối phương).
- **Dynamic Time Management:** Thời lượng suy tính linh hoạt gia giảm dựa trên tổng số `iterations` chỉ định mô phỏng.

## 3. Cách hiện thực Frontend

Frontend được đặt trong thư mục `frontend/`, sử dụng React kết hợp TypeScript và Vite. Cấu trúc tổ chức:

- **`components/`**: Các thành phần hiển thị cờ vua tái sử dụng như bàn cờ (`Board.tsx`), đồng hồ tính giờ (`ChessClock.tsx`), panel điều khiển (`GameControls.tsx`), và bảng lịch sử lưu trữ nước đi.
- **`types/` / `utils/`**: Các model, interface dùng chung hệ thống và các hàm bổ trợ liên quan tới hệ thống cờ vua.
- **`hooks/`**: Custom hooks đặc biệt là `useChessGame.ts` kết nối logic render React cùng Store trạng thái của Backend (quản lý chọn quân bài, legal moves, update bàn cờ).
- **`services/` (`api.ts`)**: Quản lý toàn bộ HTTP requests thông qua Fetch API giao tiếp tới server Flask qua port 5000 (các API tạo game, kiểm tra trạng thái AI, yêu cầu AI đi bước, xin legal moves dict cached cho tốc độ phản hồi click <0.1s). Vì AI cần thời gian dài để mô phỏng, kỹ thuật **Polling** (`ai-status`) được sử dụng ở Frontend để đợi AI phản hồi mà không block UI.
- Thư mục **`public/pieces/`** chứa các bộ hình ảnh 2D và 3D vector mô phỏng cờ.

## 4. Cách chạy chương trình

Làm theo lần lượt các bước sau:

**Bước 1:** Cài môi trường ảo cho python (Sử dụng `venv` với phiên bản python >3.8)

```bash
python -m venv .venv
# Activate môi trường ảo (Tuỳ HDH)
# Windows: .venv\Scripts\activate
# MacOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

**Bước 2:** Mở tới thư mục `HW2` và chạy tải công cụ bộ quản lý gói pnpm (yêu cầu Node.js):

```bash
npm install -g pnpm
```

**Bước 3:** Cài đặt các gói thư viện cho dự án tại Node Root:

```bash
pnpm install
```

**Bước 4:** Tiến hành build mã nguồn:

```bash
pnpm build
```

**Bước 5:** Chạy backend và development server. Truy cập trò chơi bằng đường dẫn:

```bash
# Phải đảm bảo đang run backend với (python backend/main.py)
pnpm dev
```

Truy cập vào ứng dụng qua giao diện web tại hệ thống URL theo đường dẫn: [http://localhost:5173](http://localhost:5173)
