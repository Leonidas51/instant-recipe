import os
from flask import request, jsonify
from ogolodali import ogolodali, mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
__name__, filename=os.path.join(ROOT_PATH, 'output.log'))

@ogolodali.route('/recipe/<recipe_id>/', methods=['GET'])
def recipe(recipe_id):
	data = mongo.db.recipes.find_one({u'numeric_id': int(recipe_id)})
	return jsonify(data), 200