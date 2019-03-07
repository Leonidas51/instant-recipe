import os
from flask import request, jsonify, Blueprint
from ogolodali import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
ingredients_bp = Blueprint('ingredients', __name__)


@ingredients_bp.route('/ingredient', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def ingredient():
    if request.method == 'GET':
        query = dict(request.args)
        if 'numeric_id' in query:
            query['numeric_id'] = int(query['numeric_id'])
        data = mongo.db.ingredients.find_one(query)
        return jsonify(data), 200
