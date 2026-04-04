import React, { useRef, useEffect } from 'react';
import { moveToString, getPieceImageSrc } from '../utils/chess';
import type { MoveHistoryEntry } from '../types/chess';
import './MoveHistory.css';

interface MoveHistoryProps {
  moves: MoveHistoryEntry[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <div className="move-history glass-panel animate-fade-in">
        <h3 className="move-history-title">
          <span className="material-icons-round">history</span> Lịch Sử
        </h3>
        <p className="move-history-empty">Chưa có nước đi nào.</p>
      </div>
    );
  }

  // Group moves into pairs (white + black)
  const pairs: [MoveHistoryEntry, MoveHistoryEntry | null][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] || null]);
  }

  const renderMove = (move: MoveHistoryEntry, color: 'w' | 'b') => {
    const imgSrc = getPieceImageSrc(move.piece.toUpperCase(), color === 'w' ? 'white' : 'black');
    const isBlack = color === 'b';
    return (
      <span className={`move-entry ${color === 'w' ? 'move-white' : 'move-black'}`}>
        <img 
          src={imgSrc} 
          alt={move.piece} 
          className={`move-piece-icon ${isBlack ? 'move-piece-dark-shadow' : ''}`} 
        /> 
        {moveToString(move.from, move.to)}{move.captured ? '×' : ''}
        {move.ai && <span className="ai-tag">AI</span>}
      </span>
    );
  };

  return (
    <div className="move-history glass-panel animate-fade-in">
      <h3 className="move-history-title">
        <span className="material-icons-round" style={{color: 'var(--accent-secondary)'}}>menu_book</span> Lịch Sử Nước Đi
      </h3>
      <div className="move-list" ref={listRef}>
        {pairs.map((pair, idx) => (
          <div key={idx} className="move-pair">
            <span className="move-number">{idx + 1}.</span>
            {renderMove(pair[0], 'w')}
            {pair[1] ? renderMove(pair[1], 'b') : <span className="move-entry" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveHistory;
