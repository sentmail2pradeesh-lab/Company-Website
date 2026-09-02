from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50), nullable=False, default='employee')
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

