import os
import re
from flask import request, jsonify, Blueprint
from ogolodali import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
ingredients_bp = Blueprint('ingredients', __name__)


@ingredients_bp.route('/ingredient/<string:name>/', methods=['GET'])
def read_ingredient(name):
    if request.method == 'GET':
        data = mongo.db.ingredients.find({'name':{'$regex':u'^' + name}}).limit(10)
        if data == None:
            return jsonify(data = 'Nothing was found!'), 204
        data = [ingredient for ingredient in data]
        return jsonify(data), 200
