import os
import datetime
from bson.objectid import ObjectId
from passlib.hash import pbkdf2_sha256
from flask import request, jsonify, Blueprint, session
from instantrecipe import mongo
import logger


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
users_bp = Blueprint('users', __name__)


@users_bp.route('/create_users/', methods=['GET'])
def create_users_collecton():
    if request.method == 'GET':
        try:
            if 'users' not in mongo.db.collection_names():
                admin = {'name': 'Admin',
                         'email': 'wayay@yandex.ru',
                         'password': pbkdf2_sha256.hash('69*heehoopeenut69*'),
                         'registered_on': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                         'admin': True}
                mongo.db.users.insert_one(admin)
                return jsonify(data = 'created users'), 200
            else:
                return jsonify(data = 'users already exists'), 200
        except Exception as e:
            LOG.error('error while trying to create_users_collecton: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204

def login():
    pass

def logout():
    pass

def register():
    pass

def get_user():
    pass
