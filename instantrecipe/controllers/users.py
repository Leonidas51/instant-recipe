import os
import re
import datetime
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, session, url_for, render_template, redirect
from flask_wtf.csrf import generate_csrf
import logger
from instantrecipe import mongo
from instantrecipe.auth import User, login_required, confirm_required, \
                               confirm_confirmation_token, confirm_restoration_token
from instantrecipe.email import send_verification_email, send_restore_password_email


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
users_bp = Blueprint('users', __name__)
SERVER_ERROR = 'Произошла ошибка сервера! Приносим свои извинения'

@users_bp.route('/get_csrf/', methods=['GET'])
def get_csrf():
    try:
        gen_csrf = generate_csrf()
        return jsonify(csrf = gen_csrf), 200
    except Exception as e:
        LOG.error('error while generating csrf: ' + str(e))
        return jsonify(error = str(e)), 400

@users_bp.route('/user/create_admin/', methods=['GET'])
def create_admin():
    if request.method == 'GET':
        try:
            name = 'Admin'
            email = 'wayay@yandex.ru'
            password = '69*heehoopeenut69*'
            if not User.find_by_email(email):
                admin = User(name, email, password, True, \
                             datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), True)
                admin.save_to_db()
                return jsonify(data = 'created admin'), 200
        except Exception as e:
            LOG.error('error while trying to create_admin: ' + str(e))
            return jsonify(data = 'error'), 200

def validate_username(name):
    if name is None or not re.match(r'^[-_.\'`А-яA-z0-9]+$', name):
        return False
    return True

def validate_email(email):
    if email is None or not re.match(r'^.+@[А-яA-z0-9]+\..+$', email):
        return False
    return True

def validate_password(password):
    if password is None or len(password) < 6:
        return False
    return True

