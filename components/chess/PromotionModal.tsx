"use client";

import { getPieceImageSrc, getPieceName } from "@/lib/utils/chess";
import type { PieceType, PieceColor } from "@/lib/types/chess";
import Image from "next/image";
import { X } from "lucide-react";

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (piece: string) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: PieceType[] = ["Q", "R", "B", "N"];

export function PromotionModal({
  color,
  onSelect,
  onCancel,
}: PromotionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass animate-fade-in rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chọn quân phong cấp</h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-3">
          {PROMOTION_PIECES.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="group relative flex flex-col items-center rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary hover:bg-secondary"
            >
              <div className="h-16 w-16">
                <Image
                  src={getPieceImageSrc(pieceType, color)}
                  alt={getPieceName(pieceType, true)}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain drop-shadow-lg"
                />
              </div>
              <span className="mt-2 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {getPieceName(pieceType, true)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
