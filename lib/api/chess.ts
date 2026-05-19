/* API Service */

import type {
  GameState,
  AIAlgorithm,
  GameMode,
  AIConfig,
  AIStartResponse,
  AIStatusResponse,
  GameInfo,
  GameHistoryEntry,
} from "@/lib/types/chess";

const API_BASE = "/api/chess";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  newGame(
    mode: GameMode = "pvai",
    algorithm: AIAlgorithm = "alphabeta",
    depth = 4,
    iterations = 1000,
    whiteAI?: AIConfig,
    blackAI?: AIConfig
  ) {
    const body: Record<string, unknown> = { mode, algorithm, depth, iterations };
    if (whiteAI) body.white_ai = whiteAI;
    if (blackAI) body.black_ai = blackAI;

    return fetchJson<GameState>(`${API_BASE}/game/new`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getState(gameId: string) {
    return fetchJson<GameState>(`${API_BASE}/game/${gameId}/state`);
  },

  makeMove(
    gameId: string,
    from: [number, number],
    to: [number, number],
    promotion = "Q"
  ) {
    return fetchJson<GameState & { move_result: { success: boolean } }>(
      `${API_BASE}/game/${gameId}/move`,
      {
        method: "POST",
        body: JSON.stringify({ from, to, promotion }),
      }
    );
  },

  aiMove(
    gameId: string,
    algorithm: AIAlgorithm = "alphabeta",
    depth = 4,
    iterations = 1000
  ) {
    return fetchJson<AIStartResponse>(`${API_BASE}/game/${gameId}/ai-move`, {
      method: "POST",
      body: JSON.stringify({ algorithm, depth, iterations, max_time: 3.0 }),
    });
  },

  aiStatus(gameId: string) {
    return fetchJson<AIStatusResponse>(`${API_BASE}/game/${gameId}/ai-status`);
  },

  undoMove(gameId: string) {
    return fetchJson<GameState>(`${API_BASE}/game/${gameId}/undo`, {
      method: "POST",
    });
  },

  listGames() {
    return fetchJson<{ games: GameInfo[] }>(`${API_BASE}/games`);
  },

  deleteGame(gameId: string) {
    return fetchJson<{ message: string }>(`${API_BASE}/game/${gameId}`, {
      method: "DELETE",
    });
  },

  quitGame(gameId: string) {
    return fetchJson<{ message: string }>(`${API_BASE}/game/${gameId}/quit`, {
      method: "POST",
    });
  },

  getHistory() {
    return fetchJson<{ history: GameHistoryEntry[] }>(`${API_BASE}/history`);
  },

  deleteHistory(gameId: string) {
    return fetchJson<{ message: string }>(`${API_BASE}/history/${gameId}`, {
      method: "DELETE",
    });
  },

  clearAllHistory() {
    return fetchJson<{ message: string }>(`${API_BASE}/history/clear`, {
      method: "POST",
    });
  },
};
