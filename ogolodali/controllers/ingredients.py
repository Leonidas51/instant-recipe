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
        try:
            data = mongo.db.ingredients.find({'name':{'$regex':u'(^' + name + '| ' + name + ')'}}).limit(10)
            if data == None:
                return jsonify(data = 'Nothing was found!'), 204
            data = sorted(list(data), key=lambda x: 'a' + x['name'] if x['name'].startswith(name) else 'b' + x['name'])
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_ingredient: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204

@ingredients_bp.route('/random_ingredient/', methods=['GET'])
def read_random_ingredient():
    if request.method == 'GET':
        try:
            data = mongo.db.ingredients.aggregate([{ '$sample': {'size': 1} }])
            if data == None:
                return jsonify(data = 'Nothing was found!'), 204
            data = list(data)[0]
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_random_ingredient: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204
