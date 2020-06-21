from bson.objectid import ObjectId
import datetime
from itsdangerous import (TimedJSONWebSignatureSerializer as
                          Serializer, BadSignature, SignatureExpired,
                          URLSafeTimedSerializer)
import os
from passlib.hash import pbkdf2_sha256
from typing import Any, Dict, Optional, Union

from .. import mongo
from ..utils import logger


NOT_AUTHORIZED_TEXT: str = 'Вы не авторизованы'
ROOT_PATH: Union[str, None] = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG: Any = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


class User:
    def __init__(self,
                 name: str = 'default',
                 email: str = 'default',
                 password: str = 'default',
                 admin: bool = False) -> None:
        try:
            if not name:
                raise Exception('no user name provided')
            if not email:
                raise Exception('no user email provided')
            if not password:
                raise Exception('no user password provided')

            self.entry: Dict = {
                '_id': None,
                'name': name,
                'email': email.lower(),
                'password_hash': User.hash_password(password),
                'name_lower': name.lower(),
                'confirmed': False,
                'confirmed_on': None,
                'registered_on': datetime.datetime.now().strftime(
                    '%Y-%m-%d %H:%M:%S'),
                'admin': admin,
                'upload_recipes': [],
                'upload_images': [],
                'favorite_recipes': [],
                'liked_recipes': [],
            }
        except Exception as e:
            LOG.error('Error while trying to create user: ' + str(e))

    def verify_password(self, password: str) -> bool:
        hash = self.entry.get('password_hash')
        if hash is None:
            return False

        return pbkdf2_sha256.verify(password, hash)

    def save_to_db(self) -> bool:
        try:
            self.entry['_id'] = mongo.db.users.insert_one(self).inserted_id
            return True
        except Exception as e:
            LOG.error('Error while trying to save user: ' + str(e))
            return False

    def set_from_db_by_email(self, email: str) -> bool:
        try: 
            result = mongo.db.users.find_one({'email': email.lower()})
            if not result:
                return False
            self.user = result
            return True
        except Exception as e:
            LOG.error(
                'Error while trying to set user from db by email: ' + str(e))
            return False

    def get_id(self) -> ObjectId:
        return self.entry['_id']

    def get_entry(self) -> Dict:
        return self.entry

    def update_in_db(self, data: Any) -> None:
        try:
            mongo.db.users.update_one({'_id': self.entry['_id']},
                                      {'$set': data},
                                      upsert=False)
        except Exception as e:
            LOG.error('Error while trying to update user: ' + str(e))

    def generate_auth_token(self, expiration: int = 600) -> Union[bytes, None]:
        try:
            secret: Optional[str] = os.getenv('SECRET_KEY')
            if not secret:
                raise ValueError('No secret key provided')
            s = Serializer(secret, expires_in=expiration)
            return s.dumps({'id': str(self.entry['_id'])})
        except ValueError as err:
            LOG.error('Error while trying to generate_auth_token: ' + str(err))
            return None

    def verify_auth_token(self, token: str) -> Union[None, bool]:
        try:
            secret: Optional[str] = os.getenv('SECRET_KEY')
            if not secret:
                raise ValueError('No secret key provided')
            data = Serializer(secret).loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        except ValueError as err:
            LOG.error('Error while trying to verify_auth_token: ' + str(err))
            return None

        result = mongo.db.users.find_one({'_id': ObjectId(data['id'])})
        if result is None:
            return False
        self.entry = result
        return True

    @staticmethod
    def hash_password(password: str) -> str:
        return pbkdf2_sha256.hash(password)

    @staticmethod
    def find_by_email(email: str) -> bool:
        if not mongo.db.users.find_one({'email': email.lower()}):
            return False
        return True

    @staticmethod
    def find_by_name(name: str) -> bool:
        if not mongo.db.users.find_one({'name_lower': name.lower()}):
            return False
        return True

    @staticmethod
    def read_from_db_by_email(email: str) -> Union[None, 'User']:
        result = mongo.db.users.find_one({'email': email.lower()})

        if not result:
            return None

        user = User()
        user.entry.update(result)
        return user
