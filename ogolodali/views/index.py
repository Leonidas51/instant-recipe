import os
from flask import Blueprint, render_template
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
index_bp = Blueprint('index', __name__)


@index_bp.route('/')
def index():
    return render_template('index.html')