@users_bp.route('/user/resend_verification_email/', methods=['POST'])
def resend_verification_email():
    try:
        if session.get('user', None):
            email = session.get('user').get()['email']
            send_verification_email(email)
            return jsonify({'result': 'success',
                            'message:': 'Попробуйте проверить почту (и папку спам!)'}), 200
    except Exception as e:
        LOG.error('error while trying to resend_verification_email: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400

@users_bp.route('/user/restore_password_entered_email/', methods=['POST'])
def restore_password_entered_email():
    try:
        email = request.json.get('email')
        if not validate_email(email):
            jsonify({'result': 'error',
                     'message:': 'Введенный e-mail не валиден'}), 400
        if User.find_by_email(email):
            send_restore_password_email(email)
            return jsonify({'result': 'success',
                            'message:': 'Попробуйте проверить почту (и папку спам!)'}), 200
        return jsonify({'result': 'error',
                        'message:': 'Пользователь с введенными данными не зарегистрирован'}), 400
    except Exception as e:
        LOG.error('error while trying to restore_password_entered_email: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400

@users_bp.route('/user/register/', methods=['POST'])
def register():
    try:
        username = request.json.get('username')
        email = request.json.get('email')
        password = request.json.get('password')
        if not validate_username(username) or \
            not validate_email(email) or \
            not validate_password(password):
            return jsonify({'result': 'error',
                            'message': 'Имя, e-mail или пароль введены неверно!'}), 400
        if User.find_by_email(email):
            return jsonify({'result': 'error',
                            'message': 'Пользователь с таким e-mail уже зарегистрирован!'}), 400
        if User.find_by_name(username):
            return jsonify({'result': 'error',
                            'message': 'Пользователь с таким именем уже зарегистрирован!'}), 400
        user = User(username, email, password)

        # jwt token
        auth_token = user.generate_auth_token()

        send_verification_email(email)

        if not user.save_to_db():
            return jsonify({'result': 'error',
                            'message': SERVER_ERROR}), 400
        session['user'] = user

        return jsonify({'result': 'success',
                        'message': 'Вы успешно зарегистрированы!',
                        'username': username,
                        'jwt': auth_token.decode('ascii')}), 200
    except Exception as e:
        LOG.error('error while trying to register: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400

@users_bp.route('/user/login/', methods=['POST'])
def login():
    try:
        user = User()
        email = request.json.get('email')
        password = request.json.get('password')
        if not validate_email(email) or not validate_password(password):
            return jsonify({'result': 'error',
                            'message': 'E-mail или пароль введены неверно!'}), 400
        if not user.find_by_email(email):
            return jsonify({'result': 'error',
                            'message': 'Неверный e-mail или пароль'}), 400
        user.set_from_db_by_email(email)
        if not user.verify_password(password):
            return jsonify({'result': 'error',
                            'message': 'Неверный e-mail или пароль'}), 400
        session['user'] = user
        auth_token = user.generate_auth_token()
        return jsonify({'result': 'success',
                        'username': user.get()['name'],
                        'jwt': auth_token.decode('ascii')}), 200

    except Exception as e:
        LOG.error('error while trying to login: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400

@users_bp.route('/user/logout/', methods=['POST'])
def logout():
    try:
        session.pop('user')
        return jsonify({'result': 'success',
                        'message:': 'Вы успешно вышли из аккаунта'}), 200
    except:
        return jsonify({'result': 'error',
                        'message:': 'Данный пользователь не осуществлял вход в аккаунт'}), 400

@users_bp.route('/user/isloggedin/', methods=['POST'])
def is_logged_in():
    #auth_token = user.verify_auth_token(email_or_token)
    if 'user' in session:
        return jsonify({'result': 'success',
                        'username': session['user'].get()['name'],
                        'admin': session['user'].get()['admin']}), 200
    return jsonify({'result': 'error',
                    'message:': 'Данный пользователь не осуществлял вход в аккаунт'}), 400

@users_bp.route('/user/isadmin/', methods=['POST'])
def is_admin():
    if 'user' in session and session['user'].get()['admin'] == True:
        return jsonify({'result': 'success'}), 200
    return jsonify({'result': 'error',
                    'message:': 'Для данного действия требуются права администратора'}), 400

@users_bp.route('/user/redirect/confirm/<token>/')
def redirect_confirm_email(token):
    return redirect('/user/confirm/' + token)

@users_bp.route('/user/confirm/<token>/')
def confirm_email(token):
    email = confirm_confirmation_token(token)

    if not email:
        return jsonify({'result': 'error',
                        'message': 'Ссылка для подтверждения недействительна или просрочена'}), 400
    user = User()
    user.set_from_db_by_email(email)
    if user.get()['confirmed']:
        return jsonify({'result': 'success',
                        'message': 'Данный e-mail уже подтвержден'}), 200
    else:
        confirmation_data = {'confirmed': True,
                             'confirmed_on': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        user.update(confirmation_data)
        user.set_from_db_by_email(email)
        session['user'] = user

    return jsonify({'result': 'success',
                    'message': 'E-mail успешно подтвержден'}), 200

@users_bp.route('/user/redirect/restore_password/<token>/')
def redirect_restore_password(token):
    return redirect('/user/restore/' + token)

@users_bp.route('/user/restore/<token>/', methods=['GET'])
def restore_password_with_token(token):
    try:
        email = confirm_restoration_token(token)

        if email:
            session['email_reset'] = email
            return jsonify({'result': 'success'}), 200
        else:
            return jsonify({'result': 'error',
                            'message': 'Ссылка для восстановления недействительна или просрочена'}), 400
    except Exception as e:
        LOG.error('error while trying to restore_password_with_token: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400

@users_bp.route('/user/restore_password_new_password/', methods=['POST'])
def restore_password_new_password():
    try:
        if request.method == 'POST':
            if session.get('email_reset'):
                new_password = request.json.get('password')
                if(len(new_password) < 6):
                    return jsonify({'result': 'error',
                                    'message': 'Пароль должен быть не короче 6 символов'}), 400

                email = session.get('email_reset')
                session.pop('email_reset')
                user = User()
                user.set_from_db_by_email(email)
                reset_data = {'password_hash': user.hash_password(new_password)}
                user.update(reset_data)
                return jsonify({'result': 'success',
                                'message': 'Пароль восстановлен'}), 200
            else:
                return jsonify({'result': 'error',
                                'message': 'Ссылка для восстановления недействительна или просрочена'}), 400
    except Exception as e:
        LOG.error('error while trying to restore_password_new_password: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400
