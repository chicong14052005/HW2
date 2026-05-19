/* Chess TypeScript Types */

export type PieceColor = "white" | "black";
export type PieceType = "P" | "N" | "B" | "R" | "Q" | "K";
export type GameMode = "pvp" | "pvai" | "aivai";
export type AIAlgorithm = "alphabeta" | "mcts";

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type GridCell = Piece | null;

export interface BoardState {
  grid: (Piece | null)[][];
  turn: PieceColor;
}

export interface MoveData {
  from: [number, number];
  to: [number, number];
}

export interface MoveHistoryEntry {
  from: [number, number];
  to: [number, number];
  piece: PieceType;
  captured: Piece | null;
  special:
    | "castle_kingside"
    | "castle_queenside"
    | "en_passant"
    | "promotion"
    | null;
  ai?: boolean;
  algorithm?: AIAlgorithm;
  think_time?: number;
}

export interface MoveResult {
  success: boolean;
  error?: string;
  captured?: Piece | null;
  special_move?: string | null;
  promotion?: boolean;
  promotion_required?: boolean;
}

export interface GameStatus {
  is_check: boolean;
  is_checkmate: boolean;
  is_stalemate: boolean;
  is_draw: boolean;
  game_over: boolean;
  winner: PieceColor | null;
  message: string;
  draw_reason?:
    | "stalemate"
    | "insufficient_material"
    | "threefold_repetition"
    | "fifty_move_rule"
    | "mutual_agreement"
    | "timeout";
}

export interface GameInfo {
  id: string;
  mode: GameMode;
  ai_algorithm: AIAlgorithm;
  ai_depth: number;
  ai_iterations: number;
  status: "active" | "checkmate" | "draw" | "stalemate" | "resigned" | "timeout";
  winner: PieceColor | null;
  turn: PieceColor;
  move_count: number;
  move_history: MoveHistoryEntry[];
  captured_white: PieceType[];
  captured_black: PieceType[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  white_ai?: AIConfig;
  black_ai?: AIConfig;
}

export interface AIConfig {
  algorithm: AIAlgorithm;
  depth: number;
  iterations: number;
}

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

export interface AIStartResponse {
  status: "calculating" | "error";
  task_id: string;
  game_id: string;
  error?: string;
}

export interface AIStatusResponse {
  status: "calculating" | "done" | "error" | "cancelled" | "no_task";
  status_ai?: "done" | "error";
  task_id?: string;
  game_id?: string;
  board?: BoardState;
  legal_moves?: MoveData[];
  legal_moves_dict?: Record<string, [number, number][]>;
  game_info?: GameInfo;
  ai_info?: AIInfo;
  error?: string;
}

export interface AIInfo {
  algorithm: AIAlgorithm;
  move: { from: [number, number]; to: [number, number] };
  think_time: number;
}

export interface GameHistoryEntry {
  id: string;
  mode: GameMode;
  ai_algorithm: AIAlgorithm;
  status: "checkmate" | "draw" | "stalemate" | "resigned" | "timeout";
  winner: PieceColor | null;
  move_count: number;
  created_at: string;
  completed_at: string;
  white_ai?: AIConfig;
  black_ai?: AIConfig;
}

// User profile type from Supabase
export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  win_rate: number;
}
