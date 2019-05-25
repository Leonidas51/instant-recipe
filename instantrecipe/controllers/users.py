import os
import re
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, session
from instantrecipe import mongo
import logger
from instantrecipe.auth import User, login_required


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
users_bp = Blueprint('users', __name__)
SERVER_ERROR = 'Произошла ошибка сервера! Приносим свои извинения'

@users_bp.route('/user/create_collection/', methods=['GET'])
def create_users_collecton():
    if request.method == 'GET':
        try:
            if 'users' not in mongo.db.collection_names():
                admin = User('Admin', 'wayay@yandex.ru', '69*heehoopeenut69*', True)
                mongo.db.users.insert_one(admin.get())
                return jsonify(data = 'created users'), 200
            else:
                return jsonify(data = 'users already exists'), 200
        except Exception as e:
            LOG.error('error while trying to create_users_collecton: ' + str(e))
            return jsonify(data = 'Collection already exists'), 200

def validate_username(name):
    if name is None or not re.match(r'[А-яA-z0-9]+', name):
        return False
    return True

def validate_email(email):
    if email is None or not re.match(r'[А-яA-z0-9]+@[А-яA-z0-9]+\.[А-яA-z0-9]+', email):
        return False
    return True

def validate_password(password):
    if password is None or len(password) < 6:
        return False
    return True

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
        user.save_to_db()
        session['user'] = user
        #auth_token = user.generate_auth_token()
        return jsonify({'result': 'success',
                        'message': 'Вы успешно зарегистрированы!',
                        'username': username}), 200
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
        if validate_email(email) or not validate_username(password):
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
        #auth_token = user.generate_auth_token()
        return jsonify({'result': 'success',
                        'username': user.get()['name']}), 200
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
def if_logged_in_return_name():
    if 'user' in session:
        return jsonify({'result': 'success',
                        'username': session['user'].get()['name']}), 200
    return jsonify({'result': 'error',
                    'message:': 'Данный пользователь не осуществлял вход в аккаунт'}), 400

@users_bp.route('/user/isadmin/', methods=['POST'])
def is_admin():
    if 'user' in session and session['user'].get()['admin'] == True:
        return jsonify({'result': 'success'}), 200
    return jsonify({'result': 'error',
                    'message:': 'Для данного действия требуются права администратора'}), 400

@users_bp.route('/user/resource/', methods=['GET'])
@login_required
def test():
    try:
        user = session.get('user')
        if user:
            username = user.get()['name']
        else:
            username = 'not logged in'
        return jsonify(data = 'protected page. %s, are u logged in?' % username)
    except:
        return jsonify(data = 'pretected resource error')#return False

"""
@users_bp.route('/user/token/', methods=['GET', 'POST'])
@login_required
def get_auth_token():
    user = session.get('user')
    if user:
        #token = user.generate_auth_token()
        return jsonify({'result': 'success'}), 200
    return jsonify(data = 'error')
"""

"""
@users_bp.route('/user/verify_token/', methods=['POST'])
def verify_token(email_or_token, password):
# first try to authenticate by token
user = User()
auth_token = user.verify_auth_token(email_or_token)
if not auth_token:
# try to authenticate with username/password
if not user.find_by_email(email_or_token):
    return jsonify(data='Wrong username'), 200#return False
user.set_from_db_by_email(email_or_token)
if not user.verify_password(password):
    return jsonify(data='Wrong password'), 200#return False
session['user'] = user
return jsonify(data='logged in'), 200#return True
"""
