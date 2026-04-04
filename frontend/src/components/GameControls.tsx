import React, { useState } from 'react';
import type { GameMode, AIAlgorithm, AIConfig } from '../types/chess';
import './GameControls.css';

interface GameControlsProps {
  onNewGame: (
    mode: GameMode, 
    algorithm: AIAlgorithm, 
    depth: number, 
    iterations: number,
    whiteAI?: AIConfig,
    blackAI?: AIConfig
  ) => void;
  onUndo: () => void;
  onQuit: () => void;
  isLoading: boolean;
  isAiThinking: boolean;
  hasGame: boolean;
  gameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame, onUndo, onQuit,
  isLoading, isAiThinking, hasGame, gameOver,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('pvai');
  
  // Custom states
  const [selectedAlgo, setSelectedAlgo] = useState<AIAlgorithm>('alphabeta');
  const [depth, setDepth] = useState(3);
  const [iterations, setIterations] = useState(500);
  
  const [whiteAlgo, setWhiteAlgo] = useState<AIAlgorithm>('alphabeta');
  const [whiteDepth, setWhiteDepth] = useState(3);
  const [whiteIterations, setWhiteIterations] = useState(500);
  
  const [blackAlgo, setBlackAlgo] = useState<AIAlgorithm>('alphabeta');
  const [blackDepth, setBlackDepth] = useState(3);
  const [blackIterations, setBlackIterations] = useState(500);

