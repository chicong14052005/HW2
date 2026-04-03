# HƯỚNG DẪN TOÀN DIỆN: LUẬT CHƠI CỜ VUA TỪ CƠ BẢN ĐẾN NÂNG CAO

Cờ vua là một trò chơi chiến thuật dành cho hai người, được chơi trên một bảng hình vuông có 64 ô (8x8) với hai màu xen kẽ (thường là trắng và đen). Mục tiêu tối thượng của ván cờ là **Chiếu bí (Checkmate)** Vua của đối phương.

## PHẦN 1: LUẬT CƠ BẢN

### 1. Bàn cờ và cách thiết lập

- **Bàn cờ:** Được đặt sao cho ô góc dưới cùng bên tay phải của mỗi người chơi phải là **ô màu sáng (trắng)** . (Quy tắc: "Trắng nằm phải").
- **Quân cờ:** Mỗi người chơi bắt đầu với 16 quân cờ: 1 Vua, 1 Hậu, 2 Xe, 2 Tượng, 2 Mã và 8 Tốt.
- **Cách xếp quân (Hàng cuối cùng):** Từ ngoài vào trong: Xe, Mã, Tượng. Hai ô ở giữa dành cho Vua và Hậu. (Quy tắc: "Hậu màu nào đứng ô màu đó" - Hậu trắng đứng ô trắng, Hậu đen đứng ô đen).
- **Hàng áp chót:** Xếp toàn bộ 8 quân Tốt.
- **Người đi trước:** Quân Trắng luôn luôn đi nước đầu tiên.

### 2. Cách di chuyển của các quân cờ

Mỗi loại quân cờ có cách di chuyển riêng biệt. Ngoại trừ quân Mã, không quân nào được phép nhảy qua đầu quân khác.

- **👑 Vua (King):** Quân quan trọng nhất nhưng yếu nhất. Vua di chuyển 1 ô theo bất kỳ hướng nào (ngang, dọc, chéo).
- **👸 Hậu (Queen):** Quân mạnh nhất. Hậu có thể di chuyển theo đường ngang, dọc, hoặc chéo với số ô tùy ý, miễn là không có quân nào cản đường.
- **🏰 Xe (Rook):** Di chuyển theo đường ngang và đường dọc với số ô tùy ý.
- **🧙‍♂️ Tượng (Bishop):** Di chuyển theo đường chéo với số ô tùy ý. (Mỗi Tượng chỉ di chuyển trên các ô cùng màu với ô xuất phát của nó).
- **🐎 Mã (Knight):** Di chuyển theo hình chữ "L" (đi 2 ô theo một hướng và 1 ô theo hướng vuông góc). **Mã là quân duy nhất có thể nhảy qua đầu các quân khác.**
- **🛡️ Tốt (Pawn):** \* _Di chuyển:_ Tốt chỉ có thể tiến thẳng về phía trước 1 ô. Tuy nhiên, ở **lần di chuyển đầu tiên** , Tốt có thể chọn tiến 1 hoặc 2 ô. Tốt không bao giờ được đi lùi.
  - _Ăn quân:_ Tốt ăn quân đối phương bằng cách đi **chéo 1 ô** về phía trước (không ăn thẳng).

## PHẦN 2: CÁC LUẬT ĐẶC BIỆT (TRUNG CẤP)

Đây là những quy tắc thường khiến người mới bắt đầu bối rối nhưng lại đóng vai trò cực kỳ quan trọng trong chiến thuật.

### 1. Nhập thành (Castling)

Nhập thành là một nước đi đặc biệt cho phép bạn làm 2 việc trong cùng 1 lượt: Đưa Vua đến vị trí an toàn hơn và đưa Xe ra khỏi góc để tham gia tấn công. Vua di chuyển 2 ô về phía Xe, và Xe nhảy qua đầu Vua nằm ngay bên cạnh.

**Điều kiện để được Nhập thành:**

1. Đó phải là nước đi đầu tiên của Vua.
2. Đó phải là nước đi đầu tiên của quân Xe tham gia nhập thành.
3. Không có quân nào nằm giữa Vua và Xe.
4. Vua **không bị chiếu** (bị tấn công).
5. Vua không được đi qua, hoặc kết thúc ở một ô đang bị quân đối phương kiểm soát (chiếu).

### 2. Phong cấp Tốt (Pawn Promotion)

