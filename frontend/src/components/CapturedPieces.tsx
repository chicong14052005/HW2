import React from 'react';
import { getPieceImageSrc } from '../utils/chess';
import './CapturedPieces.css';

interface CapturedPiecesProps {
  capturedWhite: string[];
  capturedBlack: string[];
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ capturedWhite, capturedBlack }) => {
  // Logic gộp quân cờ để giao diện gọn hơn
  const countPieces = (pieces: string[]) => {
    return pieces.reduce((acc, piece) => {
      acc[piece] = (acc[piece] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const whiteCounts = countPieces(capturedWhite);
  const blackCounts = countPieces(capturedBlack);

  const renderPieces = (counts: Record<string, number>, color: 'w' | 'b') => {
    const pieces = Object.entries(counts);
    if (pieces.length === 0) {
      return <span className="captured-empty">Chưa có...</span>;
    }

    return pieces.map(([piece, count]) => {
      // Dùng svg assets của quân cờ. (chess.js trả về type chữ thường, ta ghi hoa lên)
      const imgSrc = getPieceImageSrc(piece.toUpperCase(), color === 'w' ? 'white' : 'black');
      const isBlack = color === 'b';
      
      const elements = [];
      // Vẽ ra từng quân cờ hoặc hiện số x2, x3...
      // Để hình ảnh đẹp hơn, ta render từng icon đè lên nhau xíu
      for (let i = 0; i < count; i++) {
        elements.push(
          <img 
            key={`${piece}-${i}`} 
            src={imgSrc} 
            className={`captured-piece ${isBlack ? 'captured-piece-dark-shadow' : ''}`}
            alt={piece}
            style={{ marginLeft: i > 0 ? '-12px' : '0', zIndex: i }}
            draggable={false}
          />
        );
      }
      return <div key={piece} style={{ display: 'flex', marginRight: '8px' }}>{elements}</div>;
    });
  };

  if (capturedWhite.length === 0 && capturedBlack.length === 0) {
    return null;
  }

  return (
    <div className="captured-pieces-panel glass-panel animate-fade-in">
      <h4 className="captured-title">
        <span className="material-icons-round" style={{fontSize: 18}}>military_tech</span> Quân Bị Bắt
      </h4>
      
      {/* Quân trắng bị bắt (Nằm ở phần quân Đen) */}
      <div className="captured-section black-captures" title="Quân Trắng bị bắt">
        {renderPieces(whiteCounts, 'w')}
      </div>
      
      {/* Quân đen bị bắt (Nằm ở phần quân Trắng) */}
      <div className="captured-section white-captures" title="Quân Đen bị bắt">
        {renderPieces(blackCounts, 'b')}
      </div>
    </div>
  );
};

export default CapturedPieces;
