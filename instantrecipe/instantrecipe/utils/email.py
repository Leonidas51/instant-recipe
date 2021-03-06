import os
from flask_mail import Message
from flask import current_app, url_for
from .. import mail
from . import auth, logger


ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


def send_email(to, subject, html):
    msg = Message(
        subject,
        recipients=[to],
        html=html,
        sender=current_app.config['MAIL_USERNAME']
    )
    mail.send(msg)


def send_verification_email(email):
    try:
        email_token = auth.generate_confirmation_token(email)
        confirm_url = url_for('users.redirect_confirm_email',
                              token=email_token, _external=True)
        html = '<h1>Для подтверждения перейдите по ссылке:</h1><br />' + \
               '<a href="{}">{}</a>'.format(
                    confirm_url, confirm_url)
        subject = 'InstantRecipe.ru - Подтверждение e-mail'
        send_email(email, subject, html)
    except Exception as e:
        LOG.error('error while trying to send_verification_email: ' + str(e))


def send_restore_password_email(email):
    try:
        email_token = auth.generate_restoration_token(email)
        restore_url = url_for('users.redirect_restore_password',
                              token=email_token, _external=True)
        html = '<h1>Для изменения пароля перейдите по ссылке: \
                </h1><br /><a href="{}">{}</a>'.format(
                    restore_url, restore_url)
        subject = 'InstantRecipe.ru - Изменение пароля'
        send_email(email, subject, html)
    except Exception as e:
        LOG.error(
            'error while trying to send_restore_password_email: ' + str(e))
