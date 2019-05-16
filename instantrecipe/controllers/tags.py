import os
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint
from instantrecipe import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
tags_bp = Blueprint('tags', __name__)


@tags_bp.route('/suggested_tags/<string:name>/', methods=['GET'])
def read_suggested_tags(name):
    if request.method == 'GET':
        try:
            name = name.lower()
            data = mongo.db.tags.find({'name':{'$regex':u'(^' + name + '| ' + name + ')'}}).limit(10)
            if data == None:
                return jsonify(data = 'Nothing was found!'), 204
            data = sorted(list(data), key=lambda x: 'a' + x['name'] if x['name'].startswith(name) else 'b' + x['name'])
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_suggested_tags: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204

@tags_bp.route('/tag/<string:name>/', methods=['GET'])
def read_tag(name):
    if request.method == 'GET':
        try:
            name = name.lower()
            data = mongo.db.tags.find_one({'name': name})
            if data == None:
                return jsonify(data = 'Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_tag: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204

@tags_bp.route('/random_tag/', methods=['GET'])
def read_random_tag():
    if request.method == 'GET':
        try:
            data = mongo.db.tags.aggregate([{ '$sample': {'size': 1} }])
            data = list(data)
            if data == None or len(data) == 0:
                return jsonify(data = 'Nothing was found!'), 204
            data = data[0]
            #LOG.info(data)
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_random_tag: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204

def restore_tags_order(data, tags_list):
    data_ids = []
    for data_val in data:
        data_ids.append(data_val['_id'])
    for i, val in enumerate(tags_list):
        if tags_list[i] != data[i]['_id']:
            buf = data[i]
            index = data_ids.index(tags_list[i])
            data[i] = data[index]
            data[index] = buf
    return data

@tags_bp.route('/tag_by_id/<string:tags_list>/', methods=['GET'])
def read_tag_by_id_list(tags_list):
    if request.method == 'GET':
        try:
            tags_list = tags_list.split('&')
            tags_list = [ObjectId(tag) for tag in tags_list]
            data = mongo.db.tags.find({'_id': {'$in': tags_list}})
            data = list(data)
            data = restore_tags_order(data, tags_list)
            if data == None or len(data) == 0:
                return jsonify(data = 'Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_tag_by_id_list: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204
