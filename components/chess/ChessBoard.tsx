"use client";

import { getPieceImageSrc, cn } from "@/lib/utils/chess";
import type { Piece, BoardState } from "@/lib/types/chess";
import Image from "next/image";

interface ChessBoardProps {
  board: BoardState;
  selectedSquare: [number, number] | null;
  highlightedMoves: [number, number][];
  lastMove: { from: [number, number]; to: [number, number] } | null;
  isCheck: boolean;
  kingPosition?: [number, number] | null;
  onSquareClick: (row: number, col: number) => void;
  disabled?: boolean;
}

const COL_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ROW_LABELS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function ChessPiece({ piece }: { piece: Piece }) {
  const src = getPieceImageSrc(piece.type, piece.color);
  return (
    <Image
      src={src}
      alt={`${piece.color} ${piece.type}`}
      width={64}
      height={64}
      className="pointer-events-none h-full w-full select-none object-contain drop-shadow-lg"
      draggable={false}
    />
  );
}

export function ChessBoard({
  board,
  selectedSquare,
  highlightedMoves,
  lastMove,
  isCheck,
  kingPosition,
  onSquareClick,
  disabled = false,
}: ChessBoardProps) {
  const isSelected = (row: number, col: number) =>
    selectedSquare?.[0] === row && selectedSquare?.[1] === col;

  const isHighlighted = (row: number, col: number) =>
    highlightedMoves.some((m) => m[0] === row && m[1] === col);

  const isLastMove = (row: number, col: number) =>
    (lastMove?.from[0] === row && lastMove?.from[1] === col) ||
    (lastMove?.to[0] === row && lastMove?.to[1] === col);

  const isKingInCheck = (row: number, col: number) =>
    isCheck && kingPosition?.[0] === row && kingPosition?.[1] === col;

  return (
    <div className="flex flex-col items-center">
      {/* Board with coordinates */}
      <div className="flex">
        {/* Row labels left */}
        <div className="flex flex-col justify-around pr-2">
          {ROW_LABELS.map((label) => (
            <span
              key={label}
              className="flex h-10 w-4 items-center justify-center text-xs font-medium text-muted-foreground sm:h-12 md:h-14 lg:h-16"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Board */}
        <div className="relative overflow-hidden rounded-lg shadow-2xl ring-4 ring-border/50">
          <div className="grid grid-cols-8">
            {board.grid.map((row, rowIdx) =>
              row.map((piece, colIdx) => {
                const isLight = (rowIdx + colIdx) % 2 === 0;
                const selected = isSelected(rowIdx, colIdx);
                const highlighted = isHighlighted(rowIdx, colIdx);
                const lastMoveSquare = isLastMove(rowIdx, colIdx);
                const inCheck = isKingInCheck(rowIdx, colIdx);

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => !disabled && onSquareClick(rowIdx, colIdx)}
                    disabled={disabled}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center transition-all sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16",
                      isLight ? "bg-board-light" : "bg-board-dark",
                      selected && "ring-4 ring-primary ring-inset glow-gold",
                      lastMoveSquare && "bg-board-highlight",
                      inCheck && "bg-board-check",
                      !disabled && "cursor-pointer hover:brightness-110",
                      disabled && "cursor-default"
                    )}
                  >
                    {/* Highlight dot for legal moves */}
                    {highlighted && (
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          piece ? "z-10" : ""
                        )}
                      >
                        {piece ? (
                          <div className="absolute inset-0 rounded-full ring-4 ring-inset ring-success/60" />
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-success/60 shadow-lg sm:h-4 sm:w-4" />
                        )}
                      </div>
                    )}

                    {/* Piece */}
                    {piece && (
                      <div className="relative z-0 h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12">
                        <ChessPiece piece={piece} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Row labels right */}
        <div className="flex flex-col justify-around pl-2">
          {ROW_LABELS.map((label) => (
            <span
              key={label}
              className="flex h-10 w-4 items-center justify-center text-xs font-medium text-muted-foreground sm:h-12 md:h-14 lg:h-16"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Column labels */}
      <div className="mt-2 flex justify-center">
        <div className="w-4" /> {/* Spacer for left labels */}
        <div className="flex">
          {COL_LABELS.map((label) => (
            <span
              key={label}
              className="flex h-4 w-10 items-center justify-center text-xs font-medium text-muted-foreground sm:w-12 md:w-14 lg:w-16"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="w-4" /> {/* Spacer for right labels */}
      </div>
    </div>
  );
}
