"use client";

import { useChessGame } from "@/hooks/useChessGame";
import { Header } from "@/components/layout/Header";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { CapturedPieces } from "@/components/chess/CapturedPieces";
import { GameStatusDisplay } from "@/components/chess/GameStatusDisplay";
import { PromotionModal } from "@/components/chess/PromotionModal";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  Play,
  RotateCcw,
  Home,
  Bot,
  Users,
  Zap,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { GameMode, AIAlgorithm } from "@/lib/types/chess";
import { cn } from "@/lib/utils/chess";

function PlayPageContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as GameMode) || "pvai";

  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const [aiAlgorithm, setAiAlgorithm] = useState<AIAlgorithm>("alphabeta");
  const [aiDepth, setAiDepth] = useState(3);

  const {
    gameId,
    board,
    status,
    selectedSquare,
    highlightedMoves,
    lastMove,
    isLoading,
    isAiThinking,
    error,
    gameInfo,
    moveHistory,
    pendingPromotion,
    newGame,
    selectSquare,
    undoMove,
    quitGame,
    startAiVsAi,
    confirmPromotion,
  } = useChessGame();

  // Find king position for check highlight
  const getKingPosition = (): [number, number] | null => {
    if (!board || !status?.is_check) return null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.grid[row][col];
        if (piece?.type === "K" && piece.color === board.turn) {
          return [row, col];
        }
      }
    }
    return null;
  };

  const handleStartGame = () => {
    if (selectedMode === "aivai") {
      startAiVsAi(aiAlgorithm, aiDepth, 500);
    } else {
      newGame(selectedMode, aiAlgorithm, aiDepth, 500);
    }
  };

  // Game menu (before game starts)
  if (!gameId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="glass w-full max-w-lg rounded-xl p-8">
            <h1 className="mb-6 text-center text-2xl font-bold">
              Bắt Đầu Ván Đấu
            </h1>

            {/* Game Mode Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                Chế độ chơi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "pvai" as GameMode, icon: Bot, label: "vs AI" },
                  { mode: "pvp" as GameMode, icon: Users, label: "vs Người" },
                  { mode: "aivai" as GameMode, icon: Zap, label: "AI vs AI" },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                      selectedMode === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-secondary"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Settings (for pvai and aivai modes) */}
            {selectedMode !== "pvp" && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Thuật toán AI
                  </label>
                  <div className="relative">
                    <select
                      value={aiAlgorithm}
                      onChange={(e) =>
                        setAiAlgorithm(e.target.value as AIAlgorithm)
                      }
                      className="w-full appearance-none rounded-lg border border-border bg-secondary py-3 pl-4 pr-10 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="alphabeta">
                        Alpha-Beta Pruning (Nhanh, Chính xác)
                      </option>
                      <option value="mcts">MCTS (Sáng tạo, Đa dạng)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Độ khó:{" "}
                    {aiDepth <= 2
                      ? "Dễ"
                      : aiDepth <= 4
                        ? "Trung bình"
                        : "Khó"}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={aiDepth}
                    onChange={(e) => setAiDepth(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Dễ</span>
                    <span>Trung bình</span>
                    <span>Khó</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleStartGame}
              disabled={isLoading}
              className="btn-glow flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang tạo ván đấu...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Bắt Đầu
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Game in progress
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Game Board Section */}
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          {board && status && gameInfo && (
            <>
              {/* Status Display */}
              <div className="mb-4 w-full max-w-lg">
                <GameStatusDisplay
                  status={status}
                  gameInfo={gameInfo}
                  isAiThinking={isAiThinking}
                />
              </div>

              {/* Chess Board */}
              <ChessBoard
                board={board}
                selectedSquare={selectedSquare}
                highlightedMoves={highlightedMoves}
                lastMove={lastMove}
                isCheck={status.is_check}
                kingPosition={getKingPosition()}
                onSquareClick={selectSquare}
                disabled={isLoading || isAiThinking || status.game_over}
              />

              {/* Game Controls */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={undoMove}
                  disabled={
                    isLoading ||
                    isAiThinking ||
                    moveHistory.length === 0 ||
                    gameInfo.mode === "aivai"
                  }
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Hoàn tác
                </button>

                <button
                  onClick={quitGame}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-all hover:bg-secondary"
                >
                  <Home className="h-4 w-4" />
                  Thoát
                </button>

                {status.game_over && (
                  <button
                    onClick={handleStartGame}
                    className="btn-glow flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" />
                    Ván mới
                  </button>
                )}
              </div>
            </>
          )}

          {/* Loading state */}
          {isLoading && !board && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Đang tải...</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full border-t border-border bg-card/50 lg:w-80 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col p-4">
            {/* Captured Pieces */}
            {gameInfo && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Quân bị bắt
                </h3>
                <CapturedPieces
                  whiteCaptured={gameInfo.captured_white || []}
                  blackCaptured={gameInfo.captured_black || []}
                />
              </div>
            )}

            {/* Move History */}
            <div className="flex-1 overflow-hidden rounded-lg border border-border bg-secondary/30">
              <div className="border-b border-border px-3 py-2">
                <h3 className="text-sm font-medium">Lịch sử nước đi</h3>
              </div>
              <div className="h-64 overflow-y-auto lg:h-[calc(100vh-400px)]">
                <MoveHistory moves={moveHistory} />
              </div>
            </div>

            {/* AI Info */}
            {gameInfo && gameInfo.mode !== "pvp" && (
              <div className="mt-4 rounded-lg bg-secondary/30 p-3">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Thông tin AI
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    Thuật toán:{" "}
                    <span className="font-medium">
                      {gameInfo.ai_algorithm === "alphabeta"
                        ? "Alpha-Beta"
                        : "MCTS"}
                    </span>
                  </p>
                  <p>
                    Độ sâu:{" "}
                    <span className="font-medium">{gameInfo.ai_depth}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Promotion Modal */}
      {pendingPromotion && board && (
        <PromotionModal
          color={board.turn}
          onSelect={confirmPromotion}
          onCancel={() => quitGame()}
        />
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PlayPageContent />
    </Suspense>
  );
}
