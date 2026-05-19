"use client";

import { getPieceImageSrc, moveToString } from "@/lib/utils/chess";
import type { MoveHistoryEntry } from "@/lib/types/chess";
import Image from "next/image";
import { Clock, Bot, User } from "lucide-react";

interface MoveHistoryProps {
  moves: MoveHistoryEntry[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  if (moves.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Chưa có nước đi nào</p>
      </div>
    );
  }

  // Group moves into pairs (white, black)
  const movePairs: [MoveHistoryEntry, MoveHistoryEntry | null][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1] || null]);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {movePairs.map(([whiteMove, blackMove], idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-lg bg-secondary/30 px-2 py-1.5 text-sm"
          >
            <span className="w-6 font-mono text-muted-foreground">
              {idx + 1}.
            </span>

            {/* White move */}
            <div className="flex flex-1 items-center gap-1.5">
              <Image
                src={getPieceImageSrc(whiteMove.piece, "white")}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="font-mono">
                {moveToString(whiteMove.from, whiteMove.to)}
              </span>
              {whiteMove.ai && (
                <Bot className="h-3 w-3 text-primary" title="AI" />
              )}
              {whiteMove.think_time && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {whiteMove.think_time.toFixed(1)}s
                </span>
              )}
            </div>

            {/* Black move */}
            {blackMove && (
              <div className="flex flex-1 items-center gap-1.5">
                <Image
                  src={getPieceImageSrc(blackMove.piece, "black")}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span className="font-mono">
                  {moveToString(blackMove.from, blackMove.to)}
                </span>
                {blackMove.ai && (
                  <Bot className="h-3 w-3 text-primary" title="AI" />
                )}
                {blackMove.think_time && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {blackMove.think_time.toFixed(1)}s
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
