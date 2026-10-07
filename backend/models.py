import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db


def to_utc_iso(dt):
    if not dt:
        return None
    iso = dt.isoformat()
    return iso if (iso.endswith('Z') or '+' in iso) else f"{iso}Z"


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50), nullable=False, default='employee')
    designation = db.Column(db.String(100), nullable=False, default='Editor')
    password_hash = db.Column(db.String(255), nullable=False)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    is_approved = db.Column(db.Boolean, default=True, nullable=False)
    permissions_json = db.Column(db.Text, default='{}', nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def permissions(self):
        try:
            if not self.permissions_json:
                return {}
            return json.loads(self.permissions_json)
        except Exception:
            return {}

    @permissions.setter
    def permissions(self, val):
        self.permissions_json = json.dumps(val or {})

    def has_permission(self, perm_key):
        if self.role == 'admin':
            return True
        if getattr(self, 'is_approved', True) is False:
            return False
        perms = self.permissions
        return bool(perms.get(perm_key, False))

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name or self.email.split('@')[0].capitalize(),
            'role': self.role,
            'designation': 'Path Editor' if (self.designation or '').strip().lower() == 'pather' else (self.designation or ('Developer' if self.role == 'developer' else ('Manager' if self.role == 'manager' else 'Editor'))),
            'is_approved': getattr(self, 'is_approved', True),
            'permissions': self.permissions,
            'created_at': to_utc_iso(self.created_at),
        }


class Blog(db.Model):
    __tablename__ = 'blogs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    excerpt = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'excerpt': self.excerpt,
            'content': self.content,
            'image_url': self.image_url,
            'created_at': to_utc_iso(self.created_at),
        }


class WorkSession(db.Model):
    __tablename__ = 'work_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user_email = db.Column(db.String(255), nullable=False, index=True)
    user_name = db.Column(db.String(255), nullable=False)
    user_role = db.Column(db.String(50), nullable=False, default='employee')
    date = db.Column(db.String(10), nullable=False, index=True)  # YYYY-MM-DD
    login_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    logout_time = db.Column(db.DateTime, nullable=True)
    total_hours = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='Active')  # 'Active' or 'Completed'
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def calculate_hours(self):
        if self.login_time:
            end = self.logout_time or datetime.utcnow()
            delta = end - self.login_time
            self.total_hours = round(max(0.0, delta.total_seconds() / 3600.0), 2)
        return self.total_hours

    def to_dict(self):
        self.calculate_hours()
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': self.user_email,
            'user_name': self.user_name,
            'user_role': self.user_role,
            'date': self.date,
            'login_time': to_utc_iso(self.login_time),
            'logout_time': to_utc_iso(self.logout_time),
            'total_hours': self.total_hours,
            'status': self.status,
            'notes': self.notes or '',
            'created_at': to_utc_iso(self.created_at),
        }


class Client(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=True)
    contact = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'contact': self.contact or '',
            'created_at': to_utc_iso(self.created_at),
        }


class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    job_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    client_code = db.Column(db.String(50), nullable=False)
    service = db.Column(db.String(255), nullable=False)
    files_count = db.Column(db.Integer, default=0)
    output_target = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='In Progress')
    client_entry_time = db.Column(db.String(50), nullable=True)
    client_target_time = db.Column(db.String(50), nullable=True)
    client_finish_time = db.Column(db.String(50), nullable=True)
    operational_date = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    stages = db.relationship('JobStage', backref='job', cascade='all, delete-orphan')

    def to_dict(self):
        stages_dict = {}
        for s in self.stages:
            stages_dict[s.stage_key] = s.to_dict()
        return {
            'id': str(self.job_number),
            'db_id': self.id,
            'jobNumber': self.job_number,
            'client': self.client_code,
            'service': self.service,
            'name': self.service,
            'files': self.files_count,
            'outputTarget': self.output_target,
            'status': self.status,
            'clientEntryTime': self.client_entry_time or '',
            'clientTargetTime': self.client_target_time or '',
            'clientFinishTime': self.client_finish_time or '',
            'operationalDate': self.operational_date or '',
            'createdAt': to_utc_iso(self.created_at),
            'stages': stages_dict
        }


