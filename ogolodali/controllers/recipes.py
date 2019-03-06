import os
from flask import request, jsonify, Blueprint
from ogolodali import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
	__name__, filename=os.path.join(ROOT_PATH, 'output.log'))
recipes_bp = Blueprint('recipe', __name__)


@recipes_bp.route('/recipe/<recipe_id>/', methods=['GET'])
def recipe(recipe_id):
	data = mongo.db.recipes.find_one({u'numeric_id': int(recipe_id)})
	return jsonify(data), 200
