from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db


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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name or self.email.split('@')[0].capitalize(),
            'role': self.role,
            'designation': self.designation or ('Manager' if self.role == 'manager' else 'Editor'),
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
            'created_at': self.created_at.isoformat() if self.created_at else None,
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
            'login_time': self.login_time.isoformat() if self.login_time else None,
            'logout_time': self.logout_time.isoformat() if self.logout_time else None,
            'total_hours': self.total_hours,
            'status': self.status,
            'notes': self.notes or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Client(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    contact = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'contact': self.contact or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
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
            'createdAt': self.created_at.isoformat() if self.created_at else None,
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
    editor_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    job_id = db.Column(db.String(50), nullable=False)
    client = db.Column(db.String(50), nullable=False)
    stage = db.Column(db.String(50), nullable=False)
    files_processed = db.Column(db.Integer, default=0)
    active_minutes = db.Column(db.Integer, default=0)
    pause_minutes = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='Verified')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': f"ps-{self.id}",
            'date': self.date,
            'editorName': self.editor_name,
            'role': self.role,
            'jobId': self.job_id,
            'client': self.client,
            'stage': self.stage,
            'filesProcessed': self.files_processed,
            'activeMinutes': self.active_minutes,
            'pauseMinutes': self.pause_minutes,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
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
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }



