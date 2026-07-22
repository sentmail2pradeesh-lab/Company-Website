import secrets
from flask import current_app
from flask_mail import Message
from flask_mail import Mail

mail = Mail()


def send_reset_email(user_email, reset_token):
    reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"

    if not current_app.config.get('MAIL_USERNAME'):
        current_app.logger.info(
            'Mail not configured. Reset link for %s: %s', user_email, reset_url
        )
        return True

    msg = Message(
        subject='ASZEN - Password Reset',
        recipients=[user_email],
        body=(
            f'You requested a password reset.\n\n'
            f'Click the link below to reset your password:\n{reset_url}\n\n'
            f'If you did not request this, please ignore this email.'
        ),
    )
    mail.send(msg)
    return True


def generate_reset_token():
    return secrets.token_urlsafe(32)
