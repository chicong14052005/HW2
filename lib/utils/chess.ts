/* Chess Utility Functions */

const PIECE_FILE_MAP: Record<string, string> = {
  "P-white": "pawn-w",
  "P-black": "pawn-b",
  "N-white": "knight-w",
  "N-black": "knight-b",
  "B-white": "bishop-w",
  "B-black": "bishop-b",
  "R-white": "rook-w",
  "R-black": "rook-b",
  "Q-white": "queen-w",
  "Q-black": "queen-b",
  "K-white": "king-w",
  "K-black": "king-b",
};

const PIECE_NAMES: Record<string, string> = {
  P: "Pawn",
  N: "Knight",
  B: "Bishop",
  R: "Rook",
  Q: "Queen",
  K: "King",
};

const PIECE_NAMES_VI: Record<string, string> = {
  P: "Tốt",
  N: "Mã",
  B: "Tượng",
  R: "Xe",
  Q: "Hậu",
  K: "Vua",
};

export function getPieceImageSrc(type: string, color: string): string {
  const key = `${type}-${color}`;
  const filename = PIECE_FILE_MAP[key];
  return filename ? `/pieces/2d/${filename}.svg` : "";
}

export function getPieceName(type: string, vietnamese = false): string {
  return vietnamese ? PIECE_NAMES_VI[type] || type : PIECE_NAMES[type] || type;
}

export function posToAlgebraic(row: number, col: number): string {
  const file = String.fromCharCode(97 + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

export function moveToString(
  from: [number, number],
  to: [number, number]
): string {
  return `${posToAlgebraic(from[0], from[1])}→${posToAlgebraic(to[0], to[1])}`;
}

export const COL_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const ROW_LABELS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
