import os
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, session
from instantrecipe import mongo
import logger
from instantrecipe.auth import User, login_required


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
users_bp = Blueprint('users', __name__)

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

@users_bp.route('/user/register/', methods=['POST'])
def register():
    try:
        username = request.json.get('username')
        email = request.json.get('email')
        password = request.json.get('password')
        if username is None or email is None or password is None:
            return jsonify({'result': 'error', 'message': 'Username, email or password are not valid'}), 200
        if User.find_by_email(email):
            return jsonify({'result': 'error', 'message': 'Email already in use!'}), 200
        if User.find_by_name(username):
            return jsonify({'result': 'error', 'message': 'Name already in use!'}), 200
        user = User(username, email, password)
        user.save_to_db()
        session['user'] = user
        #auth_token = user.generate_auth_token()
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        LOG.error('error while trying to register: ' + str(e))
        return jsonify({'result': 'error', 'message:': 'Something not right'}), 200

@users_bp.route('/user/login/', methods=['POST'])
def login(email, password):
    try:
        user = User()
        if not user.find_by_email(email):
            return jsonify({'result': 'error', 'message': 'Wrong username'}), 200
        user.set_from_db_by_email(email)
        if not user.verify_password(password):
            return jsonify({'result': 'error', 'message': 'Wrong password'}), 200
        session['user'] = user
        #auth_token = user.generate_auth_token()
        return jsonify({'result': 'success'}), 200
    except:
        LOG.error('error while trying to login: ' + str(e))
        return jsonify({'result': 'error', 'message:': 'Something not right'}), 200

@users_bp.route('/user/logout/', methods=['POST'])
def logout():
    try:
        session.pop('user')
        return jsonify({'result': 'success'}), 200
    except:
        return jsonify({'result': 'error', 'message:': 'No user in session'}), 200

@users_bp.route('/user/isloggedin/', methods=['POST'])
def is_logged_in():
    if 'user' in session:
        return jsonify({'result': 'success'}), 200
    return jsonify({'result': 'error', 'message:': 'No user in session'}), 200

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
