from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from database import db
from models import LeaveRequest, User, AuditLog
from utils.jwt import token_required

leaves_bp = Blueprint('leaves', __name__)

ANNUAL_LEAVE_DAYS = 18.0
MASTER_ADMINS = ['arun@aszen.com', 'gokul@aszen.com']


def calculate_working_days(start_str, end_str, is_half_day=False):
    """Calculates duration in days, strictly excluding Sundays (company weekly holiday)."""
    if not start_str:
        return 0.0
    if is_half_day:
        try:
            d = datetime.strptime(start_str, '%Y-%m-%d')
            # 6 is Sunday in Python
            return 0.0 if d.weekday() == 6 else 0.5
        except Exception:
            return 0.5
    if not end_str:
        return 0.0
    try:
        cur = datetime.strptime(start_str, '%Y-%m-%d')
        end = datetime.strptime(end_str, '%Y-%m-%d')
        if end < cur:
            return 0.0
        count = 0
        while cur <= end:
            # 6 is Sunday (weekly holiday)
            if cur.weekday() != 6:
                count += 1
            cur += timedelta(days=1)
        return float(count)
    except Exception:
        return 1.0


def log_audit(user, action, details=""):
    try:
        email = getattr(user, 'email', None) or (user if isinstance(user, str) else 'system')
        name = getattr(user, 'name', None) or email.split('@')[0].capitalize()
        log = AuditLog(
            user_email=email,
            user_name=name,
            action=action,
            details=details
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print("Audit log error in leaves:", e)


from sqlalchemy import func

@leaves_bp.route('', methods=['GET'])
@token_required
def get_leaves():
    current_user = request.current_user
    user_email = request.args.get('email')
    status = request.args.get('status')

    query = LeaveRequest.query
    user_email_lower = (current_user.email or '').strip().lower()
    is_admin_or_manager = (
        current_user.role in ['admin', 'manager']
        or user_email_lower in MASTER_ADMINS
        or current_user.has_permission('can_create_employee')
    )

    if not is_admin_or_manager:
        # Non-managers can only see their own requests by default
        query = query.filter(func.lower(LeaveRequest.user_email) == user_email_lower)
    elif user_email:
        query = query.filter(func.lower(LeaveRequest.user_email) == user_email.strip().lower())

    if status:
        query = query.filter_by(status=status)

    leaves = query.order_by(LeaveRequest.created_at.desc()).all()
    return jsonify({'leaveRequests': [l.to_dict() for l in leaves]})


@leaves_bp.route('', methods=['POST'])
@token_required
def create_leave():
    current_user = request.current_user
    data = request.get_json() or {}
    leave_type = data.get('leaveType') or 'Leave'
    start_date = data.get('startDate')
    end_date = data.get('endDate') or start_date
    reason = (data.get('reason') or '').strip()
    is_half_day = bool(data.get('isHalfDay', False))
    half_day_period = data.get('halfDayPeriod')
    backup_employee = data.get('backupEmployee') or ''
    emergency_contact = data.get('emergencyContact') or ''

    if not start_date or not reason:
        return jsonify({'message': 'Start date and reason are required'}), 400

    # Calculate net working days, excluding all Sundays
    days = calculate_working_days(start_date, end_date, is_half_day)
    if days <= 0:
        return jsonify({'message': 'The selected leave dates only include Sundays (weekly holiday). Please select working days.'}), 400

    applicant_email = data.get('userEmail') or current_user.email
    applicant_name = data.get('userName') or current_user.name or applicant_email.split('@')[0].capitalize()

    leave = LeaveRequest(
        user_id=current_user.id,
        user_email=applicant_email,
        user_name=applicant_name,
        leave_type='Leave',
        start_date=start_date,
        end_date=end_date,
        days=days,
        is_half_day=is_half_day,
        half_day_period=half_day_period,
        reason=reason,
        backup_employee=backup_employee,
        emergency_contact=emergency_contact,
        status='Pending'
    )
    db.session.add(leave)
    db.session.commit()

    log_audit(
        current_user,
        'LEAVE_REQUESTED',
        f"{applicant_name} submitted {days} day(s) leave request ({start_date} to {end_date}, Sundays excluded)"
    )

    return jsonify({
        'message': 'Leave request submitted successfully',
        'leaveRequest': leave.to_dict()
    }), 201


@leaves_bp.route('/<leave_id>/status', methods=['PATCH'])
@token_required
def update_leave_status(leave_id):
    current_user = request.current_user
    leave = None
    try:
        clean_id = int(str(leave_id).replace('LR-', '').replace('lr-', '').replace('temp-', ''))
        leave = db.session.get(LeaveRequest, clean_id)
    except Exception:
        pass
    if not leave:
        try:
            leave = LeaveRequest.query.filter_by(id=leave_id).first()
        except Exception:
            pass

    if not leave:
        return jsonify({'message': 'Leave request not found'}), 404
    data = request.get_json() or {}
    new_status = data.get('status')
    manager_notes = data.get('managerNotes') or ''

    if new_status not in ['Approved', 'Rejected', 'Cancelled', 'Pending']:
        return jsonify({'message': 'Invalid status'}), 400

    if new_status == 'Cancelled':
        # Applicant can cancel their own pending request
        if leave.user_email.lower() != current_user.email.lower() and current_user.role not in ['admin', 'manager'] and current_user.email.lower() not in MASTER_ADMINS:
            return jsonify({'message': 'Permission denied'}), 403
    else:
        # Admins (Arun, Gokul) and authorized managers can approve or reject
        is_authorized_admin = (
            current_user.role in ['admin', 'manager']
            or current_user.email.lower() in MASTER_ADMINS
            or current_user.has_permission('can_create_employee')
        )
        if not is_authorized_admin:
            return jsonify({'message': 'Permission denied. Only Admins (Arun or Gokul) or Managers can review leave requests'}), 403

    leave.status = new_status
    leave.reviewed_by = current_user.name or current_user.email
    leave.reviewed_at = datetime.utcnow()
    if manager_notes:
        leave.manager_notes = manager_notes

    db.session.commit()

    action_label = f"LEAVE_{new_status.upper()}"
    log_audit(
        current_user,
        action_label,
        f"{current_user.name} marked Leave #{leave.id} for {leave.user_name} as {new_status}. {manager_notes}"
    )

    return jsonify({
        'message': f'Leave request #{leave.id} has been {new_status.lower()}',
        'leaveRequest': leave.to_dict()
    })


@leaves_bp.route('/balances/<email>', methods=['GET'])
@token_required
def get_leave_balances(email):
    current_user = request.current_user
    approved_leaves = LeaveRequest.query.filter_by(
        user_email=email,
        status='Approved'
    ).all()

    pending_leaves = LeaveRequest.query.filter_by(
        user_email=email,
        status='Pending'
    ).all()

    used = sum(float(l.days or 0) for l in approved_leaves)
    pending = sum(float(l.days or 0) for l in pending_leaves)
    total = ANNUAL_LEAVE_DAYS
    available = max(0.0, total - used)

    balances = {
        'total': total,
        'used': used,
        'available': available,
        'pending': pending
    }

    return jsonify({'balances': balances})