class JobStage(db.Model):
    __tablename__ = 'job_stages'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    stage_key = db.Column(db.String(50), nullable=False)
    assignee = db.Column(db.String(255), default='')
    status = db.Column(db.String(50), default='Unassigned')
    files_count = db.Column(db.Integer, default=0)
    output_count = db.Column(db.Integer, default=0)
    start_time = db.Column(db.String(50), nullable=True)
    end_time = db.Column(db.String(50), nullable=True)
    paused_duration_seconds = db.Column(db.Integer, default=0)
    current_pause_start = db.Column(db.String(50), nullable=True)
    pause_logs_json = db.Column(db.Text, default='[]')

    def to_dict(self):
        import json
        try:
            pause_logs = json.loads(self.pause_logs_json or '[]')
        except Exception:
            pause_logs = []
        return {
            'assignee': self.assignee or '',
            'status': self.status or 'Unassigned',
            'filesCount': self.files_count,
            'outputCount': self.output_count,
            'startTime': self.start_time,
            'endTime': self.end_time,
            'pausedDurationSeconds': self.paused_duration_seconds,
            'currentPauseStart': self.current_pause_start,
            'pauseLogs': pause_logs,
        }


class ProductionSheetEntry(db.Model):
    __tablename__ = 'production_sheets'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False, index=True)
    property_name = db.Column(db.String(255), nullable=True)
    service = db.Column(db.String(100), nullable=True)
    comments = db.Column(db.Text, nullable=True)
    editor_name = db.Column(db.String(255), nullable=True, default='Unassigned')
    role = db.Column(db.String(100), nullable=True, default='Editor')
    job_id = db.Column(db.String(50), nullable=True, default='')
    client = db.Column(db.String(50), nullable=True, default='BE')
    stage = db.Column(db.String(50), nullable=True, default='RE Editing')
    files_processed = db.Column(db.Integer, default=0)
    active_minutes = db.Column(db.Integer, default=0)
    pause_minutes = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='Verified')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': f"ps-{self.id}",
            'date': self.date,
            'inputDate': self.date,
            'propertyName': self.property_name or '',
            'service': self.service or self.stage or 'RE Editing',
            'numberOfImages': self.files_processed or 0,
            'comments': self.comments or '',
            'editorName': self.editor_name or 'Unassigned',
            'role': self.role or 'Editor',
            'jobId': self.job_id or '',
            'client': self.client or 'BE',
            'stage': self.stage or self.service or 'RE Editing',
            'filesProcessed': self.files_processed or 0,
            'activeMinutes': self.active_minutes or 0,
            'pauseMinutes': self.pause_minutes or 0,
            'status': self.status or 'Verified',
            'created_at': to_utc_iso(self.created_at)
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255), nullable=False)
    user_name = db.Column(db.String(255), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userEmail': self.user_email,
            'userName': self.user_name,
            'action': self.action,
            'details': self.details or '',
            'timestamp': to_utc_iso(self.timestamp)
        }


class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user_email = db.Column(db.String(255), nullable=False, index=True)
    user_name = db.Column(db.String(255), nullable=False)
    leave_type = db.Column(db.String(50), nullable=False, default='Leave')
    start_date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD
    end_date = db.Column(db.String(10), nullable=False)    # YYYY-MM-DD
    days = db.Column(db.Float, nullable=False, default=1.0)
    is_half_day = db.Column(db.Boolean, default=False)
    half_day_period = db.Column(db.String(20), nullable=True)  # 'First Half', 'Second Half'
    reason = db.Column(db.Text, nullable=False)
    backup_employee = db.Column(db.String(255), nullable=True)
    emergency_contact = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default='Pending', index=True)  # 'Pending', 'Approved', 'Rejected', 'Cancelled'
    reviewed_by = db.Column(db.String(255), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    manager_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userEmail': self.user_email,
            'userName': self.user_name,
            'leaveType': self.leave_type,
            'startDate': self.start_date,
            'endDate': self.end_date,
            'days': self.days,
            'isHalfDay': self.is_half_day,
            'halfDayPeriod': self.half_day_period,
            'reason': self.reason,
            'backupEmployee': self.backup_employee or '',
            'emergencyContact': self.emergency_contact or '',
            'status': self.status,
            'reviewedBy': self.reviewed_by or '',
            'reviewedAt': to_utc_iso(self.reviewed_at),
            'managerNotes': self.manager_notes or '',
            'createdAt': to_utc_iso(self.created_at),
        }




