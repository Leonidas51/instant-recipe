import os
from flask import request, jsonify, Blueprint
from instantrecipe import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
tags_bp = Blueprint('tags', __name__)


@tags_bp.route('/tag', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def tag():
    if request.method == 'GET':
        query = dict(request.args)
        data = mongo.db.tags.find_one(query)
        return jsonify(data), 200
