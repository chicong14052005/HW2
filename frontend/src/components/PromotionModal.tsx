import { getPieceImageSrc } from '../utils/chess';
import './PromotionModal.css';

interface PromotionModalProps {
  color: 'white' | 'black';
  onSelect: (piece: string) => void;
  onCancel?: () => void;
}

export function PromotionModal({ color, onSelect, onCancel }: PromotionModalProps) {
  const pieces = [
    { type: 'Q', name: 'Hậu' },
    { type: 'R', name: 'Xe' },
    { type: 'B', name: 'Tượng' },
    { type: 'N', name: 'Mã' },
  ];

  return (
    <div className="promotion-modal-overlay">
      <div className={`promotion-modal ${color}`}>
        <h3>Chọn quân phong cấp</h3>
        <div className="promotion-options">
          {pieces.map((p) => (
            <button
              key={p.type}
              className="promotion-btn"
              onClick={() => onSelect(p.type)}
              title={p.name}
            >
              <img 
                src={getPieceImageSrc(p.type, color)} 
                alt={`${color} ${p.name}`} 
                className={`promotion-piece-img promotion-piece-${color}`}
              />
            </button>
          ))}
        </div>
        {onCancel && (
          <button className="promotion-cancel-btn" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}
