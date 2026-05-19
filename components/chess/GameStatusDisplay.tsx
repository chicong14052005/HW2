"use client";

import type { GameStatus, GameInfo } from "@/lib/types/chess";
import {
  Crown,
  Swords,
  Clock,
  Bot,
  User,
  AlertTriangle,
  Trophy,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils/chess";

interface GameStatusDisplayProps {
  status: GameStatus;
  gameInfo: GameInfo;
  isAiThinking: boolean;
}

export function GameStatusDisplay({
  status,
  gameInfo,
  isAiThinking,
}: GameStatusDisplayProps) {
  const getTurnIcon = () => {
    if (gameInfo.mode === "pvp") {
      return <User className="h-5 w-5" />;
    }
    if (gameInfo.mode === "aivai") {
      return <Bot className="h-5 w-5" />;
    }
    // pvai
    return gameInfo.turn === "white" ? (
      <User className="h-5 w-5" />
    ) : (
      <Bot className="h-5 w-5" />
    );
  };

  const getStatusColor = () => {
    if (status.game_over) {
      if (status.winner) return "text-success";
      return "text-warning";
    }
    if (status.is_check) return "text-destructive";
    return "text-foreground";
  };

  const getStatusMessage = () => {
    if (status.game_over) {
      if (status.is_checkmate) {
        return `Chiếu hết! ${status.winner === "white" ? "Trắng" : "Đen"} thắng!`;
      }
      if (status.is_stalemate) {
        return "Hết nước - Hòa!";
      }
      if (status.is_draw) {
        const reasons: Record<string, string> = {
          insufficient_material: "Không đủ quân",
          threefold_repetition: "Lặp lại 3 lần",
          fifty_move_rule: "Quy tắc 50 nước",
        };
        return `Hòa - ${reasons[status.draw_reason || ""] || "Hòa"}`;
      }
      return status.message;
    }

    if (isAiThinking) {
      return "AI đang suy nghĩ...";
    }

    if (status.is_check) {
      return `Chiếu! Lượt ${gameInfo.turn === "white" ? "Trắng" : "Đen"}`;
    }

    return `Lượt ${gameInfo.turn === "white" ? "Trắng" : "Đen"}`;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3",
        status.is_check && !status.game_over && "border border-destructive/50",
        status.game_over && status.winner && "border border-success/50",
        status.game_over && !status.winner && "border border-warning/50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Turn indicator */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            gameInfo.turn === "white"
              ? "border-2 border-foreground bg-foreground text-background"
              : "border-2 border-foreground bg-background text-foreground"
          )}
        >
          {status.game_over ? (
            status.winner ? (
              <Trophy className="h-5 w-5" />
            ) : (
              <Flag className="h-5 w-5" />
            )
          ) : status.is_check ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            getTurnIcon()
          )}
        </div>

        {/* Status text */}
        <div>
          <p className={cn("font-semibold", getStatusColor())}>
            {getStatusMessage()}
          </p>
          <p className="text-sm text-muted-foreground">
            Nước đi: {gameInfo.move_count} |{" "}
            {gameInfo.mode === "pvp"
              ? "Người vs Người"
              : gameInfo.mode === "pvai"
                ? "Người vs AI"
                : "AI vs AI"}
          </p>
        </div>
      </div>

      {/* AI thinking indicator */}
      {isAiThinking && (
        <div className="flex items-center gap-2 text-primary">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      )}
    </div>
  );
}
