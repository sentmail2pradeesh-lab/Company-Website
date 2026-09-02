from datetime import datetime
from flask import Blueprint, request, jsonify
from database import db
from models import User, WorkSession
from utils.jwt import token_required

work_hours_bp = Blueprint('work_hours', __name__)


@work_hours_bp.route('/session/login', methods=['POST'])
@token_required
def session_login():
    user = request.current_user

    # Master Admin arun@aszen.com does not record work sessions
    if user.email.lower() == 'arun@aszen.com':
        return jsonify({'message': 'Master Admin session exempt', 'session': None})

    today_str = datetime.utcnow().strftime('%Y-%m-%d')

    # Check if there is an active work session for user today
    existing = WorkSession.query.filter_by(
        user_email=user.email,
        date=today_str,
        status='Active'
    ).first()

    if not existing:
        existing = WorkSession(
            user_id=user.id,
            user_email=user.email,
            user_name=user.name or user.email.split('@')[0].capitalize(),
            user_role=user.role or 'employee',
            date=today_str,
            login_time=datetime.utcnow(),
            status='Active'
        )
        db.session.add(existing)
        db.session.commit()

    return jsonify({'message': 'Work session active', 'session': existing.to_dict()})


@work_hours_bp.route('/session/logout', methods=['POST'])
@token_required
def session_logout():
    user = request.current_user
    if user.email.lower() == 'arun@aszen.com':
        return jsonify({'message': 'Master Admin session exempt'})

    # Find active session or most recent un-ended session today/recently
    active_session = WorkSession.query.filter_by(
        user_email=user.email,
        status='Active'
    ).order_by(WorkSession.login_time.desc()).first()

    if active_session:
        active_session.logout_time = datetime.utcnow()
        active_session.status = 'Completed'
        active_session.calculate_hours()
        db.session.commit()
        return jsonify({'message': 'Work session logged out successfully', 'session': active_session.to_dict()})

    return jsonify({'message': 'No active session found'}), 200


@work_hours_bp.route('/my-stats', methods=['GET'])
@token_required
def my_stats():
    user = request.current_user
    email = user.email
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    current_month_prefix = datetime.utcnow().strftime('%Y-%m')

    user_sessions = WorkSession.query.filter(
        WorkSession.user_email == email
    ).order_by(WorkSession.login_time.desc()).all()

    today_sessions = [s for s in user_sessions if s.date == today_str]
    today_hours = sum(s.calculate_hours() for s in today_sessions)

    active_session = next((s for s in today_sessions if s.status == 'Active'), None)

    # Monthly stats
    month_sessions = [s for s in user_sessions if (s.date or '').startswith(current_month_prefix)]
    monthly_days = len(set(s.date for s in month_sessions if s.date))
    monthly_hours = sum(s.calculate_hours() for s in month_sessions)

    return jsonify({
        'today_hours': round(today_hours, 2),
        'active_session': active_session.to_dict() if active_session else None,
        'monthly_days_worked': monthly_days,
        'monthly_total_hours': round(monthly_hours, 2),
        'history': [s.to_dict() for s in user_sessions[:30]]
    })


@work_hours_bp.route('/all', methods=['GET'])
@token_required
def get_all_sessions():
    user = request.current_user
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied. Only Manager or Admin can access production working hour sheets.'}), 403

    # Always exclude master admin arun@aszen.com from production sheet logs
    query = WorkSession.query.filter(WorkSession.user_email != 'arun@aszen.com')

    date_param = request.args.get('date')
    if date_param:
        query = query.filter(WorkSession.date == date_param)

    month_param = request.args.get('month')
    if month_param:
        query = query.filter(WorkSession.date.like(f"{month_param}%"))

    employee_param = request.args.get('employee')
    if employee_param:
        query = query.filter(WorkSession.user_name.ilike(f"%{employee_param}%"))

    sessions = query.order_by(WorkSession.login_time.desc()).all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]})



@work_hours_bp.route('/manual', methods=['POST'])
@token_required
def add_manual_session():
    user = request.current_user
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json() or {}
    employee_name = data.get('user_name') or 'Employee'
    employee_email = data.get('user_email') or f"{employee_name.lower()}@aszen.com"
    session_date = data.get('date') or datetime.utcnow().strftime('%Y-%m-%d')
    login_iso = data.get('login_time')
    logout_iso = data.get('logout_time')
    notes = data.get('notes') or f"Manual entry by {user.name or user.role.capitalize()}"

    login_dt = datetime.fromisoformat(login_iso) if login_iso else datetime.utcnow()
    logout_dt = datetime.fromisoformat(logout_iso) if logout_iso else None

    new_session = WorkSession(
        user_name=employee_name,
        user_email=employee_email,
        user_role='employee',
        date=session_date,
        login_time=login_dt,
        logout_time=logout_dt,
        status='Completed' if logout_dt else 'Active',
        notes=notes
    )
    new_session.calculate_hours()
    db.session.add(new_session)
    db.session.commit()

    return jsonify({'message': 'Work session record created', 'session': new_session.to_dict()}), 201


@work_hours_bp.route('/<int:session_id>', methods=['PUT'])
@token_required
def update_session(session_id):
    user = request.current_user
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied'}), 403

    session_obj = WorkSession.query.get(session_id)
    if not session_obj:
        return jsonify({'message': 'Session log not found'}), 404

    data = request.get_json() or {}
    if 'user_name' in data:
        session_obj.user_name = data['user_name']
    if 'date' in data:
        session_obj.date = data['date']
    if 'login_time' in data and data['login_time']:
        session_obj.login_time = datetime.fromisoformat(data['login_time'].replace('Z', ''))
    if 'logout_time' in data:
        session_obj.logout_time = datetime.fromisoformat(data['logout_time'].replace('Z', '')) if data['logout_time'] else None
        session_obj.status = 'Completed' if session_obj.logout_time else 'Active'
    if 'notes' in data:
        session_obj.notes = data['notes']

    session_obj.calculate_hours()
    db.session.commit()
    return jsonify({'message': 'Session log updated', 'session': session_obj.to_dict()})


@work_hours_bp.route('/<int:session_id>', methods=['DELETE'])
@token_required
def delete_session(session_id):
    user = request.current_user
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied'}), 403

    session_obj = WorkSession.query.get(session_id)
    if not session_obj:
        return jsonify({'message': 'Session log not found'}), 404

    db.session.delete(session_obj)
    db.session.commit()
    return jsonify({'message': 'Session log deleted'})
