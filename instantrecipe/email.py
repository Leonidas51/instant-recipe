from flask_mail import Message
from flask import current_app
from instantrecipe import mail


def send_email(to, subject, html):
    msg = Message(
        subject,
        recipients=[to],
        html=html,
        sender=current_app.config['MAIL_DEFAULT_SENDER']
    )
    mail.send(msg)
