import os
import functools
from itsdangerous import URLSafeTimedSerializer
from flask import jsonify, session, current_app

from ..utils import logger


NOT_AUTHORIZED_TEXT = 'Вы не авторизованы'
ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


def confirm_required(func):
    @functools.wraps(func)
    def wrapper_confirm_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify({'result': 'error',
                            'message': NOT_AUTHORIZED_TEXT}), 403
        else:
            if not session.get('user', None).get_entry()['confirmed']:
                return jsonify({
                    'result': 'error',
                    'message': 'Необходимо подтвердить аккаунт'}), 403
        return func(*args, **kwargs)
    return wrapper_confirm_required


def login_required(func):
    @functools.wraps(func)
    def wrapper_login_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify({'result': 'error',
                            'message': NOT_AUTHORIZED_TEXT}), 403
        return func(*args, **kwargs)
    return wrapper_login_required


def admin_required(func):
    @functools.wraps(func)
    def wrapper_admin_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify({'result': 'error',
                            'message': NOT_AUTHORIZED_TEXT}), 403
        if session['user'].get_entry()['admin'] is False:
            return jsonify({
                'result': 'error',
                'message:': 'Для данного действия требуются \
                    права администратора'}), 400
        return func(*args, **kwargs)
    return wrapper_admin_required


def generate_token(salt, email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=salt)


def generate_confirmation_token(email):
    return generate_token(current_app.config['CONFIRM_SALT'], email)


def generate_restoration_token(email):
    return generate_token(current_app.config['RESTORE_SALT'], email)


def confirm_token(salt, token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=salt,
            max_age=expiration
        )
    except Exception:
        return False
    return email


def confirm_confirmation_token(token, expiration=3600):
    return confirm_token(current_app.config['CONFIRM_SALT'], token)


def confirm_restoration_token(token, expiration=3600):
    return confirm_token(current_app.config['RESTORE_SALT'], token)
