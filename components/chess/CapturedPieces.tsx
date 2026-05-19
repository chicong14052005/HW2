"use client";

import { getPieceImageSrc } from "@/lib/utils/chess";
import type { PieceType, PieceColor } from "@/lib/types/chess";
import Image from "next/image";

interface CapturedPiecesProps {
  whiteCaptured: PieceType[];
  blackCaptured: PieceType[];
}

const PIECE_VALUES: Record<PieceType, number> = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
  K: 0,
};

function calculateMaterialAdvantage(
  whiteCaptured: PieceType[],
  blackCaptured: PieceType[]
): number {
  const whiteValue = whiteCaptured.reduce(
    (sum, p) => sum + PIECE_VALUES[p],
    0
  );
  const blackValue = blackCaptured.reduce(
    (sum, p) => sum + PIECE_VALUES[p],
    0
  );
  return blackValue - whiteValue; // Positive = white advantage
}

function PiecesRow({
  pieces,
  color,
}: {
  pieces: PieceType[];
  color: PieceColor;
}) {
  // Sort by value (highest first)
  const sortedPieces = [...pieces].sort(
    (a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]
  );

  return (
    <div className="flex flex-wrap gap-0.5">
      {sortedPieces.map((piece, idx) => (
        <Image
          key={idx}
          src={getPieceImageSrc(piece, color)}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 opacity-80"
        />
      ))}
    </div>
  );
}

export function CapturedPieces({
  whiteCaptured,
  blackCaptured,
}: CapturedPiecesProps) {
  const advantage = calculateMaterialAdvantage(whiteCaptured, blackCaptured);

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-secondary/30 p-3">
      {/* Black captured (by white) */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-foreground" />
        <div className="flex-1">
          <PiecesRow pieces={whiteCaptured} color="black" />
        </div>
        {advantage > 0 && (
          <span className="text-sm font-medium text-success">+{advantage}</span>
        )}
      </div>

      {/* White captured (by black) */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-foreground bg-background" />
        <div className="flex-1">
          <PiecesRow pieces={blackCaptured} color="white" />
        </div>
        {advantage < 0 && (
          <span className="text-sm font-medium text-success">
            +{Math.abs(advantage)}
          </span>
        )}
      </div>
    </div>
  );
}
