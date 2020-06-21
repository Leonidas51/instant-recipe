import os
from flask import request, jsonify, Blueprint
from .. import mongo
from ..utils import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
tips_bp = Blueprint('tips', __name__)


@tips_bp.route('/tip/', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def tip():
    if request.method == 'GET':
        query = dict(request.args)
        if 'numeric_id' in query:
            query['numeric_id'] = int(query['numeric_id'])
        data = mongo.db.tips.find_one(query)
        return jsonify(data), 200

    """
    data = request.get_json()
    if request.method == 'POST':
        if all (key in data for key in ('name', 'shortname',
                                        'numeric_id', 'category',
                                        'text_source', 'name_translit',
                                        'category_translit'))
        #if data.get('name', None) is not None and
        #       data.get('email', None) is not None:
            mongo.db.tips.insert_one(data)
            return jsonify({
                'ok': True,
                'message': 'Tip was created successfully!'
            }), 200
        else:
            return jsonify({
                'ok': False,
                'message': 'Bad request parameters!'
            }), 400

    if request.method == 'DELETE':
        if data.get('email', None) is not None:
            db_response = mongo.db.users.delete_one({'email': data['email']})
            if db_response.deleted_count == 1:
                response = {'ok': True, 'message': 'record deleted'}
            else:
                response = {'ok': True, 'message': 'no record found'}
            return jsonify(response), 200
        else:
            return jsonify({
                'ok': False,
                'message': 'Bad request parameters!'
            }), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            mongo.db.users.update_one(
                data['query'], {'$set': data.get('payload', {})})
            return jsonify({'ok': True, 'message': 'record updated'}), 200
        else:
            return jsonify({
                'ok': False,
                'message': 'Bad request parameters!'
            }), 400
    """
