import os
from flask_mail import Message
from flask import current_app, url_for
from instantrecipe import mail
import logger
from instantrecipe.auth import generate_confirmation_token, generate_restoration_token


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))

def send_email(to, subject, html):
    msg = Message(
        subject,
        recipients=[to],
        html=html,
        sender=current_app.config['MAIL_DEFAULT_SENDER']
    )
    mail.send(msg)

def send_verification_email(email):
    try:
        email_token = generate_confirmation_token(email)
        confirm_url = url_for('users.confirm_email', token=email_token, _external=True)
        html = '<h1>Для подтверждения перейдите по ссылке:</h1><br />' + \
               '<a href="' + confirm_url + '">' + confirm_url + '</a>'
        subject = 'Подтверждение e-mail'
        send_email(email, subject, html)
    except Exception as e:
        LOG.error('error while trying to send_verification_email: ' + str(e))

def send_restore_password_email(email):
    try:
        email_token = generate_restoration_token(email)
        restore_url = url_for('users.restore_password_with_token', token=email_token, _external=True)
        html = '<h1>Для восстановления пароля перейдите по ссылке:</h1><br />' + \
               '<a href="' + restore_url + '">' + restore_url + '</a>'
        subject = 'Восстановление пароля'
        send_email(email, subject, html)
    except Exception as e:
        LOG.error('error while trying to send_restore_password_email: ' + str(e))