  const openConfig = (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === 'pvp') {
      onNewGame('pvp', 'alphabeta', 3, 500); // Start immediately
    } else {
      setShowConfigModal(true);
    }
  };

  const handleStartGame = () => {
    if (selectedMode === 'aivai') {
      const whiteAI: AIConfig = { algorithm: whiteAlgo, depth: whiteDepth, iterations: whiteIterations };
      const blackAI: AIConfig = { algorithm: blackAlgo, depth: blackDepth, iterations: blackIterations };
      onNewGame(selectedMode, whiteAlgo, whiteDepth, whiteIterations, whiteAI, blackAI);
    } else {
      onNewGame(selectedMode, selectedAlgo, depth, iterations);
    }
    setShowConfigModal(false);
  };

  const renderAlgoToggle = (algo: AIAlgorithm, setAlgo: (a: AIAlgorithm) => void) => (
    <div className="algo-toggle">
      <div className={`algo-toggle-indicator ${algo === 'mcts' ? 'right' : ''}`} />
      <button 
        className={algo === 'alphabeta' ? 'active' : ''} 
        onClick={() => setAlgo('alphabeta')}
      >
        Alpha-Beta
      </button>
      <button 
        className={algo === 'mcts' ? 'active' : ''} 
        onClick={() => setAlgo('mcts')}
      >
        MCTS
      </button>
    </div>
  );

  const renderAIConfig = (
    label: string,
    icon: string,
    algo: AIAlgorithm,
    setAlgo: (a: AIAlgorithm) => void,
    depthVal: number,
    setDepthVal: (d: number) => void,
    iterVal: number,
    setIterVal: (i: number) => void
  ) => (
    <div className="ai-config-section">
      <div className="ai-config-header">
        <span className="material-icons-round">{icon}</span> {label}
      </div>
      <div className="ng-section ng-section-col">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <label className="ng-label">Thuật toán</label>
          {renderAlgoToggle(algo, setAlgo)}
        </div>
      </div>
      
      {algo === 'alphabeta' && (
        <div className="ng-section ng-section-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <label className="ng-label">Độ sâu</label>
            <span className="text-secondary" style={{fontSize: '0.8rem'}}>Độ sâu: {depthVal}</span>
          </div>
          <div className="ng-slider-container">
            <input
              type="range"
              min={1} max={5}
              value={depthVal}
              onChange={(e) => setDepthVal(Number(e.target.value))}
              className="ng-slider"
            />
            <div className="ng-slider-labels">
              <span>Dễ</span><span>Khó</span>
            </div>
          </div>
        </div>
      )}
      
      {algo === 'mcts' && (
        <div className="ng-section ng-section-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <label className="ng-label">Iterations</label>
            <span className="text-secondary" style={{fontSize: '0.8rem'}}>{iterVal}</span>
          </div>
          <div className="ng-slider-container">
            <input
              type="range"
              min={100} max={3000} step={100}
              value={iterVal}
              onChange={(e) => setIterVal(Number(e.target.value))}
              className="ng-slider"
            />
            <div className="ng-slider-labels">
               <span>Nhanh</span><span>Chính xác</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!hasGame) {
    if (showConfigModal) {
      return (
        <div className="new-game-menu-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="new-game-menu glass-panel" onClick={(e) => e.stopPropagation()}>
            <h4 className="ng-title">Cài đặt Trận đấu</h4>
            
            {selectedMode === 'pvai' && (
              <>
                <div className="ng-section">
                  <label className="ng-label">Thuật toán</label>
                  {renderAlgoToggle(selectedAlgo, setSelectedAlgo)}
                </div>
                
                {selectedAlgo === 'alphabeta' && (
                  <div className="ng-section ng-section-col">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                       <label className="ng-label">Độ sâu</label>
                       <span className="text-secondary" style={{fontSize: '0.8rem'}}>Độ sâu: {depth}</span>
                    </div>
                    <div className="ng-slider-container">
                      <input
                        type="range" min={1} max={5}
                        value={depth} onChange={(e) => setDepth(Number(e.target.value))}
                        className="ng-slider"
                      />
                      <div className="ng-slider-labels">
                        <span>Dễ</span><span>Khó</span>
                      </div>
                    </div>
                  </div>
                )}
                {selectedAlgo === 'mcts' && (
                  <div className="ng-section ng-section-col">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                       <label className="ng-label">Iterations</label>
                       <span className="text-secondary" style={{fontSize: '0.8rem'}}>{iterations}</span>
                    </div>
                    <div className="ng-slider-container">
                      <input
                        type="range" min={100} max={3000} step={100}
                        value={iterations} onChange={(e) => setIterations(Number(e.target.value))}
                        className="ng-slider"
                      />
                      <div className="ng-slider-labels">
                        <span>Nhanh</span><span>Chính xác</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedMode === 'aivai' && (
              <div className="aivai-config">
                {renderAIConfig('AI Trắng', 'smart_toy', whiteAlgo, setWhiteAlgo, whiteDepth, setWhiteDepth, whiteIterations, setWhiteIterations)}
                {renderAIConfig('AI Đen', 'smart_toy', blackAlgo, setBlackAlgo, blackDepth, setBlackDepth, blackIterations, setBlackIterations)}
              </div>
            )}

            <div className="ng-actions">
              <button className="btn btn-primary" onClick={handleStartGame}>Bắt đầu</button>
              <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      );
    }

    // Render Mode Cards
    return (
      <div className="mode-cards">
        <div className="mode-card" onClick={() => openConfig('pvp')}>
          <span className="material-icons-round mode-card-icon">people</span>
          <div className="mode-card-title">PvP</div>
          <div className="mode-card-desc">Chơi với người khác.</div>
        </div>
        <div className="mode-card" style={{borderColor: `var(--accent-primary)`}} onClick={() => openConfig('pvai')}>
          <span className="material-icons-round mode-card-icon" style={{color: `var(--accent-primary)`}}>smart_toy</span>
          <div className="mode-card-title">PvAI</div>
          <div className="mode-card-desc">Chơi với AI thông minh.</div>
        </div>
        <div className="mode-card" onClick={() => openConfig('aivai')}>
          <span className="material-icons-round mode-card-icon">precision_manufacturing</span>
          <div className="mode-card-title">AIvAI</div>
          <div className="mode-card-desc">Xem AI đấu với AI.</div>
        </div>
      </div>
    );
  }

  // Active game controls
  return (
    <div className="game-controls animate-fade-in">
      <div className="active-actions">
        <button className="btn btn-action" onClick={() => openConfig('pvp')}> {/* Hack to reset via opening config */}
          Ván Mới
        </button>
        <button className="btn btn-action" onClick={onUndo} disabled={isLoading || isAiThinking}>
          <span className="material-icons-round" style={{fontSize: 16, marginRight: 4}}>undo</span> Hoàn tác
        </button>
        <button className="btn btn-danger btn-quit" onClick={onQuit} disabled={isAiThinking}>
          Thoát trò chơi
        </button>
      </div>

      {gameOver && (
        <div className="game-over-banner animate-scale-in">
          <span>🏆 Ván đấu kết thúc!</span>
        </div>
      )}
    </div>
  );
};

export default GameControls;
