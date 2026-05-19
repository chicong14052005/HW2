"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { api } from "@/lib/api/chess";
import { useState, useEffect } from "react";
import {
  History,
  Trophy,
  Bot,
  Users,
  Zap,
  Clock,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils/chess";
import type { GameHistoryEntry } from "@/lib/types/chess";

export default function GameHistoryPage() {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data.history || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (gameId: string) => {
    try {
      await api.deleteHistory(gameId);
      setHistory(history.filter((h) => h.id !== gameId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử?")) return;

    try {
      await api.clearAllHistory();
      setHistory([]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getModeIcon = (mode: string) => {
    if (mode === "pvai") return <Bot className="h-4 w-4" />;
    if (mode === "pvp") return <Users className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getModeLabel = (mode: string) => {
    if (mode === "pvai") return "vs AI";
    if (mode === "pvp") return "vs Người";
    return "AI vs AI";
  };

  const getResultLabel = (entry: GameHistoryEntry) => {
    if (entry.status === "checkmate") {
      return `${entry.winner === "white" ? "Trắng" : "Đen"} thắng (Chiếu hết)`;
    }
    if (entry.status === "stalemate") return "Hòa (Hết nước)";
    if (entry.status === "draw") return "Hòa";
    if (entry.status === "resigned") {
      return `${entry.winner === "white" ? "Trắng" : "Đen"} thắng (Đầu hàng)`;
    }
    if (entry.status === "timeout") {
      return `${entry.winner === "white" ? "Trắng" : "Đen"} thắng (Hết giờ)`;
    }
    return entry.status;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Lịch Sử Ván Đấu</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Xem lại các ván đấu đã hoàn thành
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm text-destructive transition-all hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Xóa tất cả
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <History className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">
                Chưa có lịch sử ván đấu
              </h2>
              <p className="mt-2 text-muted-foreground">
                Các ván đấu đã hoàn thành sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="glass group flex items-center justify-between rounded-xl p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex items-center gap-4">
                    {/* Result Icon */}
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg",
                        entry.winner
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {entry.winner ? (
                        <Trophy className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>

                    {/* Game Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            entry.mode === "pvai"
                              ? "bg-primary/10 text-primary"
                              : entry.mode === "pvp"
                                ? "bg-success/10 text-success"
                                : "bg-info/10 text-info"
                          )}
                        >
                          {getModeIcon(entry.mode)}
                          {getModeLabel(entry.mode)}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {entry.ai_algorithm === "alphabeta"
                            ? "Alpha-Beta"
                            : "MCTS"}
                        </span>
                      </div>

                      <p className="mt-1 font-medium">
                        {getResultLabel(entry)}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {entry.move_count} nước đi •{" "}
                        {formatDate(entry.completed_at)}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
