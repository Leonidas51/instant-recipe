import os
import re
import datetime
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, session, redirect
from flask_wtf.csrf import generate_csrf
from ..utils import auth, email, logger
from ..utils.user import User
from .. import mongo


ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
users_bp = Blueprint('users', __name__)
SERVER_ERROR = 'Произошла ошибка сервера! Приносим свои извинения'


@users_bp.route('/get_csrf/', methods=['GET'])
def get_csrf():
    try:
        gen_csrf = generate_csrf()
        return jsonify(csrf=gen_csrf), 200
    except Exception as e:
        LOG.error('error while generating csrf: ' + str(e))
        return jsonify(error=str(e)), 400


@users_bp.route('/user/create_admin/', methods=['GET'])
def create_admin():
    if request.method == 'GET':
        try:
            name = 'Admin'
            user_email = 'wayay@yandex.ru'
            password = '69*heehoopeenut69*'
            if not User.find_by_email(user_email):
                admin = User(name, user_email, password, True,
                             datetime.datetime.now().strftime(
                                 '%Y-%m-%d %H:%M:%S'), True)
                admin.save_to_db()
                return jsonify(data='created admin'), 200
        except Exception as e:
            LOG.error('error while trying to create_admin: ' + str(e))
            return jsonify(data='error'), 200


def validate_username(name):
    if name is None or not re.match(r'^[-_.\'`А-яA-z0-9]+$', name):
        return False
    return True


