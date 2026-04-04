/* ============================================================================
   Square Component - Ô vuông trên bàn cờ
   ============================================================================ */

import React from 'react';
import Piece from './Piece';
import type { GridCell } from '../types/chess';
import './Square.css';

interface SquareProps {
  row: number;
  col: number;
  piece: GridCell;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMoveFrom: boolean;
  isLastMoveTo: boolean;
  isCheck: boolean;
  lastMoveFrom?: [number, number];
  animationSpeed?: number;
  onClick: (row: number, col: number) => void;
}

const Square: React.FC<SquareProps> = ({
  row, col, piece,
  isSelected, isLegalMove, isLastMoveFrom, isLastMoveTo, isCheck,
  lastMoveFrom, animationSpeed,
  onClick,
}) => {
  const isLight = (row + col) % 2 === 0;
  const isCapture = isLegalMove && piece !== null;

  const classNames = [
    'square',
    isLight ? 'square-light' : 'square-dark',
    isSelected && 'square-selected',
    isLastMoveFrom && 'square-last-from',
    isLastMoveTo && 'square-last-to',
    isCheck && 'square-check',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      onClick={() => onClick(row, col)}
      data-row={row}
      data-col={col}
    >
      {piece && (
        <Piece 
          type={piece.type} 
          color={piece.color} 
          currentRow={row}
          currentCol={col}
          lastMoveFrom={lastMoveFrom}
          animationSpeed={animationSpeed}
        />
      )}
      {isLegalMove && !isCapture && <span className="legal-move-dot" />}
      {isLegalMove && isCapture && <span className="legal-capture-ring" />}
    </div>
  );
};

export default React.memo(Square);
