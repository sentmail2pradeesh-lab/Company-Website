from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
from models import User, Blog
from routes.auth import auth_bp
from routes.blogs import blogs_bp
from utils.mail import mail


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r'/api/*': {'origins': '*'}})
    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(blogs_bp, url_prefix='/api/blogs')

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    with app.app_context():
        db.create_all()

        # Ensure missing columns (name, role) exist in legacy SQLite database
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(255)"))
                    conn.commit()
                except Exception:
                    pass
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'employee'"))
                    conn.commit()
                except Exception:
                    pass
        except Exception as e:
            print("DB Migration notice:", e)

        seed_users()
        seed_blogs()

    return app


def seed_users():
    test_users = [
        {"email": "arun@aszen.com", "name": "Arun", "role": "admin", "pwd": "Aszen@123"},
        {"email": "lessy@aszen.com", "name": "Lessy", "role": "manager", "pwd": "Aszen@123"},
        {"email": "Karan@aszen.com", "name": "Karan", "role": "employee", "pwd": "Aszen@123"},
        {"email": "lalithaa@aszen.com", "name": "Lalithaa", "role": "employee", "pwd": "Aszen@123"},
    ]
    for data in test_users:
        user = User.query.filter_by(email=data["email"]).first()
        if not user:
            user = User(email=data["email"], name=data["name"], role=data["role"])
            user.set_password(data["pwd"])
            db.session.add(user)
        else:
            user.name = data["name"]
            user.role = data["role"]
            user.set_password(data["pwd"])
    db.session.commit()


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


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
