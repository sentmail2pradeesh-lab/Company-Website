import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    _raw_db_url = os.environ.get("DATABASE_URL")
    if _raw_db_url:
        if _raw_db_url.startswith("postgres://"):
            _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)
        elif _raw_db_url.startswith("mysql://") and "mysql+pymysql://" not in _raw_db_url:
            _raw_db_url = _raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
        SQLALCHEMY_DATABASE_URI = _raw_db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'aszen.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET = os.environ.get('JWT_SECRET', 'aszen-jwt-secret-change-in-production')
    JWT_EXPIRY_HOURS = 8760  # 1 year session duration (no automatic session timeout during workday)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'aszentech@gmail.com')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
