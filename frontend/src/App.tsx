/* ============================================================================
   App.tsx - Main Layout cho Chess Game
   ============================================================================ */

import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import MoveHistory from './components/MoveHistory';
import CapturedPieces from './components/CapturedPieces';
import GameControls from './components/GameControls';
import SettingsPanel from './components/SettingsPanel';
import GameHistory from './components/GameHistory';
import ChessClock from './components/ChessClock';
import { PromotionModal } from './components/PromotionModal';
import { useChessGame } from './hooks/useChessGame';
import type { ThemeMode, GameMode, AIAlgorithm, PieceColor, AIConfig, BoardTheme } from './types/chess';
import './App.css';

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('chess-theme') as ThemeMode) || 'dark';
  });
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => {
    return (localStorage.getItem('chess-board-theme') as BoardTheme) || 'solid';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Game settings
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  
  // Timer key to force reset on new game
  const [timerKey, setTimerKey] = useState(0);

  // Chess game state
  const game = useChessGame();

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chess-theme', theme);
  }, [theme]);

  // Apply board theme
  useEffect(() => {
    localStorage.setItem('chess-board-theme', boardTheme);
  }, [boardTheme]);

  const handleNewGame = (
    mode: GameMode, 
    algorithm: AIAlgorithm, 
    depth: number, 
    iterations: number,
    whiteAI?: AIConfig,
    blackAI?: AIConfig
  ) => {
    setTimerKey(k => k + 1);
    if (mode === 'aivai') {
      game.startAiVsAi(algorithm, depth, iterations, whiteAI, blackAI);
    } else {
      game.newGame(mode, algorithm, depth, iterations);
    }
  };

  const handleTimeout = useCallback((color: PieceColor) => {
    alert(`Hết giờ! ${color === 'white' ? 'Trắng' : 'Đen'} đã thua do hết thời gian.`);
    game.quitGame();
  }, [game]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="material-icons-round logo-icon">chess</span>
          <h1 className="app-title">Chess AI</h1>
          <span className="app-subtitle">Alpha-Beta · MCTS</span>
        </div>
        <div className="header-right">
          <button
            className="btn btn-icon"
            onClick={() => setShowHistory(true)}
            title="Lịch sử"
          >
            <span className="material-icons-round">history</span>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowSettings(true)}
            title="Cài đặt"
          >
            <span className="material-icons-round">settings</span>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Đổi giao diện"
          >
            <span className="material-icons-round">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {!game.board ? (
          /* Welcome Screen */
          <div className="welcome-screen animate-fade-in">
            <div className="welcome-icon">
               <img src="/pieces/2d/king-w.svg" alt="King icon" style={{ height: '80px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
            </div>
            <h2 className="welcome-title">Chào mừng đến Chess AI</h2>
            <p className="welcome-desc">
              Trải nghiệm cờ vua thông minh với hai thuật toán AI 
              <strong> Alpha-Beta Pruning</strong> và <strong>MCTS</strong>
            </p>
            <div className="welcome-controls">
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>Tạo Ván Mới</h3>
              <GameControls
                onNewGame={handleNewGame}
                onUndo={game.undoMove}
                onQuit={game.quitGame}
                isLoading={game.isLoading}
                isAiThinking={game.isAiThinking}
                hasGame={false}
                gameOver={false}
              />
            </div>
          </div>
        ) : (
          /* Game Layout */
          <div className="game-layout animate-fade-in">
            {/* Left Panel */}
            <aside className="panel panel-left">
              <GameInfo
                status={game.status}
                gameInfo={game.gameInfo}
                isAiThinking={game.isAiThinking}
                aiThinkTime={game.aiInfo?.think_time}
              />
              <ChessClock
                key={timerKey}
                enabled={timerEnabled}
                initialMinutes={timerMinutes}
                currentTurn={game.board?.turn || 'white'}
                gameOver={game.status?.game_over || false}
                onTimeout={handleTimeout}
                isPaused={game.isAiThinking || game.isLoading}
              />
              <CapturedPieces
                capturedWhite={game.gameInfo?.captured_white || []}
                capturedBlack={game.gameInfo?.captured_black || []}
              />
              {/* Game Actions pinned to the bottom of the left panel */}
              <GameControls
                onNewGame={handleNewGame}
                onUndo={game.undoMove}
                onQuit={game.quitGame}
                isLoading={game.isLoading}
                isAiThinking={game.isAiThinking}
                hasGame={true}
                gameOver={game.status?.game_over || false}
              />
            </aside>

            {/* Center - Board */}
            <div className="board-section">
              <div className="chess-board-wrapper">
                <Board
                  board={game.board}
                  status={game.status!}
                  selectedSquare={showLegalMoves ? game.selectedSquare : null}
                  highlightedMoves={showLegalMoves ? game.highlightedMoves : []}
                  lastMove={game.lastMove}
                  onSquareClick={game.selectSquare}
                  animationSpeed={animationSpeed}
                  boardTheme={boardTheme}
                />
              </div>
              {game.isAiThinking && (
                <div className="board-overlay-thinking">
                  <div className="thinking-spinner" />
                </div>
              )}
            </div>

            {/* Right Panel */}
            <aside className="panel panel-right">
              <MoveHistory moves={game.moveHistory} />
            </aside>
          </div>
        )}
      </main>

      {/* Error Toast */}
      {game.error && (
        <div className="error-toast animate-slide-in">
          <span className="material-icons-round">error</span>
          <span>{game.error}</span>
        </div>
      )}

      {/* Overlays / Modals */}
      {showSettings && (
        <SettingsPanel
          theme={theme}
          onThemeChange={setTheme}
          timerEnabled={timerEnabled}
          onTimerToggle={setTimerEnabled}
          timerMinutes={timerMinutes}
          onTimerChange={setTimerMinutes}
          showLegalMoves={showLegalMoves}
          onShowLegalMovesToggle={setShowLegalMoves}
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={setAnimationSpeed}
          boardTheme={boardTheme}
          onBoardThemeChange={setBoardTheme}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && (
        <GameHistory onClose={() => setShowHistory(false)} />
      )}

      {game.pendingPromotion && game.board && (
        <PromotionModal
          color={game.board.turn}
          onSelect={game.confirmPromotion}
        />
      )}
    </div>
  );
}

export default App;
