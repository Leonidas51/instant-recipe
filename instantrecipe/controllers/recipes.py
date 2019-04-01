import os
import re
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint
from instantrecipe import mongo
import logger


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
	__name__, filename=os.path.join(ROOT_PATH, 'output.log'))
recipes_bp = Blueprint('recipe', __name__)


@recipes_bp.route('/recipe/update/', methods=['GET'])
def update_recipe(recipe_id):
	if request.method == 'GET':
		try:
			data = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
			if data == None:
				return jsonify(data = 'Nothing was found!'), 204
			return jsonify(data), 200
		except Exception as e:
			LOG.error('error while trying to read_recipe: ' + str(e))
			return jsonify(data = 'Nothing was found!'), 204

@recipes_bp.route('/update_db/', methods=['GET'])
def update_db():
	for recipe in mongo.db.recipes.find({}):
		instructions_source = filter_brackets(recipe['instructions_source'])
		result = mongo.db.test.update_one({'_id': recipe['_id']}, {'$set': {'instructions_source': instructions_source}})
		LOG.info(result, recipe['_id'], recipe['name'])
	return jsonify(data = 'Check me out'), 200

def filter_brackets(instructions):
	match_square_and_round_brackets = re.compile('\[[»ЁёА-я0-9 »]+\]\([A-z0-9 \/]+\)')
	match_square_brackets = re.compile('\[[»ЁёА-я »]+\]\[[A-z \/]+\]')

	def replace_square(match):
		ind = match.group().find('][')
		return match.group()[1:ind]
	def replace_round(match):
		ind = match.group().find('](')
		return match.group()[1:ind]

	instructions = match_square_and_round_brackets.sub(replace_round, instructions)
	instructions = match_square_brackets.sub(replace_square, instructions)
	return instructions

@recipes_bp.route('/recipe/<recipe_id>/', methods=['GET'])
def read_recipe(recipe_id):
	if request.method == 'GET':
		try:
			data = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
			#data['instructions_source'] = filter_brackets(data['instructions_source'])
			if data == None:
				return jsonify(data = 'Nothing was found!'), 204
			return jsonify(data), 200
		except Exception as e:
			LOG.error('error while trying to read_recipe: ' + str(e))
			return jsonify(data = 'Nothing was found!'), 204

# sort_type = ['difficulty, 'time', 'full-match']
def get_pipeline(ingredients_list, sort_conditions=[]):
	pipeline = [
		{'$match': {'published': True}},
		# находим массив совпадений ингредиентов
		{'$addFields': {
			'matches': {
				'$setIntersection': ['$ingredient_ids', ingredients_list]
			},
		}},
		# находим количество совпадений ингредиентов
		{'$addFields': {
			'matches_size': {'$size': '$matches'},
		}},
		# число совпадений с введенными ингредиентами
		{'$match': {'matches_size': {'$gt': 0}}},
		# выясняем дополнительные подробности
		{'$addFields': {
			'ingredient_list_has_but_recipe_doesnt': {
				'$setDifference': [ingredients_list, '$ingredient_ids']
			},
			'recipe_has_but_ingredient_list_doesnt': {
				'$setDifference': ['$ingredient_ids', ingredients_list]
			},
		}},
		{'$addFields': {
			'ingredient_list_has_but_recipe_doesnt_size': {
				'$size': '$ingredient_list_has_but_recipe_doesnt'
			},
			'recipe_has_but_ingredient_list_doesnt_size': {
				'$size': '$recipe_has_but_ingredient_list_doesnt'
			},
		}}
	]
	count_match_percent = count_match_percent = {'$addFields': {'matches_percent': {'$trunc': {
								'$multiply': [{'$divide': [
									'$matches_size', {'$size': '$ingredient_ids'}
								]}, 100]
							}}}}
	# присутствие всех ингредиентов из поиска не обязательно
	# от наименьшего расхождения со списком ингредиентов до наибольшего
	sort = {'$sort': {
				'recipe_has_but_ingredient_list_doesnt_size': 1,
				'ingredient_list_has_but_recipe_doesnt_size': 1
			}}
	if 'full-match' in sort_conditions:
		count_match_percent = {'$addFields': {'matches_percent': {'$trunc': {
									'$multiply': [{'$divide': ['$matches_size', {'$size': {
										'$setUnion': ['$ingredient_ids', ingredients_list]
									}}]}, 100]
								}}}}
		# выдача от наибольшего совпадения до наименьшего
		# от наименьшего расхождения со списком ингредиентов до наибольшего
		sort = {'$sort': {
					'matches_size': -1,
					'recipe_has_but_ingredient_list_doesnt_size': 1,
					'ingredient_list_has_but_recipe_doesnt_size': 1
				}}

	limit = {'$limit' : 100}

	pipeline.extend([count_match_percent, sort, limit])
	return pipeline

@recipes_bp.route('/recipe_list/<string:args>/', methods=['GET'])
def read_recipe_list(args):
	if request.method == 'GET':
		try:
			if args:
				args = args.split('_')
				ingredients_list = args[0].split('&')
				ingredients_list = [ObjectId(ingredient) for ingredient in ingredients_list]
				sort_conditions = []
				if len(args) > 1:
					sort_conditions = args[1].split('&')
				data = mongo.db.recipes.aggregate(get_pipeline(ingredients_list, sort_conditions))
				data = list(data)

				if data == None:
					return jsonify(data = 'Nothing was found!'), 204

				return jsonify(data), 200
		except Exception as e:
			LOG.error('error while trying to read_recipe_list: ' + str(e))
			return jsonify(data = 'Nothing was found!'), 204

@recipes_bp.route('/recipe_ings_info/<string:args>/', methods=['GET'])
def read_recipe_ings_info(args):
	if request.method == 'GET':
		try:
			if args:
				args = args.split('_')
				matches = []
				recipe_has_but_ingredient_list_doesnt = []
				if args[0]:
					matches = args[0].split('&')
					matches = [ObjectId(ingredient) for ingredient in matches]
				if args[1]:
					recipe_has_but_ingredient_list_doesnt = args[1].split('&')
					recipe_has_but_ingredient_list_doesnt = [
						ObjectId(ingredient) for ingredient in recipe_has_but_ingredient_list_doesnt]
				LOG.info(matches, recipe_has_but_ingredient_list_doesnt)
				data = {}
				if len(matches):
					user_has_ings = mongo.db.ingredients.find({'_id': {
						'$in': matches
					}})
					data['user_has_ings'] = list(user_has_ings)
				if len(recipe_has_but_ingredient_list_doesnt):
					user_doesnt_have_ings = mongo.db.ingredients.find({'_id': {
						'$in': recipe_has_but_ingredient_list_doesnt
					}})
					data['user_doesnt_have_ings'] = list(user_doesnt_have_ings)
				return jsonify(data), 200
		except Exception as e:
			LOG.error('error while trying to read_recipe_ings_info: ' + str(e))
			return jsonify(data = 'Nothing was found!'), 204
