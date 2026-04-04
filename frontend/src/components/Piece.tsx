import React, { useLayoutEffect, useRef } from 'react';
import type { PieceType, PieceColor } from '../types/chess';
import { getPieceImageSrc } from '../utils/chess';
import './Piece.css';

interface PieceProps {
  type: PieceType;
  color: PieceColor;
  currentRow?: number;
  currentCol?: number;
  lastMoveFrom?: [number, number];
  animationSpeed?: number;
}

const Piece: React.FC<PieceProps> = ({ 
  type, color, currentRow, currentCol, lastMoveFrom, animationSpeed = 300
}) => {
  const pieceRef = useRef<HTMLImageElement>(null);
  
  // Xử lý hiệu ứng di chuyển khi có sự thay đổi lastMoveFrom
  const lastMoveFromStr = lastMoveFrom ? `${lastMoveFrom[0]},${lastMoveFrom[1]}` : null;

  useLayoutEffect(() => {
    if (!pieceRef.current || !lastMoveFromStr || currentRow === undefined || currentCol === undefined) {
      return;
    }
    
    // Disable animation if speed is 0
    if (animationSpeed <= 0) return;

    // Lấy frame của ô cờ để biết độ dời pixel chính xác
    const parentSquare = pieceRef.current.parentElement;
    if (!parentSquare) return;

    const sqRect = parentSquare.getBoundingClientRect();
    
    // Tính toán độ dời so với ô khởi điểm
    const [fromR, fromC] = lastMoveFromStr.split(',').map(Number);
    const deltaY = (fromR - currentRow) * sqRect.height;
    const deltaX = (fromC - currentCol) * sqRect.width;

    if (deltaX === 0 && deltaY === 0) return;

    // Thiết lập đường dẫn animation
    // Với quân Mã (Knight - 'N'), thêm 1 keyframe ở giữa tạo đường cong parabol
    if (type === 'N') {
      pieceRef.current.animate([
        { transform: `translate(${deltaX}px, ${deltaY}px)`, zIndex: 10 },
        { 
          transform: `translate(${deltaX / 2}px, ${deltaY / 2 - 40}px) scale(1.1)`, 
          zIndex: 10,
          opacity: 0.9,
          filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'
        },
        { transform: `translate(0px, 0px) scale(1)`, zIndex: 1 }
      ], {
        duration: animationSpeed,
        easing: 'ease-in-out',
        fill: 'forwards'
      });
    } else {
      // Linear transition cho các quân khác
      pieceRef.current.animate([
        { transform: `translate(${deltaX}px, ${deltaY}px)`, zIndex: 5 },
        { transform: `translate(0px, 0px)`, zIndex: 1 }
      ], {
        duration: animationSpeed,
        easing: 'ease-out',
        fill: 'forwards'
      });
    }
    
  }, [lastMoveFromStr, currentRow, currentCol, type, animationSpeed]);

  const src = getPieceImageSrc(type, color);

  if (!src) return null;

  return (
    <img
      ref={pieceRef}
      className={`chess-piece piece-${color}`}
      src={src}
      alt={`${color} ${type}`}
      draggable={false}
    />
  );
};

export default React.memo(Piece);
