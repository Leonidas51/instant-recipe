import os
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, session
from instantrecipe import mongo
import logger
from flask_wtf.csrf import generate_csrf


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/utils/csrf/', methods=['GET'])
def request_CSRF_token():
    if request.method == 'GET':
        try:
            return jsonify({'csrftoken': generate_csrf()}), 200
        except Exception as e:
            LOG.error('error while trying to request_CSRF_token: ' + str(e))
            return jsonify(data = str(e)), 200

"""
def filter_brackets(instructions):
	match_square_and_round_brackets = re.compile('\[[»ЁёА-я0-9 »]+\]\([A-z0-9 \/]+\)')
	match_square_brackets = re.compile('\[[»ЁёА-я »]+\]\[[A-z0-9 \/]+\]')

	def replace_square(match):
		ind = match.group().find('][')
		return match.group()[1:ind]
	def replace_round(match):
		ind = match.group().find('](')
		return match.group()[1:ind]

	instructions = match_square_and_round_brackets.sub(replace_round, instructions)
	instructions = match_square_brackets.sub(replace_square, instructions)
	return instructions

@recipes_bp.route('/remove_brackets/', methods=['GET'])
def remove_brackets():
	for recipe in mongo.db.recipes.find({}):
		instructions_source = filter_brackets(recipe['instructions_source'])
		result = mongo.db.recipes.update_one(
			{'_id': recipe['_id']},
			{'$set': {'instructions_source': instructions_source}})

	return jsonify(data = 'removed brackets'), 200

@recipes_bp.route('/remove_salt/', methods=['GET'])
def remove_salt():
	salt_id = ObjectId('4f6d5ab92c607d97620000f6')
	salt = 'соль'
	for recipe in mongo.db.recipes.find({}):
		if salt_id in recipe['ingredient_ids']:
			new_ingredient_ids = recipe['ingredient_ids']
			new_ingredient_ids.remove(salt_id)
			result = mongo.db.recipes.update_one(
				{'_id': recipe['_id']},
				{'$set': {'ingredient_ids': new_ingredient_ids}})
		if salt in recipe['ingredient_names']['mandatory']:
			new_ingredient_names = recipe['ingredient_names']['mandatory']
			new_ingredient_names.pop(salt_id, None)
			result = mongo.db.recipes.update_one(
				{'_id': recipe['_id']},
				{'$set': {'ingredient_names.mandatory': new_ingredient_names}})
	result = mongo.db.ingredients.delete_one({'_id': salt_id})

	return jsonify(data = 'removed salt'), 200
"""
