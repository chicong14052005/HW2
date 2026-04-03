"""
Chess Game Backend - Flask REST API
Kết nối React Frontend với Python Chess Engine.

Cải tiến:
- NV3: Trả all legal moves dict (click tức thời < 0.1s)
- NV4: Pawn Promotion linh hoạt (promotion_required flag)
- NV5: Non-blocking AI (threading + polling /ai-status)
"""
import sys
import os
import json
import time
import uuid
import threading

# Thêm thư mục backend vào path
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify
from flask_cors import CORS

from engine.board import Board
from engine.movelogic import (
    get_all_legal_moves, is_in_check, is_checkmate,
    is_stalemate, is_draw, can_castle, is_pawn_promotion, can_en_passant,
    get_position_key, has_sufficient_material_to_mate
)
from engine.pieces import Queen, Rook, Bishop, Knight
from ai.alphabeta import find_best_move as ab_find_best_move
from ai.mcts import find_best_move as mcts_find_best_move
from database.db import (
    create_game, get_game, get_all_games, update_game,
    delete_game, save_to_history, get_history, delete_history_entry,
    cleanup_finished_games, clear_all_history
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

# In-memory stores
active_boards = {}       # game_id -> Board
ai_tasks = {}            # task_id -> {status, result, game_id, thread}
ai_game_tasks = {}       # game_id -> task_id (1 game chỉ có 1 task đang chạy)
position_history = {}    # game_id -> list of position keys (for threefold repetition)
halfmove_clocks = {}     # game_id -> int (for 50-move rule)

import logging
class EndpointFilter(logging.Filter):
    def filter(self, record):
        return '/ai-status' not in record.getMessage()

# Mute repetitive polling logs
log = logging.getLogger('werkzeug')
log.addFilter(EndpointFilter())

# ============================================================================
# Helper Functions
# ============================================================================

def board_to_json(board):
    """Serialize Board object thành JSON-friendly dict."""
    grid = []
    for r in range(8):
        row = []
        for c in range(8):
            piece = board.grid[r][c]
            if piece:
                row.append({'type': piece.name, 'color': piece.color})
            else:
                row.append(None)
        grid.append(row)
    return {'grid': grid, 'turn': board.turn}


def get_all_legal_moves_with_castling(board):
    """Lấy tất cả legal moves bao gồm castling."""
    color = board.turn
    all_moves = get_all_legal_moves(board, color)

    king_row = 7 if color == 'white' else 0
    king_pos = (king_row, 4)

    if can_castle(board, color, 'K'):
        all_moves.append((king_pos, (king_row, 6)))
    if can_castle(board, color, 'Q'):
        all_moves.append((king_pos, (king_row, 2)))

    return all_moves


def get_legal_moves_dict(board):
    """
    NV3: Trả về dict chứa TẤT CẢ legal moves của mọi quân cờ.
    Key: "row,col" (string), Value: [[r1,c1], [r2,c2], ...]
    Frontend cache dict này → click tức thời, không cần gọi API.
    """
    all_moves = get_all_legal_moves_with_castling(board)
    moves_dict = {}

    for from_pos, to_pos in all_moves:
        key = '{},{}'.format(from_pos[0], from_pos[1])
        if key not in moves_dict:
            moves_dict[key] = []
        moves_dict[key].append([to_pos[0], to_pos[1]])

    return moves_dict


def get_legal_moves_json(board, position=None):
    """Lấy danh sách nước đi cho API cũ (backward compat)."""
    all_moves = get_all_legal_moves_with_castling(board)

    if position:
        pos = tuple(position)
        filtered = [m for m in all_moves if m[0] == pos]
        return [{'from': list(m[0]), 'to': list(m[1])} for m in filtered]

    return [{'from': list(m[0]), 'to': list(m[1])} for m in all_moves]


def get_game_status(board, game_id=None):
    """
    Lấy trạng thái game hiện tại.
    Bao gồm kiểm tra các điều kiện hòa: stalemate, insufficient material,
    threefold repetition, 50-move rule.
    """
    color = board.turn
    
    # Lấy position history và halfmove clock cho game này
    pos_history = position_history.get(game_id, []) if game_id else []
    hmc = halfmove_clocks.get(game_id, 0) if game_id else 0
    
    # Kiểm tra draw với đầy đủ điều kiện
    draw_result, draw_reason = is_draw(board, pos_history, hmc)
    
    status = {
        'is_check': is_in_check(board, color),
        'is_checkmate': is_checkmate(board, color),
        'is_stalemate': is_stalemate(board, color),
        'is_draw': draw_result,
        'draw_reason': draw_reason,
        'game_over': False,
        'winner': None,
        'message': ''
    }

    if status['is_checkmate']:
        winner = 'black' if color == 'white' else 'white'
        status['game_over'] = True
        status['winner'] = winner
        status['message'] = 'Chiếu bí! {} thắng!'.format(winner.capitalize())
    elif status['is_stalemate']:
        status['game_over'] = True
        status['message'] = 'Hòa cờ - Bế tắc (Stalemate)!'
        status['draw_reason'] = 'stalemate'
    elif status['is_draw']:
        status['game_over'] = True
        draw_messages = {
            'insufficient_material': 'Hòa cờ - Không đủ quân chiếu bí!',
            'threefold_repetition': 'Hòa cờ - Thế cờ lặp lại 3 lần!',
            'fifty_move_rule': 'Hòa cờ - 50 nước không ăn quân/đi tốt!',
            'stalemate': 'Hòa cờ - Bế tắc (Stalemate)!',
        }
        status['message'] = draw_messages.get(draw_reason, 'Hòa cờ (Draw)!')
    elif status['is_check']:
        status['message'] = 'Vua đen đang bị chiếu!' if format(color.capitalize()) == 'Black' else 'Vua trắng đang bị chiếu!'

    return status


def execute_move(board, from_pos, to_pos, promotion_piece=None):
    """
    Thực hiện nước đi, xử lý castling, en passant, pawn promotion.
    NV4: Nếu move là promotion nhưng promotion_piece=None → return promotion_required.
    """
    start = tuple(from_pos)
    end = tuple(to_pos)
    piece = board.get_piece(start)

    if not piece:
        return {'success': False, 'error': 'Khong co quan co tai vi tri do'}

    if piece.color != board.turn:
        return {'success': False, 'error': 'Khong phai luot cua ban'}

    # Kiểm tra nước đi hợp lệ
    legal_moves = get_all_legal_moves_with_castling(board)

    if (start, end) not in legal_moves:
        return {'success': False, 'error': 'Nuoc di khong hop le'}

    # NV4: Kiểm tra promotion TRƯỚC khi thực hiện
    if piece.name == 'P':
        promo_row = 0 if piece.color == 'white' else 7
        if end[0] == promo_row and promotion_piece is None:
            return {
                'success': False,
                'promotion_required': True,
                'from': list(start),
                'to': list(end),
                'error': None
            }

    result = {
        'success': True,
        'captured': None,
        'special_move': None,
        'promotion': False,
        'promotion_required': False
    }

    # --- Castling ---
    if piece.name == 'K' and abs(end[1] - start[1]) == 2:
        if end[1] == 6:
            result['special_move'] = 'castle_kingside'
            rook_start = (start[0], 7)
            rook_end = (start[0], 5)
        else:
            result['special_move'] = 'castle_queenside'
            rook_start = (start[0], 0)
            rook_end = (start[0], 3)

        board.move_piece(start, end)
        rook = board.grid[rook_start[0]][rook_start[1]]
        board.grid[rook_end[0]][rook_end[1]] = rook
        board.grid[rook_start[0]][rook_start[1]] = None
        board._update_piece_list(rook_start, 'remove', rook.color)
        board._update_piece_list(rook_end, 'add', rook.color)
        board.piece_moved[rook_end] = True
        if rook_start in board.piece_moved:
            del board.piece_moved[rook_start]

    # --- En Passant ---
    elif piece.name == 'P' and can_en_passant(board, start, end, piece):
        result['special_move'] = 'en_passant'
        captured_pawn_pos = (start[0], end[1])
        captured = board.grid[captured_pawn_pos[0]][captured_pawn_pos[1]]
        if captured:
            result['captured'] = {'type': captured.name, 'color': captured.color}
        board.move_piece(start, end)
        board.grid[captured_pawn_pos[0]][captured_pawn_pos[1]] = None
        if captured:
            board._update_piece_list(captured_pawn_pos, 'remove', captured.color)

    # --- Nước đi thường ---
    else:
        captured = board.get_piece(end)
        if captured:
            result['captured'] = {'type': captured.name, 'color': captured.color}
        board.move_piece(start, end)

    # --- Pawn Promotion ---
    moved_piece = board.get_piece(end)
    if moved_piece and moved_piece.name == 'P':
        promo_row = 0 if moved_piece.color == 'white' else 7
        if end[0] == promo_row:
            result['promotion'] = True
            promo_map = {'Q': Queen, 'R': Rook, 'B': Bishop, 'N': Knight}
            promo_cls = promo_map.get(promotion_piece, Queen)
            promo_name = promotion_piece if promotion_piece in promo_map else 'Q'
            board.grid[end[0]][end[1]] = promo_cls(moved_piece.color, promo_name)
            result['special_move'] = 'promotion'

    return result


def persist_board_state(game_id, board):
    """Lưu board state vào game record."""
    game_record = get_game(game_id)
    if game_record:
        game_record['board_state'] = board.to_dict()
        update_game(game_id, game_record)


def restore_board(game_id):
    """Khôi phục Board object từ game record."""
    game_record = get_game(game_id)
    if not game_record:
        return None
    board_data = game_record.get('board_state')
    if board_data:
        try:
            return Board.from_dict(board_data)
        except Exception:
            pass
    return Board()


def get_or_restore_board(game_id):
    """Helper: lấy board từ memory hoặc restore."""
    if game_id in active_boards:
        return active_boards[game_id]
    board = restore_board(game_id)
    if board:
        active_boards[game_id] = board
    return board


def build_response(board, game_id, extra=None):
    """Build standard JSON response."""
    data = {
        'board': board_to_json(board),
        'status': get_game_status(board, game_id),
        'legal_moves': get_legal_moves_json(board),
        'legal_moves_dict': get_legal_moves_dict(board),  # NV3
        'game_info': get_game(game_id)
    }
    if extra:
        data.update(extra)
    return data


def update_game_record_after_move(game_id, board, result, from_pos, to_pos, ai_info=None):
    """Cập nhật game record sau mỗi nước đi."""
    game_record = get_game(game_id)
    if not game_record:
        return game_record

    piece_at_dest = board.get_piece(tuple(to_pos))
    move_entry = {
        'from': list(from_pos),
        'to': list(to_pos),
        'piece': piece_at_dest.name if piece_at_dest else '?',
        'captured': result.get('captured'),
        'special': result.get('special_move')
    }
    if ai_info:
        move_entry.update(ai_info)

    game_record['move_history'].append(move_entry)
    game_record['move_count'] += 1
    game_record['turn'] = board.turn

    if result.get('captured'):
        cap = result['captured']
        if cap['color'] == 'white':
            game_record['captured_white'].append(cap['type'])
        else:
            game_record['captured_black'].append(cap['type'])

    # Update position history for threefold repetition
    if game_id in position_history:
        position_history[game_id].append(get_position_key(board))
    else:
        position_history[game_id] = [get_position_key(board)]
    
    # Update halfmove clock for 50-move rule
    # Reset if pawn moved or piece captured, otherwise increment
    moved_piece_type = move_entry.get('piece', '')
    was_capture = result.get('captured') is not None
    if moved_piece_type == 'P' or was_capture:
        halfmove_clocks[game_id] = 0
    else:
        halfmove_clocks[game_id] = halfmove_clocks.get(game_id, 0) + 1

    status = get_game_status(board, game_id)
    if status['game_over']:
        game_record['status'] = 'checkmate' if status['is_checkmate'] else 'draw'
        game_record['winner'] = status.get('winner')
        save_to_history(game_record)
        delete_game(game_id)
        # Cleanup memory
        if game_id in position_history:
            del position_history[game_id]
        if game_id in halfmove_clocks:
            del halfmove_clocks[game_id]
    else:
        update_game(game_id, game_record)

    persist_board_state(game_id, board)
    return game_record


# ============================================================================
# NV5: AI Background Worker
# ============================================================================

def _ai_worker(task_id, game_id, board_copy, algorithm, depth, iterations, max_time):
    """Worker thread cho AI. Chạy trong background."""
    try:
        start_time = time.time()

        if algorithm == 'mcts':
            best_move = mcts_find_best_move(board_copy, iterations=iterations, max_time=max_time)
        else:
            best_move = ab_find_best_move(board_copy, depth=depth)

        elapsed = round(time.time() - start_time, 3)

        ai_tasks[task_id] = {
            'status': 'done',
            'game_id': game_id,
            'best_move': best_move,
            'algorithm': algorithm,
            'elapsed': elapsed,
            'error': None
        }
    except Exception as e:
        ai_tasks[task_id] = {
            'status': 'error',
            'game_id': game_id,
            'best_move': None,
            'algorithm': algorithm,
            'elapsed': 0,
            'error': str(e)
        }


def cancel_ai_task(game_id):
    """Cancel AI task cho game (nếu đang chạy)."""
    task_id = ai_game_tasks.get(game_id)
    if task_id and task_id in ai_tasks:
        ai_tasks[task_id]['status'] = 'cancelled'
    if game_id in ai_game_tasks:
        del ai_game_tasks[game_id]


# ============================================================================
# API Endpoints
# ============================================================================

@app.route('/api/game/new', methods=['POST'])
def new_game():
    """Tạo game mới."""
    data = request.get_json() or {}
    mode = data.get('mode', 'pvai')
    algorithm = data.get('algorithm', 'alphabeta')
    depth = data.get('depth', 3)
    iterations = data.get('iterations', 500)
    
    # AI vs AI: cho phép cấu hình riêng cho từng AI
    white_ai = data.get('white_ai')  # {algorithm, depth, iterations}
    black_ai = data.get('black_ai')  # {algorithm, depth, iterations}

    game_record = create_game(
        mode=mode, ai_algorithm=algorithm,
        ai_depth=depth, ai_iterations=iterations
    )
    game_id = game_record['id']
    
    # Lưu cấu hình AI cho AI vs AI
    if mode == 'aivai':
        game_record['white_ai'] = white_ai or {'algorithm': algorithm, 'depth': depth, 'iterations': iterations}
        game_record['black_ai'] = black_ai or {'algorithm': algorithm, 'depth': depth, 'iterations': iterations}
        update_game(game_id, game_record)

    board = Board()
    active_boards[game_id] = board
    
    # Initialize position history and halfmove clock for draw detection
    position_history[game_id] = [get_position_key(board)]
    halfmove_clocks[game_id] = 0
    
    persist_board_state(game_id, board)

    resp = build_response(board, game_id)
    resp['game_id'] = game_id
    return jsonify(resp)


@app.route('/api/game/<game_id>/state', methods=['GET'])
def game_state(game_id):
    """Lấy trạng thái game hiện tại."""
    board = get_or_restore_board(game_id)
    if not board:
        return jsonify({'error': 'Game not found'}), 404

    resp = build_response(board, game_id)
    resp['game_id'] = game_id
    return jsonify(resp)


@app.route('/api/game/<game_id>/move', methods=['POST'])
def make_move(game_id):
    """Thực hiện nước đi của người chơi."""
    board = get_or_restore_board(game_id)
    if not board:
        return jsonify({'error': 'Game not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400

    from_pos = data.get('from')
    to_pos = data.get('to')
    promotion = data.get('promotion')  # NV4: None nếu chưa chọn

    if not from_pos or not to_pos:
        return jsonify({'error': 'Missing from/to positions'}), 400

    result = execute_move(board, from_pos, to_pos, promotion)

    # NV4: Promotion required — frontend cần hiện Modal
    if result.get('promotion_required'):
        return jsonify({
            'promotion_required': True,
            'from': result['from'],
            'to': result['to'],
            'board': board_to_json(board),
            'status': get_game_status(board),
        })

    if not result['success']:
        return jsonify({'error': result['error']}), 400

    game_record = update_game_record_after_move(game_id, board, result, from_pos, to_pos)

    resp = build_response(board, game_id, {'move_result': result})
    resp['game_info'] = get_game(game_id) or game_record
    return jsonify(resp)


@app.route('/api/game/<game_id>/ai-move', methods=['POST'])
def ai_move(game_id):
    """NV5: Khởi chạy AI trong background thread."""
    board = get_or_restore_board(game_id)
    if not board:
        return jsonify({'error': 'Game not found'}), 404

    # Cancel task cũ nếu có
    cancel_ai_task(game_id)

    data = request.get_json() or {}
    algorithm = data.get('algorithm', 'alphabeta')
    depth = data.get('depth', 3)
    iterations = data.get('iterations', 500)
    max_time = data.get('max_time', 3.0)

    task_id = uuid.uuid4().hex[:12]
    ai_tasks[task_id] = {
        'status': 'calculating',
        'game_id': game_id,
        'best_move': None,
        'algorithm': algorithm,
        'elapsed': 0,
        'error': None
    }
    ai_game_tasks[game_id] = task_id

    # Clone board cho thread (tránh race condition)
    board_copy = board.copy()

    thread = threading.Thread(
        target=_ai_worker,
        args=(task_id, game_id, board_copy, algorithm, depth, iterations, max_time),
        daemon=True
    )
    thread.start()

    return jsonify({
        'status': 'calculating',
        'task_id': task_id,
        'game_id': game_id
    })


@app.route('/api/game/<game_id>/ai-status', methods=['GET'])
def ai_status(game_id):
    """NV5: Polling endpoint — kiểm tra AI đã nghĩ xong chưa."""
    task_id = ai_game_tasks.get(game_id)
    if not task_id or task_id not in ai_tasks:
        return jsonify({'status': 'no_task', 'game_id': game_id})

    task = ai_tasks[task_id]

    if task['status'] == 'calculating':
        return jsonify({'status': 'calculating', 'task_id': task_id})

    if task['status'] == 'cancelled':
        # Cleanup
        if task_id in ai_tasks:
            del ai_tasks[task_id]
        if game_id in ai_game_tasks:
            del ai_game_tasks[game_id]
        return jsonify({'status': 'cancelled', 'task_id': task_id})

    if task['status'] == 'error':
        error_msg = task.get('error', 'Unknown error')
        if task_id in ai_tasks:
            del ai_tasks[task_id]
        if game_id in ai_game_tasks:
            del ai_game_tasks[game_id]

        board = get_or_restore_board(game_id)
        if board:
            resp = build_response(board, game_id, {'error': 'AI error: {}'.format(error_msg)})
            resp['status_ai'] = 'error'
            return jsonify(resp)
        return jsonify({'status': 'error', 'error': error_msg}), 500

    # status == 'done'
    best_move = task.get('best_move')
    elapsed = task.get('elapsed', 0)
    algorithm = task.get('algorithm', 'alphabeta')

    # Cleanup task
    if task_id in ai_tasks:
        del ai_tasks[task_id]
    if game_id in ai_game_tasks:
        del ai_game_tasks[game_id]

    board = get_or_restore_board(game_id)
    if not board:
        return jsonify({'error': 'Game not found'}), 404

    if not best_move:
        resp = build_response(board, game_id, {'error': 'AI khong tim duoc nuoc di'})
        resp['status_ai'] = 'done'
        return jsonify(resp)

    from_pos = list(best_move[0])
    to_pos = list(best_move[1])
    result = execute_move(board, from_pos, to_pos, 'Q')  # AI luôn promote Queen

    if not result['success']:
        resp = build_response(board, game_id, {'error': 'AI move failed: {}'.format(result.get('error'))})
        resp['status_ai'] = 'error'
        return jsonify(resp)

    ai_info = {
        'ai': True,
        'algorithm': algorithm,
        'think_time': elapsed
    }
    game_record = update_game_record_after_move(game_id, board, result, from_pos, to_pos, ai_info)

    resp = build_response(board, game_id, {
        'move_result': result,
        'ai_info': {
            'algorithm': algorithm,
            'move': {'from': from_pos, 'to': to_pos},
            'think_time': elapsed
        },
    })
    resp['status_ai'] = 'done'
    resp['game_info'] = get_game(game_id) or game_record
    return jsonify(resp)


@app.route('/api/game/<game_id>/legal-moves', methods=['GET'])
def legal_moves(game_id):
    """Lấy nước đi hợp lệ (backward compat — NV3 làm giảm nhu cầu endpoint này)."""
    board = get_or_restore_board(game_id)
    if not board:
        return jsonify({'error': 'Game not found'}), 404

    row = request.args.get('row', type=int)
    col = request.args.get('col', type=int)
    position = [row, col] if row is not None and col is not None else None
    moves = get_legal_moves_json(board, position)
    return jsonify({'moves': moves})


@app.route('/api/game/<game_id>/undo', methods=['POST'])
def undo_move_api(game_id):
    """
    Hoàn tác nước đi.
    Trong chế độ PvAI (người chơi quân trắng, AI quân đen):
    - Nếu đang là lượt trắng (người vừa đi xong, AI vừa đi) → undo 2 lần
    - Nếu đang là lượt đen (người chưa đi, AI chưa đi) → undo 1 lần
    """
    board = get_or_restore_board(game_id)
    if not board:
        return jsonify({'error': 'Game not found'}), 404

    if not board.move_history:
        return jsonify({'error': 'Khong co nuoc di de hoan tac'}), 400

    game_record = get_game(game_id)
    if not game_record:
        return jsonify({'error': 'Game record not found'}), 404

    mode = game_record.get('mode', 'pvp')
    
    # Xác định số lần undo
    undo_count = 1
    
    if mode == 'pvai':
        # Trong PvAI, người chơi là quân trắng, AI là quân đen
        # Nếu đang là lượt trắng → người vừa đi, AI vừa đáp lại → cần undo 2 lần
        # Nếu đang là lượt đen → chỉ người vừa đi, AI chưa đi → undo 1 lần
        if board.turn == 'white' and len(board.move_history) >= 2:
            # Kiểm tra xem nước đi cuối có phải của AI không
            if game_record['move_history'] and game_record['move_history'][-1].get('ai'):
                undo_count = 2
    
    # Thực hiện undo
    for _ in range(undo_count):
        if board.move_history:
            board.undo_move()
            if game_record['move_history']:
                game_record['move_history'].pop()
                game_record['move_count'] = max(0, game_record['move_count'] - 1)

    game_record['turn'] = board.turn
    update_game(game_id, game_record)
    persist_board_state(game_id, board)

    resp = build_response(board, game_id)
    return jsonify(resp)


@app.route('/api/game/<game_id>/quit', methods=['POST'])
def quit_game(game_id):
    """Thoát game — cancel AI task nếu đang chạy."""
    cancel_ai_task(game_id)
    if game_id in active_boards:
        del active_boards[game_id]
    delete_game(game_id)
    return jsonify({'message': 'Game quit successfully'})


@app.route('/api/games', methods=['GET'])
def list_games():
    games = get_all_games()
    return jsonify({'games': games})


@app.route('/api/game/<game_id>', methods=['DELETE'])
def remove_game(game_id):
    cancel_ai_task(game_id)
    if game_id in active_boards:
        del active_boards[game_id]
    success = delete_game(game_id)
    if success:
        return jsonify({'message': 'Game deleted'})
    return jsonify({'error': 'Game not found'}), 404


@app.route('/api/history', methods=['GET'])
def game_history():
    history = get_history()
    return jsonify({'history': history})


@app.route('/api/history/<game_id>', methods=['DELETE'])
def remove_history(game_id):
    success = delete_history_entry(game_id)
    if success:
        return jsonify({'message': 'History entry deleted'})
    return jsonify({'error': 'Entry not found'}), 404


@app.route('/api/history/clear', methods=['POST'])
def clear_history():
    """Xóa toàn bộ lịch sử ván đấu."""
    clear_all_history()
    return jsonify({'message': 'All history cleared'})


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == '__main__':
    cleanup_finished_games()
    print("Chess Game Backend - Starting...")
    print("API running at http://localhost:5000")
    print("Frontend expected at http://localhost:5173")
    app.run(debug=True, port=5000)
