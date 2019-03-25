import os
import re
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint
from instantrecipe import mongo
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
            data = list(data)
            if data == None or len(data) == 0:
                return jsonify(data = 'Nothing was found!'), 204
            data = data[0]
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_random_ingredient: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204

@ingredients_bp.route('/ingredient_by_id/<string:ingredients_list>/', methods=['GET'])
def read_ingredient_by_id_list(ingredients_list):
    if request.method == 'GET':
        try:
            ingredients_list = ingredients_list.split('&')
            ingredients_list = [ObjectId(ingredient) for ingredient in ingredients_list]
            data = mongo.db.ingredients.find({'_id': {'$in': ingredients_list}})
            LOG.info(str(ingredients_list))
            data = list(data)
            if data == None or len(data) == 0:
                return jsonify(data = 'Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_ingredient_by_id_list: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204
