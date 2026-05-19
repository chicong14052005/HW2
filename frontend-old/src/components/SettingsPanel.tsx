import React, { useState } from 'react';
import type { ThemeMode, BoardTheme } from '../types/chess';
import './SettingsPanel.css';

interface SettingsPanelProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  boardTheme: BoardTheme;
  onBoardThemeChange: (theme: BoardTheme) => void;
  timerEnabled: boolean;
  onTimerToggle: (enabled: boolean) => void;
  timerMinutes: number;
  onTimerChange: (minutes: number) => void;
  showLegalMoves: boolean;
  onShowLegalMovesToggle: (show: boolean) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme, onThemeChange,
  boardTheme, onBoardThemeChange,
  timerEnabled, onTimerToggle, timerMinutes, onTimerChange,
  showLegalMoves, onShowLegalMovesToggle,
  animationSpeed, onAnimationSpeedChange,
  onClose,
}) => {
  // Local state để lưu tạm các thay đổi trước khi áp dụng
  const [localTheme, setLocalTheme] = useState<ThemeMode>(theme);
  const [localBoardTheme, setLocalBoardTheme] = useState<BoardTheme>(boardTheme);
  const [localTimerEnabled, setLocalTimerEnabled] = useState(timerEnabled);
  const [localTimerMinutes, setLocalTimerMinutes] = useState(timerMinutes);
  const [localShowLegalMoves, setLocalShowLegalMoves] = useState(showLegalMoves);
  const [localAnimationSpeed, setLocalAnimationSpeed] = useState(animationSpeed);

  // Kiểm tra có thay đổi không
  const hasChanges =
    localTheme !== theme ||
    localBoardTheme !== boardTheme ||
    localTimerEnabled !== timerEnabled ||
    localTimerMinutes !== timerMinutes ||
    localShowLegalMoves !== showLegalMoves ||
    localAnimationSpeed !== animationSpeed;

  // Áp dụng tất cả thay đổi
  const handleApply = () => {
    onThemeChange(localTheme);
    onBoardThemeChange(localBoardTheme);
    onTimerToggle(localTimerEnabled);
    onTimerChange(localTimerMinutes);
    onShowLegalMovesToggle(localShowLegalMoves);
    onAnimationSpeedChange(localAnimationSpeed);
    onClose();
  };

  // Reset về giá trị ban đầu
  const handleReset = () => {
    setLocalTheme(theme);
    setLocalBoardTheme(boardTheme);
    setLocalTimerEnabled(timerEnabled);
    setLocalTimerMinutes(timerMinutes);
    setLocalShowLegalMoves(showLegalMoves);
    setLocalAnimationSpeed(animationSpeed);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel glass-panel animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-round">settings</span> Cài Đặt
          </h3>
          <button className="btn btn-icon" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Theme */}
        <div className="settings-section">
          <h4 className="settings-section-title">Giao diện</h4>
          <div className="settings-row">
            <span className="settings-label">Chế độ hiển thị</span>
            <div className="theme-toggle">
              <button
                className={`theme-btn ${localTheme === 'light' ? 'theme-btn-active' : ''}`}
                onClick={() => { setLocalTheme('light'); onThemeChange('light'); }}
              >
                <span className="material-icons-round" style={{ fontSize: 16 }}>light_mode</span> Sáng
              </button>
              <button
                className={`theme-btn ${localTheme === 'dark' ? 'theme-btn-active' : ''}`}
                onClick={() => { setLocalTheme('dark'); onThemeChange('dark'); }}
              >
                <span className="material-icons-round" style={{ fontSize: 16 }}>dark_mode</span> Tối
              </button>
            </div>
          </div>
          
          <div className="settings-row">
            <span className="settings-label">Mẫu bàn cờ</span>
            <div className="theme-toggle">
              <button
                className={`theme-btn ${localBoardTheme === 'solid' ? 'theme-btn-active' : ''}`}
                onClick={() => { setLocalBoardTheme('solid'); onBoardThemeChange('solid'); }}
              >
                Solid
              </button>
              <button
                className={`theme-btn ${localBoardTheme === 'wood' ? 'theme-btn-active' : ''}`}
                onClick={() => { setLocalBoardTheme('wood'); onBoardThemeChange('wood'); }}
              >
                Gỗ
              </button>
              <button
                className={`theme-btn ${localBoardTheme === 'gradient' ? 'theme-btn-active' : ''}`}
                onClick={() => { setLocalBoardTheme('gradient'); onBoardThemeChange('gradient'); }}
              >
                Gradient
              </button>
            </div>
          </div>
        </div>

        {/* Gameplay */}
        <div className="settings-section">
          <h4 className="settings-section-title">Gameplay</h4>

          <div className="settings-row">
            <span className="settings-label">Hiện nước đi hợp lệ</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localShowLegalMoves}
                onChange={(e) => setLocalShowLegalMoves(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-row" style={{ display: 'block', marginBottom: 12 }}>
            <span className="settings-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Độ mượt khi di chuyển (Animation)</span>
              <span>{localAnimationSpeed} ms</span>
            </span>
            <input
              type="range"
              min={0}
              max={500}
              step={50}
              value={localAnimationSpeed}
              onChange={(e) => setLocalAnimationSpeed(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>timer</span> Đồng hồ thi đấu
            </span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localTimerEnabled}
                onChange={(e) => setLocalTimerEnabled(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {localTimerEnabled && (
            <div className="settings-row settings-row-indent">
              <span className="settings-label">Thời gian (phút)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={localTimerMinutes}
                onChange={(e) => setLocalTimerMinutes(Number(e.target.value))}
                className="settings-input"
              />
            </div>
          )}
        </div>

        <div className="settings-footer">
          <div className="settings-actions">
            <button 
              className="btn btn-secondary" 
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Đặt lại
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleApply}
              disabled={!hasChanges}
            >
              <span className="material-icons-round" style={{ fontSize: 16 }}>check</span> Áp dụng
            </button>
          </div>
          {hasChanges && (
            <p className="settings-hint">Nhấn "Áp dụng" để lưu các thay đổi</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