def validate_email(user_email):
    if user_email is None or not re.match(
            r'^.+@[А-яA-z0-9]+\..+$', user_email):
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
            user_email = session.get('user').get_entry()['email']
            email.send_verification_email(user_email)
            return jsonify({'result': 'success',
                            'message:': 'Попробуйте проверить почту \
                                (и папку спам!)'}), 200
    except Exception as e:
        LOG.error('error while trying to resend_verification_email: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400


@users_bp.route('/user/restore_password_entered_email/', methods=['POST'])
def restore_password_entered_email():
    try:
        user_email = request.json.get('email')
        if not validate_email(user_email):
            jsonify({'result': 'error',
                     'message:': 'Введенный e-mail не валиден'}), 400
        if User.find_by_email(user_email):
            email.send_restore_password_email(user_email)
            return jsonify({'result': 'success',
                            'message:': 'Попробуйте проверить почту \
                                (и папку спам!)'}), 200
        return jsonify({'result': 'error',
                        'message:': 'Пользователь с введенными данными \
                            не зарегистрирован'}), 400
    except Exception as e:
        LOG.error(
            'error while trying to restore_password_entered_email: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400


@users_bp.route('/user/register/', methods=['POST'])
def register():
    try:
        username = request.json.get('username')
        user_email = request.json.get('email')
        password = request.json.get('password')
        if (
            not validate_username(username) or not
            validate_email(user_email) or not validate_password(password)
           ):
            return jsonify({'result': 'error',
                            'message': 'Имя, e-mail или пароль \
                                введены неверно!'}), 400
        if User.find_by_email(user_email):
            return jsonify({'result': 'error',
                            'message': 'Пользователь с таким e-mail \
                                уже зарегистрирован!'}), 400
        if User.find_by_name(username):
            return jsonify({'result': 'error',
                            'message': 'Пользователь с таким именем \
                                уже зарегистрирован!'}), 400
        user = User(username, user_email, password)

        # jwt token
        auth_token = user.generate_auth_token()

        email.send_verification_email(user_email)

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
        user_email = request.json.get('email')
        password = request.json.get('password')
        if not validate_email(user_email) or not validate_password(password):
            return jsonify({'result': 'error',
                            'message': 'E-mail или пароль \
                                введены неверно!'}), 400
        if not User.find_by_email(user_email):
            return jsonify({'result': 'error',
                            'message': 'Неверный e-mail или пароль'}), 400
        user = User.read_from_db_by_email(user_email)
        if not user.verify_password(password):
            return jsonify({'result': 'error',
                            'message': 'Неверный e-mail или пароль'}), 400
        session['user'] = user
        auth_token = user.generate_auth_token()
        return jsonify({'result': 'success',
                        'username': user.get_entry()['name'],
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
    except Exception:
        return jsonify({'result': 'error',
                        'message:': 'Данный пользователь не осуществлял \
                            вход в аккаунт'}), 400


@users_bp.route('/user/isloggedin/', methods=['POST'])
def is_logged_in():
    # auth_token = user.verify_auth_token(email_or_token)
    if 'user' in session:
        return jsonify({'result': 'success',
                        'username': session['user'].get_entry()['name'],
                        'user_id': session['user'].get_id(),
                        'admin': session['user'].get_entry()['admin']}), 200
    return jsonify({'result': 'error',
                    'message:': 'Данный пользователь не осуществлял \
                        вход в аккаунт'}), 400


@users_bp.route('/user/isadmin/', methods=['POST'])
def is_admin():
    if 'user' in session and session['user'].get_entry()['admin'] is True:
        return jsonify({'result': 'success'}), 200
    return jsonify({'result': 'error',
                    'message:': 'Для данного действия требуются \
                        права администратора'}), 400


@users_bp.route('/user/redirect/confirm/<token>/')
def redirect_confirm_email(token):
    return redirect('/user/confirm/' + token)


@users_bp.route('/user/confirm/<token>/')
def confirm_email(token):
    user_email = auth.confirm_confirmation_token(token)

    if not user_email:
        return jsonify({'result': 'error',
                        'message': 'Ссылка для подтверждения \
                            недействительна или просрочена'}), 400
    user = User()
    user.set_from_db_by_email(user_email)
    if user.get_entry()['confirmed']:
        return jsonify({'result': 'success',
                        'message': 'Данный e-mail уже подтвержден'}), 200
    else:
        confirmation_data = {'confirmed': True,
                             'confirmed_on': datetime.datetime.now().strftime(
                                 '%Y-%m-%d %H:%M:%S')}
        user.update_in_db(confirmation_data)
        user.set_from_db_by_email(user_email)
        session['user'] = user

    return jsonify({'result': 'success',
                    'message': 'E-mail успешно подтвержден'}), 200


@users_bp.route('/user/redirect/restore_password/<token>/')
def redirect_restore_password(token):
    return redirect('/user/restore/' + token)


@users_bp.route('/user/restore/<token>/', methods=['GET'])
def restore_password_with_token(token):
    try:
        user_email = auth.confirm_restoration_token(token)
        if email:
            session['email_reset'] = user_email
            return jsonify({'result': 'success'}), 200
        else:
            return jsonify({'result': 'error',
                            'message': 'Ссылка для восстановления \
                                недействительна или просрочена'}), 400
    except Exception as e:
        LOG.error(
            'error while trying to restore_password_with_token: ' + str(e))
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
                                    'message': 'Пароль должен быть \
                                        не короче 6 символов'}), 400

                user_email = session.get('email_reset')
                session.pop('email_reset')
                user = User()
                user.set_from_db_by_email(user_email)
                reset_data = {
                    'password_hash': user.hash_password(new_password)
                }
                user.update_in_db(reset_data)
                return jsonify({'result': 'success',
                                'message': 'Пароль восстановлен'}), 200
            else:
                return jsonify({'result': 'error',
                                'message': 'Ссылка для восстановления \
                                    недействительна или просрочена'}), 400
    except Exception as e:
        LOG.error(
            'error while trying to restore_password_new_password: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400


@users_bp.route('/user/read_user_info/<string:user_id>/', methods=['GET'])
def read_user_info(user_id):
    if request.method != 'GET':
        return
    try:
        if not ObjectId.is_valid(user_id):
            return jsonify({'result': 'error',
                            'message': 'Пользователь не найден'}), 204

        user_db = mongo.db.users.find_one({u'_id': ObjectId(user_id)})
        if not user_db:
            return jsonify({'result': 'error',
                            'message': 'Пользователь не найден'}), 204

        user = {
            'name': user_db['name'],
            'favorite_recipes': read_user_favorites(user_db),
            'liked_recipes': read_user_liked(user_db),
            'upload_recipes': read_user_published(user_db),
            'upload_images': read_user_images(user_db),
            'confirmed': user_db['confirmed']
        }

        if 'user' in session:
            if session['user'].get_id() == user_db['_id']:
                user['email'] = user_db['email']
                user['is_owner'] = True
            else:
                user['is_owner'] = False

        return jsonify({'user': user})
    except Exception as e:
        LOG.error('error while trying to read_user_info: ' + str(e))
        return jsonify({'result': 'error',
                        'message': SERVER_ERROR}), 400


def read_user_favorites(user):
    try:
        favorites = []
        for recipe_id in user['favorite_recipes']:
            recipe_db = mongo.db.recipes.find_one({'_id': ObjectId(recipe_id)})

            if not recipe_db or not recipe_db['published']:
                continue

            favorites.append({
                'id': recipe_id,
                'name': recipe_db['name']
            })
        return favorites
    except Exception as e:
        LOG.error('error while trying to read_user_favorites: ' + str(e))
        return []


def read_user_liked(user):
    try:
        liked = []
        for recipe_id in user['liked_recipes']:
            recipe_db = mongo.db.recipes.find_one({'_id': ObjectId(recipe_id)})

            if not recipe_db or not recipe_db['published']:
                continue

            liked.append({
                'id': recipe_id,
                'name': recipe_db['name']
            })
        return liked
    except Exception as e:
        LOG.error('error while trying to read_user_liked: ' + str(e))
        return []


def read_user_published(user):
    try:
        published = []
        for recipe_id in user['upload_recipes']:
            recipe_db = mongo.db.recipes.find_one({
                '_id': ObjectId(recipe_id)
            })

            if not recipe_db or not recipe_db['published']:
                continue

            published.append({
                'id': recipe_id,
                'name': recipe_db['name']
            })
        return published
    except Exception as e:
        LOG.error('error while trying to read_user_published: ' + str(e))
        return []


def read_user_images(user):
    try:
        images = []
        user_upload_images = mongo.db.upload_images.find({
            'uploader_id': ObjectId(user['_id']),
            'published': True,
            'recipe_published': True
            })
        for image in user_upload_images:
            images.append({
                'id': image['_id'],
                'recipe_id': image['recipe_id'],
                'recipe_name': image['recipe_name']
            })
        return images
    except Exception as e:
        LOG.error('error while trying to read_user_images: ' + str(e))
        return []  


@users_bp.route('/user/change_user_name/', methods=['POST'])
@auth.login_required
def change_user_name():
    if request.method != 'POST':
        return
    try:
        new_name = request.json.get('new_name')

        if not validate_username(new_name):
            return jsonify({'result': 'error',
                            'message': 'Имя содержит недопустимые \
                            символы'}), 400

        if User.find_by_name(new_name):
            return jsonify({'result': 'error',
                            'message': 'Пользователь с таким именем \
                                уже зарегистрирован!'}), 400

        now = datetime.datetime.now()
        if hasattr(session['user'].get_entry(), 'last_name_change'):
            last = datetime.datetime.strptime(
                session['user'].get_entry()['last_name_change'], '%Y-%m-%d'
            ).date()
            if (now.date() - last).days < 30:
                return jsonify({'result': 'error',
                                'message': 'С прошлой смены прошло \
                                недостаточно времени'}), 400

        session['user'].update_in_db(
            {
                'name': new_name,
                'name_lower': new_name.lower(),
                'last_name_change': now.strftime('%Y-%m-%d'),
            }
        )
        session['user'].set_from_db_by_email(
            session['user'].get_entry()['email'])
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        LOG.error('error while trying to change_user_name: ' + str(e))
        return jsonify({'result': 'error',
                        'message': SERVER_ERROR}), 400


@users_bp.route('/user/change_password/', methods=['POST'])
def change_password():
    if request.method != 'POST':
        return
    try:
        email.send_restore_password_email(session['user'].get_entry()['email'])
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        LOG.error(
            'error while trying to change_password: ' + str(e))
        return jsonify({'result': 'error',
                        'message:': SERVER_ERROR}), 400
