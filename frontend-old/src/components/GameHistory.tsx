import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { GameHistoryEntry } from '../types/chess';
import './GameHistory.css';

interface GameHistoryProps {
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ onClose }) => {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory();
      setHistory(data.history.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHistory(id);
      setHistory(h => h.filter(g => g.id !== id));
    } catch { /* ignore */ }
  };
  
  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử ván đấu?')) return;
    try {
      await api.clearAllHistory();
      setHistory([]);
    } catch { /* ignore */ }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const statusLabel = (g: GameHistoryEntry) => {
    if (g.winner) return (
      <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
        <span className="material-icons-round" style={{fontSize: 16, color: 'var(--accent-secondary)'}}>emoji_events</span>
        {g.winner === 'white' ? 'Trắng thắng' : 'Đen thắng'}
      </span>
    );
    if (g.status === 'draw') return (
      <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
        <span className="material-icons-round" style={{fontSize: 16, color: 'var(--text-secondary)'}}>handshake</span>
        Hòa cờ
      </span>
    );
    return (
      <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
        <span className="material-icons-round" style={{fontSize: 16, color: 'var(--accent-info)'}}>pause_circle</span>
        Chưa hoàn tất
      </span>
    );
  };

  const modeIcon = (mode: string) => {
    if (mode === 'pvp') return 'people';
    if (mode === 'pvai') return 'smart_toy';
    return 'precision_manufacturing';
  };

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-panel glass-panel animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3 style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span className="material-icons-round" style={{color: 'var(--accent-secondary)'}}>auto_stories</span> Lịch Sử
          </h3>
          <div className="history-header-actions">
            {history.length > 0 && (
              <button 
                className="btn btn-icon btn-clear-all" 
                onClick={handleClearAll}
                title="Xóa tất cả"
              >
                <span className="material-icons-round">delete_sweep</span>
              </button>
            )}
            <button className="btn btn-icon" onClick={onClose}>
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>

        {loading && <p className="history-loading">Đang tải...</p>}

        {!loading && history.length === 0 && (
          <p className="history-empty">Chưa có lịch sử ván đấu nào.</p>
        )}

        <div className="history-list">
          {history.map((g) => (
            <div key={g.id} className="history-item">
              <div className="history-item-info">
                <div className="history-item-top">
                  <span className="history-id">#{g.id}</span>
                  <span className="history-mode" title={g.mode}>
                     <span className="material-icons-round" style={{fontSize: 16}}>{modeIcon(g.mode)}</span>
                  </span>
                  <span className="history-status">{statusLabel(g)}</span>
                </div>
                <div className="history-item-bottom">
                  <span className="history-date">
                     <span className="material-icons-round" style={{fontSize: 12, verticalAlign: 'middle', marginRight: 4}}>calendar_today</span> 
                     {formatDate(g.created_at)}
                  </span>
                  <span className="history-moves">
                     <span className="material-icons-round" style={{fontSize: 12, verticalAlign: 'middle', marginRight: 4}}>tag</span>
                     {g.move_count} nước
                  </span>
                </div>
              </div>
              <button
                className="btn btn-icon btn-delete"
                onClick={() => handleDelete(g.id)}
                title="Xóa"
              >
                <span className="material-icons-round" style={{color: 'var(--accent-danger)'}}>delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
