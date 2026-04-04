import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { PieceColor } from '../types/chess';
import './ChessClock.css';

interface ChessClockProps {
  enabled: boolean;
  initialMinutes: number;
  currentTurn: PieceColor;
  gameOver: boolean;
  onTimeout: (color: PieceColor) => void;
  isPaused?: boolean;
}

const ChessClock: React.FC<ChessClockProps> = ({
  enabled,
  initialMinutes,
  currentTurn,
  gameOver,
  onTimeout,
  isPaused = false,
}) => {
  const [whiteTime, setWhiteTime] = useState(initialMinutes * 60);
  const [blackTime, setBlackTime] = useState(initialMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTimedOut = useRef(false);

  const [prevInitialMinutes, setPrevInitialMinutes] = useState(initialMinutes);

  // Reset clock khi initialMinutes thay đổi (ví dụ đổi cài đặt)
  if (initialMinutes !== prevInitialMinutes) {
    setPrevInitialMinutes(initialMinutes);
    setWhiteTime(initialMinutes * 60);
    setBlackTime(initialMinutes * 60);
  }

  useEffect(() => {
    hasTimedOut.current = false;
  }, [initialMinutes]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (!enabled || gameOver || isPaused || hasTimedOut.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (currentTurn === 'white') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            hasTimedOut.current = true;
            onTimeout('white');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            hasTimedOut.current = true;
            onTimeout('black');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, currentTurn, gameOver, isPaused, onTimeout]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimeClass = (seconds: number): string => {
    let cls = 'clock-time';
    if (seconds <= 30) cls += ' clock-critical';
    else if (seconds <= 60) cls += ' clock-warning';
    return cls;
  };

  if (!enabled) return null;

  return (
    <div className="chess-clock">
      <div className="clock-icon-wrap">
        <span className="material-icons-round" style={{ fontSize: 28 }}>timer</span>
      </div>
      <div className="clock-players">
        <div className={`clock-player ${currentTurn === 'white' && !gameOver ? 'clock-player-active' : ''}`}>
          <span className="clock-label">Trắng</span>
          <span className={getTimeClass(whiteTime)}>
            {formatTime(whiteTime)}
          </span>
        </div>
        <div className={`clock-player ${currentTurn === 'black' && !gameOver ? 'clock-player-active' : ''}`}>
          <span className="clock-label">Đen</span>
          <span className={getTimeClass(blackTime)}>
            {formatTime(blackTime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChessClock;
