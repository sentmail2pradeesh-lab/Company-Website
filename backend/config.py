import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    _raw_db_url = os.environ.get("DATABASE_URL")
    if _raw_db_url:
        _raw_db_url = _raw_db_url.strip().replace("\n", "").replace("\r", "")
        # Automatically percent-encode special characters (like '@') in password
        if "://" in _raw_db_url and _raw_db_url.count("@") > 1:
            try:
                import urllib.parse
                prefix, remainder = _raw_db_url.split("://", 1)
                last_at = remainder.rfind("@")
                user_pass = remainder[:last_at]
                host_db = remainder[last_at + 1:]
                if ":" in user_pass:
                    user, pwd = user_pass.split(":", 1)
                    _raw_db_url = f"{prefix}://{user}:{urllib.parse.quote(pwd)}@{host_db}"
            except Exception:
                pass
        if _raw_db_url.startswith("postgres://"):
            _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)
        elif _raw_db_url.startswith("mysql://") and "mysql+pymysql://" not in _raw_db_url:
            _raw_db_url = _raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
        SQLALCHEMY_DATABASE_URI = _raw_db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'aszen.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET = os.environ.get('JWT_SECRET', 'aszen-jwt-secret-change-in-production')
    JWT_EXPIRY_HOURS = int(os.environ.get('JWT_EXPIRY_HOURS', 12))  # 12-hour shift duration for secure session lifecycle
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'aszentech@gmail.com')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://vistaeditz.com')
