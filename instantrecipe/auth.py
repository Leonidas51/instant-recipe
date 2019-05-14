import os
import datetime
import functools
from itsdangerous import (TimedJSONWebSignatureSerializer
    as Serializer, BadSignature, SignatureExpired)
from passlib.hash import pbkdf2_sha256
from flask import jsonify, session
from instantrecipe import mongo
import logger


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))

class User:
    def hash_password(self, password):
        return pbkdf2_sha256.hash(password)

    def __init__(self, name='default', email='default', password='default', admin=False):
        self.user = {}
        self.user['name'] = name
        self.user['email'] = email
        self.user['password_hash'] = self.hash_password(password)
        self.user['registered_on'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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

    def get(self):
        return self.user

    def get_id(self):
        return self.id

    def set(self, user):
        self.user = user

    def set_from_db_by_email(self, email):
        result = mongo.db.users.find_one({'email': email})
        if not result:
            return False
        self.user = result
        self.id = result.get('_id')
        return True

    @staticmethod
    def already_exists(email):
        if not mongo.db.users.find_one({'email': email}):
            return False
        return True

    def find_by_email(self, email):
        result = mongo.db.users.find_one({'email': email})
        if not result:
            return False
        return True

def login_required(func):
    @functools.wraps(func)
    def wrapper_login_required(*args, **kwargs):
        if session.get('user', None) is None:
            return jsonify(data = 'Unauthorized access'), 200
        return func(*args, **kwargs)
    return wrapper_login_required

"""
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
"""
