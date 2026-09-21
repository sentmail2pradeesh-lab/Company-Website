from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
from models import User, Blog, WorkSession, Client, Job, JobStage, ProductionSheetEntry, AuditLog
from routes.auth import auth_bp
from routes.blogs import blogs_bp
from routes.work_hours import work_hours_bp
from routes.clients import clients_bp
from routes.jobs import jobs_bp
from utils.mail import mail


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    CORS(app, resources={r'/api/*': {'origins': '*'}})
    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(blogs_bp, url_prefix='/api/blogs')
    app.register_blueprint(work_hours_bp, url_prefix='/api/work-hours')
    app.register_blueprint(clients_bp, url_prefix='/api/clients')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')


    @app.route('/')
    def root():
        return {
            'status': 'online',
            'service': 'ASZEN / Vistaeditz Production Backend API',
            'health': '/api/health',
            'docs': 'All API endpoints are under /api/'
        }

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    with app.app_context():
        db.create_all()

        # Ensure missing columns (name, role, is_approved, permissions_json) exist in legacy SQLite / MySQL database
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                for col_sql in [
                    "ALTER TABLE users ADD COLUMN name VARCHAR(255)",
                    "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'employee'",
                    "ALTER TABLE users ADD COLUMN designation VARCHAR(100) DEFAULT 'Editor'",
                    "ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT 1",
                    "ALTER TABLE users ADD COLUMN permissions_json TEXT DEFAULT '{}'",
                ]:
                    try:
                        conn.execute(text(col_sql))
                        conn.commit()
                    except Exception:
                        pass
        except Exception as e:
            print("DB Migration notice:", e)

        seed_users()
        seed_clients()
        seed_blogs()

    return app



def seed_users():
    import json
    from utils.user_store import load_stored_users, save_user_to_store

    # 1. Master Admin account
    admin_email = "arun@aszen.com"
    admin = User.query.filter_by(email=admin_email).first()
    admin_perms = {
        'can_create_job': True,
        'can_edit_job': True,
        'can_delete_job': True,
        'can_create_employee': True,
        'can_manage_clients': True,
        'can_manage_work_hours': True,
    }
    if not admin:
        admin = User(
            email=admin_email,
            name="Arun",
            role="admin",
            designation="Admin / System Manager",
            is_approved=True,
            permissions_json=json.dumps(admin_perms)
        )
        admin.set_password("Aszen@123")
        db.session.add(admin)
    else:
        admin.name = "Arun"
        admin.role = "admin"
        admin.designation = "Admin / System Manager"
        admin.is_approved = True
        admin.permissions_json = json.dumps(admin_perms)
        admin.set_password("Aszen@123")
    db.session.commit()
    save_user_to_store(admin)

    # 2. Permanent Employee Persistence: Restore all registered & created personnel from users_store.json
    stored_users = load_stored_users()
    for stored in stored_users:
        s_email = (stored.get('email') or '').lower().strip()
        if not s_email or s_email == admin_email.lower():
            continue
        existing_emp = User.query.filter_by(email=s_email).first()
        if not existing_emp:
            emp = User(
                email=s_email,
                name=stored.get('name'),
                role=stored.get('role', 'employee'),
                designation=stored.get('designation', 'Editor'),
                is_approved=stored.get('is_approved', True),
                permissions_json=json.dumps(stored.get('permissions', {}))
            )
            if stored.get('password_hash'):
                emp.password_hash = stored['password_hash']
            elif stored.get('raw_password'):
                emp.set_password(stored['raw_password'])
            else:
                emp.set_password('Aszen@123')
            db.session.add(emp)
        else:
            # Sync permissions & approval status from persistent store
            if stored.get('permissions'):
                existing_emp.permissions_json = json.dumps(stored['permissions'])
            if 'is_approved' in stored:
                existing_emp.is_approved = stored['is_approved']
    db.session.commit()


def seed_clients():
    # Production: Start with clean database (0 test clients)
    pass




def seed_blogs():
    if Blog.query.count() > 0:
        return

    samples = [
        Blog(
            title='The Future of AI in Photo Editing',
            excerpt='Discover how artificial intelligence is revolutionizing the way we edit and enhance images.',
            image_url='https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
        ),
        Blog(
            title='Video Editing Trends for 2025',
            excerpt='Stay ahead with the latest techniques and tools shaping professional video production.',
            image_url='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
        ),
        Blog(
            title='Real Estate Photography Tips',
            excerpt='Learn how to capture stunning property photos that sell faster and at better prices.',
            image_url='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
        ),
    ]
    db.session.add_all(samples)
    db.session.commit()


app = create_app()


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)


