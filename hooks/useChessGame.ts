"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api/chess";
import type {
  BoardState,
  GameStatus,
  MoveData,
  GameInfo,
  AIInfo,
  GameMode,
  AIAlgorithm,
  MoveHistoryEntry,
  AIConfig,
} from "@/lib/types/chess";

interface ChessGameState {
  gameId: string | null;
  board: BoardState | null;
  status: GameStatus | null;
  legalMoves: MoveData[];
  legalMovesMap: Record<string, [number, number][]>;
  gameInfo: GameInfo | null;
  selectedSquare: [number, number] | null;
  highlightedMoves: [number, number][];
  lastMove: { from: [number, number]; to: [number, number] } | null;
  isLoading: boolean;
  isAiThinking: boolean;
  error: string | null;
  aiInfo: AIInfo | null;
  moveHistory: MoveHistoryEntry[];
  pendingPromotion: { from: [number, number]; to: [number, number] } | null;
}

const STORAGE_KEY = "chess-active-game-id";

export function useChessGame() {
  const [state, setState] = useState<ChessGameState>({
    gameId: null,
    board: null,
    status: null,
    legalMoves: [],
    legalMovesMap: {},
    gameInfo: null,
    selectedSquare: null,
    highlightedMoves: [],
    lastMove: null,
    isLoading: false,
    isAiThinking: false,
    error: null,
    aiInfo: null,
    moveHistory: [],
    pendingPromotion: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (state.error) {
      const t = setTimeout(
        () => setState((s) => ({ ...s, error: null })),
        5000
      );
      return () => clearTimeout(t);
    }
  }, [state.error]);

  useEffect(() => {
    const savedGameId = localStorage.getItem(STORAGE_KEY);
    if (savedGameId) {
      restoreGame(savedGameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreGame = async (gameId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = await api.getState(gameId);
      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        gameId: data.game_id,
        board: data.board,
        status: data.status as GameStatus,
        legalMoves: data.legal_moves || [],
        legalMovesMap: data.legal_moves_dict || {},
        gameInfo: data.game_info,
        moveHistory: data.game_info?.move_history || [],
        isLoading: false,
      }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  };

  const newGame = useCallback(
    async (
      mode: GameMode = "pvai",
      algorithm: AIAlgorithm = "alphabeta",
      depth = 3,
      iterations = 500
    ) => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        selectedSquare: null,
        highlightedMoves: [],
        lastMove: null,
        aiInfo: null,
        pendingPromotion: null,
      }));

      try {
        const data = await api.newGame(mode, algorithm, depth, iterations);
        if (!isMountedRef.current) return;

        localStorage.setItem(STORAGE_KEY, data.game_id);

        setState((prev) => ({
          ...prev,
          gameId: data.game_id,
          board: data.board,
          status: data.status as GameStatus,
          legalMoves: data.legal_moves || [],
          legalMovesMap: data.legal_moves_dict || {},
          gameInfo: data.game_info,
          moveHistory: [],
          isLoading: false,
        }));
      } catch (err) {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: (err as Error).message,
          }));
        }
      }
    },
    []
  );

  const startPollingAiMove = useCallback((gameId: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const data = await api.aiStatus(gameId);
        if (!isMountedRef.current) return;

        if (
          (data.status_ai === "done" || data.status === "done") &&
          data.board
        ) {
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }

          const aiMove = data.ai_info?.move;
          setState((prev) => ({
            ...prev,
            board: data.board as BoardState,
            status: (data as unknown as { status: GameStatus }).status,
            legalMoves: data.legal_moves || [],
            legalMovesMap: data.legal_moves_dict || {},
            gameInfo: data.game_info as GameInfo,
            moveHistory: data.game_info?.move_history || [],
            aiInfo: data.ai_info || null,
            lastMove: aiMove
              ? { from: aiMove.from, to: aiMove.to }
              : prev.lastMove,
            isAiThinking: false,
          }));

          if (data.board) {
            setState((prev) => ({
              ...prev,
              status: (data as unknown as { status: GameStatus }).status,
            }));
          }

          if (
            data.game_info?.mode === "aivai" &&
            !(data as unknown as { status: GameStatus }).status?.game_over
          ) {
            aiTimerRef.current = setTimeout(() => {
              if (isMountedRef.current && stateRef.current.gameId) {
                const currentTurn = data.game_info!.turn;
                const aiConfig =
                  currentTurn === "white"
                    ? data.game_info!.white_ai
                    : data.game_info!.black_ai;

                const algorithm = (aiConfig?.algorithm ||
                  data.game_info!.ai_algorithm) as AIAlgorithm;
                const depth = aiConfig?.depth || data.game_info!.ai_depth;
                const iterations =
                  aiConfig?.iterations || data.game_info!.ai_iterations;

                triggerAiMove(
                  stateRef.current.gameId,
                  algorithm,
                  depth,
                  iterations
                );
              }
            }, 500);
          }
        } else if (
          data.status === "error" ||
          data.status === "cancelled" ||
          data.status_ai === "error"
        ) {
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }
          setState((prev) => ({
            ...prev,
            isAiThinking: false,
            error:
              data.error ||
              (data.status === "cancelled" ? "AI cancelled" : "AI error"),
          }));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerAiMove = useCallback(
    async (
      gameId: string,
      algorithm: AIAlgorithm = "alphabeta",
      depth = 3,
      iterations = 500
    ) => {
      setState((prev) => ({ ...prev, isAiThinking: true }));
      try {
        const data = await api.aiMove(gameId, algorithm, depth, iterations);
        if (!isMountedRef.current) return;

        if (data.status === "calculating") {
          startPollingAiMove(gameId);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isAiThinking: false,
            error: (err as Error).message,
          }));
        }
      }
    },
    [startPollingAiMove]
  );

  const confirmPromotion = useCallback(
    async (promotionPiece: string) => {
      const current = stateRef.current;
      if (!current.gameId || !current.pendingPromotion) return;

      const { from, to } = current.pendingPromotion;
      setState((prev) => ({
        ...prev,
        isLoading: true,
        pendingPromotion: null,
      }));

      try {
        const data = await api.makeMove(current.gameId, from, to, promotionPiece);
        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          board: data.board,
          status: data.status as GameStatus,
          legalMoves: data.legal_moves || [],
          legalMovesMap: data.legal_moves_dict || {},
          gameInfo: data.game_info,
          moveHistory: data.game_info?.move_history || [],
          selectedSquare: null,
          highlightedMoves: [],
          lastMove: { from, to },
          isLoading: false,
        }));

        if (
          data.game_info?.mode === "pvai" &&
          !(data as unknown as { status: GameStatus }).status?.game_over &&
          data.board.turn === "black"
        ) {
          triggerAiMove(
            current.gameId,
            data.game_info.ai_algorithm as AIAlgorithm,
            data.game_info.ai_depth,
            data.game_info.ai_iterations
          );
        }
      } catch (err) {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: (err as Error).message,
          }));
        }
      }
    },
    [triggerAiMove]
  );

  const selectSquare = useCallback(
    async (row: number, col: number) => {
      const current = stateRef.current;
      const {
        board,
        gameId,
        selectedSquare,
        status,
        gameInfo,
        legalMovesMap,
        isAiThinking,
        isLoading,
      } = current;

      if (!board || !gameId || status?.game_over || isLoading || isAiThinking)
        return;

      if (gameInfo?.mode === "pvai" && board.turn === "black") return;
      if (gameInfo?.mode === "aivai") return;

      const piece = board.grid[row][col];

      if (selectedSquare) {
        const [sr, sc] = selectedSquare;

        if (sr === row && sc === col) {
          setState((prev) => ({
            ...prev,
            selectedSquare: null,
            highlightedMoves: [],
          }));
          return;
        }

        if (piece && piece.color === board.turn) {
          const moves = legalMovesMap[`${row},${col}`] || [];
          setState((prev) => ({
            ...prev,
            selectedSquare: [row, col],
            highlightedMoves: moves,
          }));
          return;
        }

        const isValidMove = current.highlightedMoves.some(
          (m) => m[0] === row && m[1] === col
        );
        if (!isValidMove) {
          setState((prev) => ({
            ...prev,
            selectedSquare: null,
            highlightedMoves: [],
          }));
          return;
        }

        const selectedPiece = board.grid[sr][sc];
        if (
          selectedPiece?.type === "P" &&
          ((selectedPiece.color === "white" && row === 0) ||
            (selectedPiece.color === "black" && row === 7))
        ) {
          setState((prev) => ({
            ...prev,
            pendingPromotion: { from: [sr, sc], to: [row, col] },
            selectedSquare: null,
            highlightedMoves: [],
          }));
          return;
        }

        const oldBoard = board;
        const oldStatus = status;
        const oldLastMove = current.lastMove;

        const newGrid = board.grid.map((r) => [...r]);
        newGrid[row][col] = newGrid[sr][sc];
        newGrid[sr][sc] = null;

        setState((prev) => ({
          ...prev,
          board: { ...board, grid: newGrid },
          lastMove: { from: [sr, sc], to: [row, col] },
          selectedSquare: null,
          highlightedMoves: [],
          status: {
            ...prev.status!,
            turn: board.turn === "white" ? "black" : "white",
          } as GameStatus,
        }));

        try {
          const data = await api.makeMove(gameId, [sr, sc], [row, col]);
          if (!isMountedRef.current) return;

          if (data.promotion_required) {
            setState((prev) => ({
              ...prev,
              board: oldBoard,
              status: oldStatus,
              lastMove: oldLastMove,
              pendingPromotion: { from: [sr, sc], to: [row, col] },
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            board: data.board,
            status: data.status as GameStatus,
            legalMoves: data.legal_moves || [],
            legalMovesMap: data.legal_moves_dict || {},
            gameInfo: data.game_info,
            moveHistory: data.game_info?.move_history || [],
            selectedSquare: null,
            highlightedMoves: [],
            lastMove: { from: [sr, sc], to: [row, col] },
            isLoading: false,
          }));

          if (
            data.game_info?.mode === "pvai" &&
            !(data as unknown as { status: GameStatus }).status?.game_over &&
            data.board.turn === "black"
          ) {
            triggerAiMove(
              gameId,
              data.game_info.ai_algorithm as AIAlgorithm,
              data.game_info.ai_depth,
              data.game_info.ai_iterations
            );
          }
        } catch (err) {
          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              board: oldBoard,
              status: oldStatus,
              lastMove: oldLastMove,
              error: (err as Error).message,
            }));
          }
        }
        return;
      }

      if (piece && piece.color === board.turn) {
        const moves = legalMovesMap[`${row},${col}`] || [];
        setState((prev) => ({
          ...prev,
          selectedSquare: [row, col],
          highlightedMoves: moves,
        }));
      }
    },
    [triggerAiMove]
  );

  const startAiVsAi = useCallback(
    async (
      algorithm: AIAlgorithm = "alphabeta",
      depth = 3,
      iterations = 500,
      whiteAI?: AIConfig,
      blackAI?: AIConfig
    ) => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      aiTimerRef.current = null;
      pollingTimerRef.current = null;

      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const data = await api.newGame(
          "aivai",
          algorithm,
          depth,
          iterations,
          whiteAI,
          blackAI
        );
        if (!isMountedRef.current) return;

        localStorage.setItem(STORAGE_KEY, data.game_id);

        setState((prev) => ({
          ...prev,
          gameId: data.game_id,
          board: data.board,
          status: data.status as GameStatus,
          legalMoves: data.legal_moves || [],
          legalMovesMap: data.legal_moves_dict || {},
          gameInfo: data.game_info,
          moveHistory: [],
          isLoading: false,
          selectedSquare: null,
          highlightedMoves: [],
          lastMove: null,
        }));

        setTimeout(() => {
          if (isMountedRef.current) {
            const aiConfig = whiteAI || { algorithm, depth, iterations };
            triggerAiMove(
              data.game_id,
              aiConfig.algorithm as AIAlgorithm,
              aiConfig.depth,
              aiConfig.iterations
            );
          }
        }, 1000);
      } catch (err) {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: (err as Error).message,
          }));
        }
      }
    },
    [triggerAiMove]
  );

  const undoMove = useCallback(async () => {
    const current = stateRef.current;
    if (!current.gameId) return;
    try {
      const data = await api.undoMove(current.gameId);
      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        board: data.board,
        status: data.status as GameStatus,
        legalMoves: data.legal_moves || [],
        legalMovesMap: data.legal_moves_dict || {},
        gameInfo: data.game_info,
        moveHistory: data.game_info?.move_history || [],
        selectedSquare: null,
        highlightedMoves: [],
        lastMove: null,
        isLoading: false,
        isAiThinking: false,
        error: null,
      }));
    } catch (err) {
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error: (err as Error).message }));
      }
    }
  }, []);

  const quitGame = useCallback(async () => {
    const current = stateRef.current;
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }

    if (current.gameId) {
      try {
        await api.quitGame(current.gameId);
      } catch {
        // Ignore errors
      }
    }

    localStorage.removeItem(STORAGE_KEY);

    setState({
      gameId: null,
      board: null,
      status: null,
      legalMoves: [],
      legalMovesMap: {},
      gameInfo: null,
      selectedSquare: null,
      highlightedMoves: [],
      lastMove: null,
      isLoading: false,
      isAiThinking: false,
      error: null,
      aiInfo: null,
      moveHistory: [],
      pendingPromotion: null,
    });
  }, []);

  return {
    ...state,
    newGame,
    selectSquare,
    undoMove,
    triggerAiMove,
    startAiVsAi,
    quitGame,
    confirmPromotion,
  };
}
