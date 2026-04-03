/* ============================================================================
   Chess Utility Functions
   ============================================================================ */

/** Map piece type + color to SVG filename */
const PIECE_FILE_MAP: Record<string, string> = {
  'P-white': 'pawn-w',
  'P-black': 'pawn-b',
  'N-white': 'knight-w',
  'N-black': 'knight-b',
  'B-white': 'bishop-w',
  'B-black': 'bishop-b',
  'R-white': 'rook-w',
  'R-black': 'rook-b',
  'Q-white': 'queen-w',
  'Q-black': 'queen-b',
  'K-white': 'king-w',
  'K-black': 'king-b',
};

const PIECE_NAMES: Record<string, string> = {
  P: 'Pawn', N: 'Knight', B: 'Bishop',
  R: 'Rook', Q: 'Queen', K: 'King',
};

const PIECE_NAMES_VI: Record<string, string> = {
  P: 'Tốt', N: 'Mã', B: 'Tượng',
  R: 'Xe', Q: 'Hậu', K: 'Vua',
};

export function getPieceImageSrc(type: string, color: string): string {
  const key = `${type}-${color}`;
  const filename = PIECE_FILE_MAP[key];
  return filename ? `/pieces/2d/${filename}.svg` : '';
}

export function getPieceName(type: string, vietnamese = false): string {
  return vietnamese ? PIECE_NAMES_VI[type] || type : PIECE_NAMES[type] || type;
}

/** Convert grid position to algebraic notation (e.g. [0,0] => "a8") */
export function posToAlgebraic(row: number, col: number): string {
  const file = String.fromCharCode(97 + col); // a-h
  const rank = 8 - row; // 1-8
  return `${file}${rank}`;
}

/** Convert move to algebraic string (e.g. "e2→e4") */
export function moveToString(from: [number, number], to: [number, number]): string {
  return `${posToAlgebraic(from[0], from[1])}→${posToAlgebraic(to[0], to[1])}`;
}

/** Column labels */
export const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/** Row labels */
export const ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
