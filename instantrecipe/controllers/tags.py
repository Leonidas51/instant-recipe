import os
from flask import request, jsonify, Blueprint
from instantrecipe import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
tags_bp = Blueprint('tags', __name__)


@tags_bp.route('/tag/<string:name>/', methods=['GET'])
def read_tag(name):
    if request.method == 'GET':
        try:
            name = name.lower()
            data = mongo.db.tags.find({'name':{'$regex':u'(^' + name + '| ' + name + ')'}}).limit(10)
            if data == None:
                return jsonify(data = 'Nothing was found!'), 204
            data = sorted(list(data), key=lambda x: 'a' + x['name'] if x['name'].startswith(name) else 'b' + x['name'])
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
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_random_tag: ' + str(e))
            return jsonify(data = 'Nothing was found!'), 204
