import os
from flask import Blueprint, render_template, make_response, \
    send_from_directory
from flask_wtf.csrf import generate_csrf
from instantrecipe.auth import admin_required
import logger

DEFAULT_PIC = 'default.png'
DIST_PATH = 'images/recipes/dist/'
ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
MAIN_PIC = 'main.jpg'
PROJECT_NAME = os.environ.get('FLASK_APP')
UPLOAD_PATH = 'images/recipes/upload/'
index_bp = Blueprint('index', __name__)


@index_bp.route('/')
@index_bp.route('/<path:path>')
def index(path=''):
    response = make_response(render_template('index.html'))
    # response.set_cookie('csrftoken', generate_csrf(), samesite='Strict')
    return response


@index_bp.route('/images/recipes/dist/<path:path>')
def show_image(path):
    if os.path.isfile(os.path.join(PROJECT_NAME, DIST_PATH, path, MAIN_PIC)):
        return send_from_directory(DIST_PATH + path, MAIN_PIC)
    else:
        return send_from_directory(DIST_PATH, DEFAULT_PIC)


@index_bp.route('/images/recipes/upload/<path:path>')
@admin_required
def show_upload_image(path):
    if os.path.isfile(os.path.join(PROJECT_NAME, UPLOAD_PATH, path)):
        return send_from_directory(UPLOAD_PATH, path)
    else:
        return send_from_directory(DIST_PATH, DEFAULT_PIC)
