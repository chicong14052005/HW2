/* ============================================================================
   Board Component - Bàn cờ 8x8
   ============================================================================ */

import React from 'react';
import Square from './Square';
import { COL_LABELS, ROW_LABELS } from '../utils/chess';
import type { BoardState, GameStatus, BoardTheme } from '../types/chess';
import './Board.css';

interface BoardProps {
  board: BoardState;
  status: GameStatus;
  selectedSquare: [number, number] | null;
  highlightedMoves: [number, number][];
  lastMove: { from: [number, number]; to: [number, number] } | null;
  onSquareClick: (row: number, col: number) => void;
  animationSpeed: number;
  flipped?: boolean;
  boardTheme: BoardTheme;
}

const Board: React.FC<BoardProps> = ({
  board, status, selectedSquare, highlightedMoves, lastMove,
  onSquareClick, animationSpeed, flipped = false, boardTheme,
}) => {
  // Tìm vị trí Vua đang bị chiếu
  let checkKingPos: [number, number] | null = null;
  if (status.is_check) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board.grid[r][c];
        if (p && p.type === 'K' && p.color === board.turn) {
          checkKingPos = [r, c];
        }
      }
    }
  }

  const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className={`board-container theme-${boardTheme}`}>
      {/* Row labels (numbers) */}
      <div className="board-row-labels">
        {rows.map((r) => (
          <div key={r} className="board-label">{ROW_LABELS[r]}</div>
        ))}
      </div>

      <div className="board-wrapper">
        {/* Board grid */}
        <div className="board-grid">
          {rows.map((r) =>
            cols.map((c) => {
              const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
              const isLegalMove = highlightedMoves.some(([mr, mc]) => mr === r && mc === c);
              const isLastFrom = lastMove?.from[0] === r && lastMove?.from[1] === c;
              const isLastTo = lastMove?.to[0] === r && lastMove?.to[1] === c;
              const isCheck = checkKingPos?.[0] === r && checkKingPos?.[1] === c;

              return (
                <Square
                  key={`${r}-${c}`}
                  row={r}
                  col={c}
                  piece={board.grid[r][c]}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  isLastMoveFrom={isLastFrom}
                  isLastMoveTo={isLastTo}
                  lastMoveFrom={isLastTo ? lastMove?.from : undefined}
                  isCheck={isCheck}
                  animationSpeed={animationSpeed}
                  onClick={onSquareClick}
                />
              );
            })
          )}
        </div>

        {/* Col labels (letters) */}
        <div className="board-col-labels">
          {cols.map((c) => (
            <div key={c} className="board-label">{COL_LABELS[c]}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Board);
