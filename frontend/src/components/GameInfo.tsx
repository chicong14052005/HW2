import React from 'react';
import type { GameStatus, GameInfo as GameInfoType } from '../types/chess';
import './GameInfo.css';

interface GameInfoProps {
  status: GameStatus | null;
  gameInfo: GameInfoType | null;
  isAiThinking: boolean;
  aiThinkTime?: number;
}

const MODE_LABELS: Record<string, { label: string, icon: string }> = {
  pvp: { label: 'Player vs Player', icon: 'people' },
  pvai: { label: 'Player vs AI', icon: 'smart_toy' },
  aivai: { label: 'AI vs AI', icon: 'precision_manufacturing' },
};

const GameInfo: React.FC<GameInfoProps> = ({ status, gameInfo, isAiThinking, aiThinkTime }) => {
  if (!status || !gameInfo) return null;

  const turnColor = gameInfo.turn;
  const turnLabel = turnColor === 'white' ? 'Trắng' : 'Đen';
  const turnIconSrc = turnColor === 'white' ? '/pieces/2d/king-w.svg' : '/pieces/2d/king-b.svg';

  const modeData = MODE_LABELS[gameInfo.mode] || { label: gameInfo.mode, icon: 'sports_esports' };

  return (
    <div className="game-info glass-panel animate-fade-in">
      <h3 className="game-info-title">Thông Tin Trận Đấu</h3>

      <div className="info-row">
        <span className="info-label">Chế độ</span>
        <span className="info-value">
          {modeData.label} <span className="material-icons-round" style={{fontSize: 18}}>{modeData.icon}</span>
        </span>
      </div>

      {gameInfo.mode !== 'pvp' && (
        <div className="info-row">
          <span className="info-label">Thuật toán AI</span>
          <span className="info-value algo-badge">
            {gameInfo.ai_algorithm === 'alphabeta' ? 'Alpha-Beta Pruning' : 'MCTS'}
          </span>
        </div>
      )}

      <div className="info-divider" />

      <div className="info-row">
        <span className="info-label">Lượt đi</span>
        <span className={`info-value turn-indicator turn-${turnColor}`}>
          {turnLabel}
          <img src={turnIconSrc} alt={turnColor} style={{width: 18, height: 18}} />
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">Số nước đi</span>
        <span className="info-value">{gameInfo.move_count}</span>
      </div>

      {aiThinkTime !== undefined && aiThinkTime > 0 && !isAiThinking && (
        <div className="info-row">
          <span className="info-label">Thời gian AI</span>
          <span className="info-value">{aiThinkTime}s</span>
        </div>
      )}

      {status.message && (
        <div className={`status-message ${status.game_over ? 'status-game-over' : 'status-check'}`}>
          {status.message}
        </div>
      )}

      {isAiThinking && (
        <div className="ai-thinking">
          <span className="material-icons-round thinking-dots">settings</span> AI đang tính toán...
        </div>
      )}
    </div>
  );
};

export default GameInfo;