Nếu một quân Tốt tiến được đến hàng cuối cùng của bàn cờ (hàng 8 đối với Trắng, hàng 1 đối với Đen), nó **bắt buộc** phải được "phong cấp" thành bất kỳ quân nào (trừ Vua).

- Người chơi thường chọn phong cấp thành **Hậu** vì đây là quân mạnh nhất.
- Số lượng quân được phong cấp là không giới hạn (bạn có thể có 2, 3 Hậu trên bàn cờ cùng lúc).

### 3. Bắt Tốt qua đường (En Passant)

Nếu Tốt của bạn đang ở hàng thứ 5 (đối với Trắng) hoặc hàng thứ 4 (đối với Đen) và Tốt của đối phương di chuyển **2 bước** từ vị trí ban đầu và đáp xuống ngay bên cạnh Tốt của bạn, bạn có quyền "bắt" Tốt đối phương như thể nó chỉ vừa đi 1 bước.

- **Lưu ý quan trọng:** Bạn **bắt buộc phải thực hiện quyền này ngay lập tức** ở lượt đi tiếp theo. Nếu bạn đi một nước khác, quyền "En Passant" sẽ mất đi đối với quân Tốt đó.

## PHẦN 3: KẾT THÚC VÁN CỜ & LUẬT NÂNG CAO

### 1. Chiếu và Chiếu bí (Check & Checkmate)

- **Chiếu (Check):** Khi Vua bị một quân đối phương đe dọa trực tiếp (có thể bị bắt ở nước tiếp theo). Khi bị chiếu, bạn bắt buộc phải phản ứng bằng 1 trong 3 cách:
  1. Di chuyển Vua ra khỏi ô bị chiếu.
  2. Dùng một quân khác chắn đường chiếu.
  3. Bắt quân đang chiếu.
- **Chiếu bí (Checkmate):** Khi Vua bị chiếu và **không có bất kỳ cách nào** (trong 3 cách trên) để thoát khỏi tình trạng này. Ván cờ kết thúc và người đi nước chiếu bí giành chiến thắng.

### 2. Các trường hợp Hòa cờ (Draw)

Không phải ván cờ nào cũng có người thắng kẻ thua. Ván cờ hòa trong các trường hợp sau:

- **Hòa Pat (Stalemate):** Xảy ra khi đến lượt đi của một người chơi, Vua của họ **không bị chiếu** , nhưng họ lại **không có bất kỳ nước đi nào hợp lệ** (bất kỳ nước đi nào cũng khiến Vua bị chiếu).
- **Thiếu quân để chiếu bí (Insufficient Material):** Không bên nào có đủ quân cờ để tạo ra thế chiếu bí. Ví dụ: Vua đấu Vua; Vua & Tượng đấu Vua; Vua & Mã đấu Vua.
- **Luật lặp lại 3 lần (Threefold Repetition):** Nếu một thế cờ lặp lại chính xác 3 lần (cùng vị trí các quân, cùng lượt đi, cùng các quyền đặc biệt như nhập thành/bắt qua đường), người chơi có quyền yêu cầu hòa.
- **Luật 50 nước đi (50-Move Rule):** Nếu cả hai bên thực hiện 50 nước đi liên tiếp mà **không có quân Tốt nào di chuyển** và **không có quân nào bị bắt** , một trong hai người có quyền yêu cầu hòa.
- **Thỏa thuận hòa (Mutual Agreement):** Hai người chơi tự đồng ý hòa cờ bất cứ lúc nào trong ván đấu.

### 3. Luật thi đấu (Tournament Rules)

Nếu bạn chơi cờ vua ở cấp độ giải đấu hoặc thi đấu chính thức, có vài quy tắc bổ sung:

- **Chạm quân nào, đi quân đó (Touch-move rule):** Nếu bạn cố ý chạm vào quân cờ của mình, bạn bắt buộc phải di chuyển quân đó (nếu có nước đi hợp lệ). Nếu chạm vào quân đối phương, bạn phải ăn quân đó (nếu hợp lệ).
- **Sử dụng đồng hồ:** Trò chơi được giới hạn thời gian bằng đồng hồ cờ vua. Nếu bạn dùng hết thời gian của mình trước đối thủ (và đối thủ có đủ quân để chiếu bí), bạn sẽ thua ván đó bất kể thế cờ trên bàn đang thế nào.
