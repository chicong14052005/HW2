/* ============================================================================
   API Service - Giao tiếp với Flask Backend
   ============================================================================ */

import type { GameState, MoveData, AIAlgorithm, GameMode, AIConfig } from '../types/chess';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  /** Tạo game mới */
  newGame(
    mode: GameMode = 'pvai', 
    algorithm: AIAlgorithm = 'alphabeta', 
    depth = 4, 
    iterations = 1000,
    whiteAI?: AIConfig,
    blackAI?: AIConfig
  ) {
    const body: Record<string, unknown> = { mode, algorithm, depth, iterations };
    if (whiteAI) body.white_ai = whiteAI;
    if (blackAI) body.black_ai = blackAI;
    
    return fetchJson<GameState>(`${API_BASE}/game/new`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /** Lấy trạng thái game hiện tại */
  getState(gameId: string) {
    return fetchJson<GameState>(`${API_BASE}/game/${gameId}/state`);
  },

  /** Thực hiện nước đi */
  makeMove(gameId: string, from: [number, number], to: [number, number], promotion = 'Q') {
    return fetchJson<GameState & { move_result: import('../types/chess').MoveResult }>(`${API_BASE}/game/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ from, to, promotion }),
    });
  },

  /** AI thực hiện nước đi */
  aiMove(gameId: string, algorithm: import('../types/chess').AIAlgorithm = 'alphabeta', depth = 4, iterations = 1000) {
    return fetchJson<import('../types/chess').AIStartResponse>(`${API_BASE}/game/${gameId}/ai-move`, {
      method: 'POST',
      body: JSON.stringify({ algorithm, depth, iterations, max_time: 3.0 }),
    });
  },

  /** Kiểm tra trạng thái AI */
  aiStatus(gameId: string) {
    return fetchJson<import('../types/chess').AIStatusResponse>(`${API_BASE}/game/${gameId}/ai-status`);
  },

  /** Lấy nước đi hợp lệ cho 1 ô */
  getLegalMoves(gameId: string, row?: number, col?: number) {
    const params = row !== undefined && col !== undefined ? `?row=${row}&col=${col}` : '';
    return fetchJson<{ moves: MoveData[] }>(`${API_BASE}/game/${gameId}/legal-moves${params}`);
  },

  /** Hoàn tác nước đi */
  undoMove(gameId: string) {
    return fetchJson<GameState>(`${API_BASE}/game/${gameId}/undo`, { method: 'POST' });
  },

  /** Danh sách tất cả games */
  listGames() {
    return fetchJson<{ games: import('../types/chess').GameInfo[] }>(`${API_BASE}/games`);
  },

  /** Xóa game */
  deleteGame(gameId: string) {
    return fetchJson<{ message: string }>(`${API_BASE}/game/${gameId}`, { method: 'DELETE' });
  },

  /** Thoát game */
  quitGame(gameId: string) {
    return fetchJson<{ message: string }>(`${API_BASE}/game/${gameId}/quit`, { method: 'POST' });
  },

  /** Lịch sử ván đấu */
  getHistory() {
    return fetchJson<{ history: import('../types/chess').GameHistoryEntry[] }>(`${API_BASE}/history`);
  },

  /** Xóa entry lịch sử */
  deleteHistory(gameId: string) {
    return fetchJson<{ message: string }>(`${API_BASE}/history/${gameId}`, { method: 'DELETE' });
  },
  
  /** Xóa toàn bộ lịch sử */
  clearAllHistory() {
    return fetchJson<{ message: string }>(`${API_BASE}/history/clear`, { method: 'POST' });
  },
};
