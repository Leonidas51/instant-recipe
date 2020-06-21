import os
import re
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint
from .. import mongo
from ..utils import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
ingredients_bp = Blueprint('ingredients', __name__)


@ingredients_bp.route('/ingredient/<string:name>/', methods=['GET'])
def read_ingredient(name):
    if request.method == 'GET':
        try:
            if name is None or len(name) == 0:
                return jsonify([]), 204
            name = name.lower()
            match = re.match('^[ёа-я0-9 ]+$', name)
            if match is None:
                return jsonify([]), 204
            data = mongo.db.ingredients.find({
                'name': {'$regex': u'(^' + name + '| ' + name + ')'}
            }).limit(10)
            if data is None:
                return jsonify([]), 204
            data = sorted(list(data),
                          key=lambda x: 'a' + x['name']
                          if x['name'].startswith(name)
                          else 'b' + x['name'])
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_ingredient: ' + str(e))
            return jsonify([]), 204


@ingredients_bp.route('/random_ingredient/', methods=['GET'])
def read_random_ingredient():
    if request.method == 'GET':
        try:
            data = mongo.db.ingredients.aggregate([{'$sample': {'size': 1}}])
            data = list(data)
            if data is None or len(data) == 0:
                return jsonify(data='Nothing was found!'), 204
            data = data[0]
            return jsonify(data), 200
        except Exception as e:
            LOG.error(
                'error while trying to read_random_ingredient: ' + str(e))
            return jsonify(data='Nothing was found!'), 204


def restore_ings_order(data, ingredients_list):
    data_ids = []
    for data_val in data:
        data_ids.append(data_val['_id'])
    for i, val in enumerate(ingredients_list):
        if ingredients_list[i] != data[i]['_id']:
            buf = data[i]
            index = data_ids.index(ingredients_list[i])
            data[i] = data[index]
            data[index] = buf
    return data


@ingredients_bp.route('/ingredient_by_id/<string:ingredients_list>/',
                      methods=['GET'])
def read_ingredient_by_id_list(ingredients_list):
    if request.method == 'GET':
        try:
            ingredients_list = ingredients_list.split('&')
            ingredients_list = [
                ObjectId(ingredient) for ingredient in ingredients_list]
            data = mongo.db.ingredients.find({
                '_id': {'$in': ingredients_list}
            })
            data = list(data)
            data = restore_ings_order(data, ingredients_list)
            if data is None or len(data) == 0:
                return jsonify(data='Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error(
                'error while trying to read_ingredient_by_id_list: ' + str(e))
            return jsonify(data='Nothing was found!'), 204
