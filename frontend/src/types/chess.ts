/* ============================================================================
   Chess TypeScript Types
   Định nghĩa các interface và type cho Chess Game
   ============================================================================ */

// ====================
// Basic Types
// ====================

/** Màu quân cờ */
export type PieceColor = 'white' | 'black';

/** Loại quân cờ: P=Pawn, N=Knight, B=Bishop, R=Rook, Q=Queen, K=King */
export type PieceType = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';

/** Chế độ chơi */
export type GameMode = 'pvp' | 'pvai' | 'aivai';

/** Thuật toán AI */
export type AIAlgorithm = 'alphabeta' | 'mcts';

/** Theme mode */
export type ThemeMode = 'light' | 'dark';

/** Giao diện bàn cờ */
export type BoardTheme = 'solid' | 'wood' | 'gradient';

// ====================
// Piece & Board
// ====================

/** Thông tin một quân cờ */
export interface Piece {
  type: PieceType;
  color: PieceColor;
}

/** Một ô trên bàn cờ - có thể là quân cờ hoặc null */
export type GridCell = Piece | null;

/** Trạng thái bàn cờ */
export interface BoardState {
  grid: (Piece | null)[][];
  turn: PieceColor;
}

// ====================
// Moves
// ====================

/** Dữ liệu một nước đi */
export interface MoveData {
  from: [number, number];
  to: [number, number];
}

/** Entry lịch sử nước đi */
export interface MoveHistoryEntry {
  from: [number, number];
  to: [number, number];
  piece: PieceType;
  captured: Piece | null;
  special: 'castle_kingside' | 'castle_queenside' | 'en_passant' | 'promotion' | null;
  ai?: boolean;
  algorithm?: AIAlgorithm;
  think_time?: number;
}

/** Kết quả thực hiện nước đi */
export interface MoveResult {
  success: boolean;
  error?: string;
  captured?: Piece | null;
  special_move?: string | null;
  promotion?: boolean;
  promotion_required?: boolean;
}

// ====================
// Game Status
// ====================

/** Trạng thái game */
export interface GameStatus {
  is_check: boolean;
  is_checkmate: boolean;
  is_stalemate: boolean;
  is_draw: boolean;
  game_over: boolean;
  winner: PieceColor | null;
  message: string;
  draw_reason?: 'stalemate' | 'insufficient_material' | 'threefold_repetition' | 'fifty_move_rule' | 'mutual_agreement' | 'timeout';
}

/** Thông tin game */
export interface GameInfo {
  id: string;
  mode: GameMode;
  ai_algorithm: AIAlgorithm;
  ai_depth: number;
  ai_iterations: number;
  status: 'active' | 'checkmate' | 'draw' | 'stalemate' | 'resigned' | 'timeout';
  winner: PieceColor | null;
  turn: PieceColor;
  move_count: number;
  move_history: MoveHistoryEntry[];
  captured_white: PieceType[];
  captured_black: PieceType[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  settings?: GameSettings;
  // AI vs AI specific
  white_ai?: AIConfig;
  black_ai?: AIConfig;
}

/** Cấu hình AI */
export interface AIConfig {
  algorithm: AIAlgorithm;
  depth: number;
  iterations: number;
}

/** Cài đặt game */
export interface GameSettings {
  timer_enabled: boolean;
  timer_minutes: number;
  show_legal_moves: boolean;
}

// ====================
// Timer
// ====================

/** Trạng thái đồng hồ */
export interface TimerState {
  white_time: number; // seconds remaining
  black_time: number; // seconds remaining
  active_color: PieceColor | null;
  is_running: boolean;
}

// ====================
// API Responses
// ====================

/** Response từ API game state */
export interface GameState {
  game_id: string;
  board: BoardState;
  status: GameStatus;
  legal_moves: MoveData[];
  legal_moves_dict: Record<string, [number, number][]>;
  game_info: GameInfo;
  move_result?: MoveResult;
  promotion_required?: boolean;
  from?: [number, number];
  to?: [number, number];
}

/** Response khi khởi tạo AI task */
export interface AIStartResponse {
  status: 'calculating' | 'error';
  task_id: string;
  game_id: string;
  error?: string;
}

/** Response khi polling AI status */
export interface AIStatusResponse {
  status: 'calculating' | 'done' | 'error' | 'cancelled' | 'no_task';
  status_ai?: 'done' | 'error';
  task_id?: string;
  game_id?: string;
  board?: BoardState;
  legal_moves?: MoveData[];
  legal_moves_dict?: Record<string, [number, number][]>;
  game_info?: GameInfo;
  ai_info?: AIInfo;
  error?: string;
}

/** Thông tin AI sau khi đi */
export interface AIInfo {
  algorithm: AIAlgorithm;
  move: { from: [number, number]; to: [number, number] };
  think_time: number;
}

// ====================
// History (for completed games)
// ====================

/** Lịch sử ván đấu đã hoàn thành */
export interface GameHistoryEntry {
  id: string;
  mode: GameMode;
  ai_algorithm: AIAlgorithm;
  status: 'checkmate' | 'draw' | 'stalemate' | 'resigned' | 'timeout';
  winner: PieceColor | null;
  move_count: number;
  created_at: string;
  completed_at: string;
  // For AI vs AI, store which AI configs were used
  white_ai?: AIConfig;
  black_ai?: AIConfig;
}
