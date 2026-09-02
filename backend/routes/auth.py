from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from database import db
from models import User, WorkSession
from utils.jwt import create_token, token_required
from utils.mail import send_reset_email, generate_reset_token

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_token(user.id)
    return jsonify({'message': 'Registration successful', 'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_token(user.id)

    # Start or retrieve active work session for today (Exclude master Admin arun@aszen.com)
    active_session = None
    if user.email.lower() != 'arun@aszen.com':
        today_str = datetime.utcnow().strftime('%Y-%m-%d')
        active_session = WorkSession.query.filter_by(
            user_email=user.email,
            date=today_str,
            status='Active'
        ).first()

        if not active_session:
            active_session = WorkSession(
                user_id=user.id,
                user_email=user.email,
                user_name=user.name or user.email.split('@')[0].capitalize(),
                user_role=user.role or 'employee',
                date=today_str,
                login_time=datetime.utcnow(),
                status='Active'
            )
            db.session.add(active_session)
            db.session.commit()

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict(),
        'work_session': active_session.to_dict() if active_session else None
    })



@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    user = request.current_user
    active_session = WorkSession.query.filter_by(
        user_email=user.email,
        status='Active'
    ).order_by(WorkSession.login_time.desc()).first()

    if active_session:
        active_session.logout_time = datetime.utcnow()
        active_session.status = 'Completed'
        active_session.calculate_hours()
        db.session.commit()

    return jsonify({'message': 'Logged out successfully'})


@auth_bp.route('/me', methods=['GET'])
@token_required
def me():
    return jsonify({'user': request.current_user.to_dict()})



@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    user = User.query.filter_by(email=email).first()
    if user:
        token = generate_reset_token()
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        send_reset_email(user.email, token)

    return jsonify({
        'message': 'If an account exists with that email, a reset link has been sent.',
    })


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token') or ''
    new_password = data.get('password') or ''

    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return jsonify({'message': 'Invalid or expired reset token'}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({'message': 'Password reset successful'})


# Admin User Management Routes
@auth_bp.route('/users', methods=['GET'])
@token_required
def get_users():
    user = request.current_user
    if user.role != 'admin':
        return jsonify({'message': 'Permission denied'}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]})


@auth_bp.route('/users', methods=['POST'])
@token_required
def create_user():
    current = request.current_user
    if current.role != 'admin':
        return jsonify({'message': 'Permission denied. Only Admin can create users.'}), 403

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    designation = (data.get('designation') or 'Editor').strip()
    password = data.get('password') or 'Aszen@123'

    if not email or not name:
        return jsonify({'message': 'Name and Email are required.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User with this email already exists.'}), 409

    role = 'manager' if designation.lower() == 'manager' else 'employee'

    new_user = User(
        email=email,
        name=name,
        role=role,
        designation=designation
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user': new_user.to_dict()}), 201


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    current = request.current_user
    if current.role != 'admin':
        return jsonify({'message': 'Permission denied. Only Admin can delete users.'}), 403

    target = User.query.get(user_id)
    if not target:
        return jsonify({'message': 'User not found'}), 404

    if target.role == 'admin':
        return jsonify({'message': 'Cannot delete master Admin account.'}), 400

    db.session.delete(target)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'})

