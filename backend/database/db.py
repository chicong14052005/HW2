"""
JSON Database module for Chess Game CRUD operations.
Lưu trữ game states, lịch sử ván cờ vào file JSON.
"""
import json
import os
import uuid
from datetime import datetime

# Đường dẫn đến thư mục data
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def _ensure_data_dir():
    """Đảm bảo thư mục data tồn tại."""
    os.makedirs(DATA_DIR, exist_ok=True)

def _get_filepath(filename):
    """Lấy đường dẫn đầy đủ đến file JSON."""
    _ensure_data_dir()
    return os.path.join(DATA_DIR, filename)

def _read_json(filename):
    """Đọc dữ liệu từ file JSON."""
    filepath = _get_filepath(filename)
    if not os.path.exists(filepath):
        return {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}

def _write_json(filename, data):
    """Ghi dữ liệu vào file JSON."""
    filepath = _get_filepath(filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ============================================================================
# CRUD Operations cho Games
# ============================================================================

GAMES_FILE = 'games.json'
HISTORY_FILE = 'history.json'

def create_game(mode='pvai', ai_algorithm='alphabeta', ai_depth=3, ai_iterations=500):
    """Tạo game mới."""
    game_id = str(uuid.uuid4())[:8]
    game_record = {
        'id': game_id,
        'mode': mode,
        'ai_algorithm': ai_algorithm,
        'ai_depth': ai_depth,
        'ai_iterations': ai_iterations,
        'status': 'active',
        'winner': None,
        'turn': 'white',
        'move_count': 0,
        'move_history': [],
        'captured_white': [],
        'captured_black': [],
        'board_state': None,  # Will be populated by persist_board_state
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'settings': {
            'timer_enabled': False,
            'timer_minutes': 10,
            'show_legal_moves': True,
        }
    }

    games = _read_json(GAMES_FILE)
    games[game_id] = game_record
    _write_json(GAMES_FILE, games)

    return game_record

def get_game(game_id):
    """Lấy thông tin game theo ID."""
    games = _read_json(GAMES_FILE)
    return games.get(game_id)

def get_all_games():
    """Lấy danh sách tất cả games."""
    games = _read_json(GAMES_FILE)
    return list(games.values())

def update_game(game_id, updates):
    """Cập nhật thông tin game."""
    games = _read_json(GAMES_FILE)
    if game_id not in games:
        return None

    games[game_id].update(updates)
    games[game_id]['updated_at'] = datetime.now().isoformat()
    _write_json(GAMES_FILE, games)

    return games[game_id]

def delete_game(game_id):
    """Xóa game theo ID."""
    games = _read_json(GAMES_FILE)
    if game_id not in games:
        return False

    del games[game_id]
    _write_json(GAMES_FILE, games)
    return True

def save_to_history(game_record):
    """
    Lưu game đã kết thúc vào lịch sử.
    Chỉ lưu thông tin kết quả (thắng/thua/hòa), không lưu toàn bộ nước đi.
    """
    history = _read_json(HISTORY_FILE)
    if not isinstance(history, dict):
        history = {}

    # Chỉ lưu thông tin tóm tắt, không lưu move_history và board_state
    history_entry = {
        'id': game_record['id'],
        'mode': game_record.get('mode', 'pvp'),
        'ai_algorithm': game_record.get('ai_algorithm', 'alphabeta'),
        'ai_depth': game_record.get('ai_depth', 3),
        'ai_iterations': game_record.get('ai_iterations', 500),
        'status': game_record.get('status', 'completed'),
        'winner': game_record.get('winner'),
        'move_count': game_record.get('move_count', 0),
        'created_at': game_record.get('created_at'),
        'completed_at': datetime.now().isoformat(),
        # Lưu cấu hình AI cho chế độ AI vs AI
        'white_ai': game_record.get('white_ai'),
        'black_ai': game_record.get('black_ai'),
    }

    history[game_record['id']] = history_entry
    _write_json(HISTORY_FILE, history)

def get_history():
    """Lấy toàn bộ lịch sử ván đấu."""
    history = _read_json(HISTORY_FILE)
    return list(history.values()) if isinstance(history, dict) else []

def delete_history_entry(game_id):
    """Xóa một entry khỏi lịch sử."""
    history = _read_json(HISTORY_FILE)
    if game_id in history:
        del history[game_id]
        _write_json(HISTORY_FILE, history)
        return True
    return False

def clear_all_history():
    """Xóa toàn bộ lịch sử ván đấu."""
    _write_json(HISTORY_FILE, {})
    return True

def cleanup_finished_games():
    """Dọn dẹp games đã kết thúc hoặc quá cũ khỏi games.json."""
    games = _read_json(GAMES_FILE)
    to_delete = []

    for game_id, game in games.items():
        # Xóa game đã kết thúc
        if game.get('status') in ('checkmate', 'draw', 'stalemate', 'resigned'):
            to_delete.append(game_id)
            continue

        # Xóa game quá cũ (>24h)
        try:
            created = datetime.fromisoformat(game.get('created_at', ''))
            if (datetime.now() - created).total_seconds() > 86400:
                to_delete.append(game_id)
        except (ValueError, TypeError):
            pass

    for game_id in to_delete:
        del games[game_id]

    if to_delete:
        _write_json(GAMES_FILE, games)
        print("Cleaned up {} old games".format(len(to_delete)))
