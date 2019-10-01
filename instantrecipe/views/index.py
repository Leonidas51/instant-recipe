import os
from flask import Blueprint, render_template, make_response, send_from_directory
from flask_wtf.csrf import generate_csrf
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
index_bp = Blueprint('index', __name__)


@index_bp.route('/')
@index_bp.route('/<path:path>')
def index(path = ''):
    response = make_response(render_template('index.html'))
    #response.set_cookie('csrftoken', generate_csrf(), samesite='Strict')
    return response

@index_bp.route('/images/recipes/dist/<path:path>')
def show_image(path):
    if os.path.isfile('instantrecipe/images/recipes/dist/' + path + 'main.jpg'):
        return send_from_directory('images/recipes/dist/' + path, 'main.jpg')
    else:
        return send_from_directory('images/recipes/dist/', 'default.png')
        