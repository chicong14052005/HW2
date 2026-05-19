/* ============================================================================
   useChessGame - Custom Hook quản lý trạng thái game cờ vua
   Fix: Sử dụng useRef để tránh stale closure, localStorage persist gameId
   NV3: Cache legalMovesMap (không call API API getLegalMoves)
   NV4: Support Pawn Promotion
   NV5: Chạy AI bất đồng bộ (polling)
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type {
  BoardState, GameStatus, MoveData, GameInfo, AIInfo,
  GameMode, AIAlgorithm, MoveHistoryEntry,
} from '../types/chess';

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

const STORAGE_KEY = 'chess-active-game-id';

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

  // Ref để luôn có state mới nhất (tránh stale closure)
  const stateRef = useRef(state);
  stateRef.current = state;

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const t = setTimeout(() => setState(s => ({ ...s, error: null })), 5000);
      return () => clearTimeout(t);
    }
  }, [state.error]);

  // Restore game from localStorage on mount
  useEffect(() => {
    const savedGameId = localStorage.getItem(STORAGE_KEY);
    if (savedGameId) {
      restoreGame(savedGameId);
    }
  }, []);

  /** Khôi phục game từ server */
  const restoreGame = async (gameId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const data = await api.getState(gameId);
      if (!isMountedRef.current) return;
      setState(prev => ({
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
      // Game không tồn tại nữa → xóa localStorage
      localStorage.removeItem(STORAGE_KEY);
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  /** Tạo game mới */
  const newGame = useCallback(async (
    mode: GameMode = 'pvai',
    algorithm: AIAlgorithm = 'alphabeta',
    depth = 3,
    iterations = 500,
  ) => {
    // Clear AI timer & polling nếu đang chạy
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }

    setState(prev => ({
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

      // Lưu gameId vào localStorage
      localStorage.setItem(STORAGE_KEY, data.game_id);

      setState(prev => ({
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
        setState(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      }
    }
  }, []);

  /** Bắt đầu polling chờ AI */
  const startPollingAiMove = useCallback((gameId: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const data = await api.aiStatus(gameId);
        if (!isMountedRef.current) return;

        if ((data.status_ai === 'done' || data.status === 'done') && data.board) {
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }

          const aiMove = data.ai_info?.move;
          setState(prev => ({
            ...prev,
            board: data.board as BoardState,
            status: (data as unknown as { status: GameStatus }).status,
            legalMoves: data.legal_moves || [],
            legalMovesMap: data.legal_moves_dict || {},
            gameInfo: data.game_info as GameInfo,
            moveHistory: data.game_info?.move_history || [],
            aiInfo: data.ai_info || null,
            lastMove: aiMove ? { from: aiMove.from, to: aiMove.to } : prev.lastMove,
            isAiThinking: false,
          }));

          // Fix status object merging since backend returns status property inside the dict
          if (data.board) {
            setState(prev => ({ ...prev, status: (data as unknown as { status: GameStatus }).status }));
          }

          // Kích hoạt tiếp nếu ở chế độ AI vs AI
          if (data.game_info?.mode === 'aivai' && !(data as unknown as { status: GameStatus }).status?.game_over) {
             aiTimerRef.current = setTimeout(() => {
               if (isMountedRef.current && stateRef.current.gameId) {
                 // Lấy config AI phù hợp với turn hiện tại
                 const currentTurn = data.game_info!.turn;
                 const aiConfig = currentTurn === 'white' 
                   ? data.game_info!.white_ai 
                   : data.game_info!.black_ai;
                 
                 const algorithm = (aiConfig?.algorithm || data.game_info!.ai_algorithm) as AIAlgorithm;
                 const depth = aiConfig?.depth || data.game_info!.ai_depth;
                 const iterations = aiConfig?.iterations || data.game_info!.ai_iterations;
                 
                 triggerAiMove(stateRef.current.gameId, algorithm, depth, iterations);
               }
             }, 500);
          }

        } else if (data.status === 'error' || data.status === 'cancelled' || data.status_ai === 'error') {
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }
          setState(prev => ({
            ...prev,
            isAiThinking: false,
            error: data.error || (data.status === 'cancelled' ? 'AI cancelled' : 'AI error'),
          }));
        }
      } catch (err) {
         console.error('Polling error:', err);
      }
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Trigger AI move */
  const triggerAiMove = useCallback(async (
    gameId: string,
    algorithm: AIAlgorithm = 'alphabeta',
    depth = 3,
    iterations = 500,
  ) => {
    setState(prev => ({ ...prev, isAiThinking: true }));
    try {
      // Bắt đầu background task
      const data = await api.aiMove(gameId, algorithm, depth, iterations);
      if (!isMountedRef.current) return;

      if (data.status === 'calculating') {
        startPollingAiMove(gameId);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isAiThinking: false, error: (err as Error).message }));
      }
    }
  }, [startPollingAiMove]);


  /** Xác nhận nước phong cấp */
  const confirmPromotion = useCallback(async (promotionPiece: string) => {
    const current = stateRef.current;
    if (!current.gameId || !current.pendingPromotion) return;

    const { from, to } = current.pendingPromotion;
    setState(prev => ({ ...prev, isLoading: true, pendingPromotion: null }));

    try {
      const data = await api.makeMove(current.gameId, from, to, promotionPiece);
      if (!isMountedRef.current) return;

      setState(prev => ({
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

      // Kích hoạt AI nếu chơi với AI
      if (data.game_info?.mode === 'pvai' && !(data as unknown as { status: GameStatus }).status?.game_over && data.board.turn === 'black') {
        triggerAiMove(current.gameId, data.game_info.ai_algorithm as AIAlgorithm, data.game_info.ai_depth, data.game_info.ai_iterations);
      }

    } catch (err) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: (err as Error).message,
        }));
      }
    }
  }, [triggerAiMove]);


  /** Chọn/bỏ chọn ô — lookup local data */
  const selectSquare = useCallback(async (row: number, col: number) => {
    const current = stateRef.current;
    const { board, gameId, selectedSquare, status, gameInfo, legalMovesMap, isAiThinking, isLoading } = current;
    
    if (!board || !gameId || status?.game_over || isLoading || isAiThinking) return;

    // Nếu đang ở mode pvai và là lượt AI (black), không cho chọn
    if (gameInfo?.mode === 'pvai' && board.turn === 'black') return;
    // AI vs AI: không cho người chơi chọn
    if (gameInfo?.mode === 'aivai') return;

    const piece = board.grid[row][col];

    // Nếu đã chọn rồi mà click vào ô mới
    if (selectedSquare) {
      const [sr, sc] = selectedSquare;

      // Click lại vào cùng ô → bỏ chọn
      if (sr === row && sc === col) {
        setState(prev => ({ ...prev, selectedSquare: null, highlightedMoves: [] }));
        return;
      }

      // Click vào quân cùng phe → đổi selection
      if (piece && piece.color === board.turn) {
        const moves = legalMovesMap[`${row},${col}`] || [];
        setState(prev => ({ ...prev, selectedSquare: [row, col], highlightedMoves: moves }));
        return;
      }

      // Kiểm tra có nằm trong highlightedMoves không
      const isValidMove = current.highlightedMoves.some(m => m[0] === row && m[1] === col);
      if (!isValidMove) {
         setState(prev => ({ ...prev, selectedSquare: null, highlightedMoves: [] }));
         return;
      }

      // Xử lý PAWN PROMOTION REQUIRED TRƯỚC KHI GỌI API
      const selectedPiece = board.grid[sr][sc];
      if (selectedPiece?.type === 'P' && ((selectedPiece.color === 'white' && row === 0) || (selectedPiece.color === 'black' && row === 7))) {
        setState(prev => ({
          ...prev,
          pendingPromotion: { from: [sr, sc], to: [row, col] },
          selectedSquare: null,
          highlightedMoves: []
        }));
        return; // Dừng, đợi user popup confirm
      }

      // Lưu state cũ để Rollback nếu lỗi
      const oldBoard = board;
      const oldStatus = status;
      const oldLastMove = current.lastMove;

      // Optimistic UI Update - Cập nhật tạm thời
      const newGrid = board.grid.map(r => [...r]);
      newGrid[row][col] = newGrid[sr][sc]; // Di chuyển quân
      newGrid[sr][sc] = null;              // Xóa quân ở ô cũ
      
      setState(prev => ({ 
        ...prev, 
        board: { ...board, grid: newGrid },
        lastMove: { from: [sr, sc], to: [row, col] },
        selectedSquare: null, 
        highlightedMoves: [],
        status: { ...prev.status!, turn: board.turn === 'white' ? 'black' : 'white' } as GameStatus,
      }));

      try {
        const data = await api.makeMove(gameId, [sr, sc], [row, col]);
        if (!isMountedRef.current) return;

        // Trường hợp server báo yêu cầu phong cấp (dành cho dự phòng nếu logic chặn frontend bị sót)
        if (data.promotion_required) {
          setState(prev => ({
            ...prev,
            board: oldBoard, // rollback optimistic ui
            status: oldStatus,
            lastMove: oldLastMove,
            pendingPromotion: { from: [sr, sc], to: [row, col] },
          }));
          return;
        }

        setState(prev => ({
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

        // Nếu mode pvai, tự động gọi AI di chuyển
        if (data.game_info?.mode === 'pvai' && !(data as unknown as { status: GameStatus }).status?.game_over && data.board.turn === 'black') {
          triggerAiMove(gameId, data.game_info.ai_algorithm as AIAlgorithm, data.game_info.ai_depth, data.game_info.ai_iterations);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setState(prev => ({
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

    // Chưa chọn gì → chọn quân
    if (piece && piece.color === board.turn) {
      const moves = legalMovesMap[`${row},${col}`] || [];
      setState(prev => ({ ...prev, selectedSquare: [row, col], highlightedMoves: moves }));
    }
  }, [triggerAiMove]);

  /** Bắt đầu AI vs AI */
  const startAiVsAi = useCallback(async (
    algorithm: AIAlgorithm = 'alphabeta',
    depth = 3,
    iterations = 500,
    whiteAI?: import('../types/chess').AIConfig,
    blackAI?: import('../types/chess').AIConfig,
  ) => {
    // Clear previous timer
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    aiTimerRef.current = null;
    pollingTimerRef.current = null;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const data = await api.newGame('aivai', algorithm, depth, iterations, whiteAI, blackAI);
      if (!isMountedRef.current) return;

      localStorage.setItem(STORAGE_KEY, data.game_id);

      setState(prev => ({
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

      // Start AI with delay, use white AI config for first move
      setTimeout(() => {
        if (isMountedRef.current) {
          const aiConfig = whiteAI || { algorithm, depth, iterations };
          triggerAiMove(data.game_id, aiConfig.algorithm as AIAlgorithm, aiConfig.depth, aiConfig.iterations);
        }
      }, 1000);
    } catch (err) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
      }
    }
  }, [triggerAiMove]);

  /** Hoàn tác nước đi */
  const undoMove = useCallback(async () => {
    const current = stateRef.current;
    if (!current.gameId) return;
    try {
      const data = await api.undoMove(current.gameId);
      if (!isMountedRef.current) return;
      setState(prev => ({
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
        setState(prev => ({ ...prev, error: (err as Error).message }));
      }
    }
  }, []);

  /** Thoát game → trở về màn hình chính */
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

