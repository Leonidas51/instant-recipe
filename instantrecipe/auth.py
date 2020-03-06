import os
import datetime
import functools
from itsdangerous import (TimedJSONWebSignatureSerializer
    as Serializer, BadSignature, SignatureExpired, URLSafeTimedSerializer)
from passlib.hash import pbkdf2_sha256
from flask import jsonify, session, current_app, redirect
from instantrecipe import mongo
import logger


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))

class User:
    def hash_password(self, password):
        return pbkdf2_sha256.hash(password)

    def __init__(self, name='default', email='default', password='default', \
                 confirmed=False, confirmed_on=None, admin=False):
        self.user = {}
        self.user['name'] = name
        self.user['name_lower'] = name.lower()
        self.user['email'] = email.lower()
        self.user['confirmed'] = confirmed
        self.user['confirmed_on'] = confirmed_on
        self.user['password_hash'] = self.hash_password(password)
        self.user['registered_on'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.user['upload_recipes'] = []
        self.user['upload_images'] = []
        self.user['favorites'] = []
        self.user['admin'] = admin
        self.id = None

    def verify_password(self, password):
        hash = self.user.get('password_hash')
        if hash:
            return pbkdf2_sha256.verify(password, hash)
        return False

    def save_to_db(self):
        if self.user['password_hash']:
            self.id = mongo.db.users.insert_one(self.user).inserted_id
            return True
        return False

    def get(self):
        return self.user

    def get_id(self):
        return self.id

    def set(self, user):
        self.user = user

    def set_from_db_by_email(self, email):
        email = email.lower()
        result = mongo.db.users.find_one({'email': email})
        if not result:
            return False
        self.user = result
        self.id = result.get('_id')
        return True

    def update(self, data):
        mongo.db.users.update_one({'_id': self.id},
                              {'$set': data},
                              upsert=False)

    def generate_auth_token(self, expiration=600):
        s = Serializer(os.getenv('SECRET_KEY'), expires_in=expiration)
        return s.dumps({'id': str(self.id)})

    def verify_auth_token(self, token):
        s = Serializer(os.getenv('SECRET_KEY'))
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        result = mongo.db.users.find_one({'_id': ObjectId(data['id'])})
        if result:
            self.user = result
            self.id = result.get('_id')
            return True
        return False

    @staticmethod
    def find_by_email(email):
        if not mongo.db.users.find_one({'email': email.lower()}):
            return False
        return True

    @staticmethod
    def find_by_name(name):
        if not mongo.db.users.find_one({'name_lower': name.lower()}):
            return False
        return True


def confirm_required(func):
    @functools.wraps(func)
    def wrapper_confirm_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify({'result': 'error',
                            'message': 'Вы не авторизованы'}), 403
        else:
            if not session.get('user', None).get()['confirmed']:
                return jsonify({'result': 'error',
                                'message': 'Необходимо подтвердить аккаунт'}), 403
        return func(*args, **kwargs)
    return wrapper_confirm_required

def login_required(func):
    @functools.wraps(func)
    def wrapper_login_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify({'result': 'error',
                            'message': 'Вы не авторизованы'}), 403
        return func(*args, **kwargs)
    return wrapper_login_required

def admin_required(func):
    @functools.wraps(func)
    def wrapper_admin_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify({'result': 'error',
                            'message': 'Вы не авторизованы'}), 403
        if session['user'].get()['admin'] == True:
            return func(*args, **kwargs)
        return jsonify({'result': 'error',
                    'message:': 'Для данного действия требуются права администратора'}), 400
    return wrapper_admin_required

def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=current_app.config['CONFIRM_SALT'])

def confirm_confirmation_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['CONFIRM_SALT'],
            max_age=expiration
        )
    except:
        return False
    return email

def generate_restoration_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=current_app.config['RESTORE_SALT'])

def confirm_restoration_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['RESTORE_SALT'],
            max_age=expiration
        )
    except:
        return False
    return email
