import os
from flask import Blueprint, current_app, render_template, \
    make_response, send_from_directory
# from flask_wtf.csrf import generate_csrf
from ..utils import auth, logger


DEFAULT_PIC = 'default.png'
ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
MAIN_PIC = 'main.jpg'
PROJECT_NAME = os.environ.get('FLASK_APP')
index_bp = Blueprint('index', __name__)


@index_bp.route('/')
@index_bp.route('/<path:path>')
def index(path=''):
    response = make_response(render_template('index.html'))
    # response.set_cookie('csrftoken', generate_csrf(), samesite='Strict')
    return response


@index_bp.route('/images/recipes/dist/<path:path>')
def show_image(path):
    LOG.info('show_image {}'.format(path))
    dist_path = os.path.abspath(current_app.config['PHOTOS_DIST_FOLDER'])
    if os.path.isfile(os.path.join(dist_path, path, MAIN_PIC)):
        return send_from_directory(os.path.join(dist_path, path), MAIN_PIC)
    else:
        return send_from_directory(dist_path, DEFAULT_PIC)


@index_bp.route('/images/recipes/upload/<path:path>')
@auth.admin_required
def show_upload_image(path):
    upload_path = os.path.abspath(current_app.config['PHOTOS_UPLOAD_FOLDER'])
    dist_path = os.path.abspath(current_app.config['PHOTOS_DIST_FOLDER'])
    if os.path.isfile(os.path.join(upload_path, path)):
        return send_from_directory(upload_path, path)
    else:
        return send_from_directory(dist_path, DEFAULT_PIC)
