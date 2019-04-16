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

@recipes_bp.route('/update_db/', methods=['GET'])
def update_db():
	for recipe in mongo.db.recipes.find({}):
		instructions_source = filter_brackets(recipe['instructions_source'])
		result = mongo.db.recipes.update_one({'_id': recipe['_id']}, {'$set': {'instructions_source': instructions_source}})

	return jsonify(data = 'check me out'), 200

@recipes_bp.route('/recipe/<recipe_id>/', methods=['GET'])
def read_recipe(recipe_id):
	if request.method == 'GET':
		try:
			data = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
			if data == None:
				return jsonify(data = 'Nothing was found!'), 204
			return jsonify(data), 200
		except Exception as e:
			LOG.error('error while trying to read_recipe: ' + str(e))
			return jsonify(data = 'Nothing was found!'), 204

def get_ingredients_pipeline(searched_items):
	# находим массив совпадений ингредиентов
	matches = {'$addFields': {
		'matches': {
			'$setIntersection': ['$ingredient_ids', searched_items]
		},
	}}
	# находим количество совпадений ингредиентов
	matches_size = {'$addFields': {
		'matches_size': {'$size': '$matches'},
	}}
	# число совпадений с введенными ингредиентами
	match_condition = {'$match': {'matches_size': {'$gt': 0}}}
	# выясняем дополнительные подробности
	ings_info = {'$addFields': {
		'ingredient_list_has_but_recipe_doesnt': {
			'$setDifference': [searched_items, '$ingredient_ids']
		},
		'recipe_has_but_ingredient_list_doesnt': {
			'$setDifference': ['$ingredient_ids', searched_items]
		},
	}}
	ings_info_sizes = {'$addFields': {
		'ingredient_list_has_but_recipe_doesnt_size': {
			'$size': '$ingredient_list_has_but_recipe_doesnt'
		},
		'recipe_has_but_ingredient_list_doesnt_size': {
			'$size': '$recipe_has_but_ingredient_list_doesnt'
		},
	}}
	return matches, matches_size, match_condition, ings_info, ings_info_sizes

#def get_recipe_names_pipeline(searched_items):
#	pass

def get_tags_pipeline(searched_items):
	# находим массив совпадений ингредиентов
	matches = {'$addFields': {
		'matches': {
			'$setIntersection': ['$ingredient_ids', searched_items]
		},
	}}
	# находим количество совпадений ингредиентов
	matches_size = {'$addFields': {
		'matches_size': {'$size': '$matches'},
	}}
	# число совпадений с введенными ингредиентами
	match_condition = {'$match': {'matches_size': {'$gt': 0}}}
	return matches, matches_size, match_condition

# sort_type = ['timedesc', 'timeasc', 'full-match']
def get_pipeline(search_type, searched_items, sort_conditions=[]):
	pipeline = [
		{'$match': {'published': True}}
	]
	matches = {}
	matches_size = {}
	match_condition = {}
	sort = {}
	timesort = {}
	if 'timedesc' in sort_conditions:
		timesort = {'$sort': {
			'cooking_time_max': -1,
			'cooking_time_min': -1,
		}}
	elif 'timeasc' in sort_conditions:
		timesort = {'$sort': {
			'cooking_time_max': 1,
			'cooking_time_min': 1,
		}}
	limit = {'$limit' : 100}

	if search_type == 'by_ings':
		ings_info = {}
		ings_info_sizes = {}
		count_match_percent = {}
		matches, matches_size, match_condition, ings_info, ings_info_sizes = get_ingredients_pipeline(searched_items)
		if 'full-match' in sort_conditions:
			count_match_percent = {'$addFields': {'matches_percent': {'$trunc': {
										'$multiply': [{'$divide': ['$matches_size', {'$size': {
											'$setUnion': ['$ingredient_ids', searched_items]
										}}]}, 100]
									}}}}
			# выдача от наибольшего совпадения до наименьшего
			# от наименьшего расхождения со списком ингредиентов до наибольшего
			sort = {'$sort': {
						'matches_size': -1,
						'recipe_has_but_ingredient_list_doesnt_size': 1,
						'ingredient_list_has_but_recipe_doesnt_size': 1
					}}
		else:
			count_match_percent = {'$addFields': {'matches_percent': {'$trunc': {
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
		if not timesort:
			pipeline.extend([matches, matches_size, match_condition, ings_info, ings_info_sizes,
			count_match_percent, sort, limit])
		else:
			pipeline.extend([matches, matches_size, match_condition, ings_info, ings_info_sizes,
			count_match_percent, sort, timesort, limit])
	elif search_type == 'by_tags':
		matches, matches_size, match_condition = get_tags_pipeline(searched_items)
		sort = {'$sort': { 'matches_size': -1 }}
		if not timesort:
			pipeline.extend([matches, matches_size, match_condition, sort, limit])
		else:
			pipeline.extend([matches, matches_size, match_condition, sort, timesort, limit])
	elif search_type == 'by_name':
		match_condition = {'$match': {
					 		  'name': {
							  	  '$regex': u'(^' + searched_items + '| ' + searched_items + ')',
								  '$options': 'i'
							  }
		      			  }}
		if not timesort:
			pipeline.extend([match_condition, limit])
		else:
			pipeline.extend([match_condition, timesort, limit])
	return pipeline

@recipes_bp.route('/recipe_list/<string:search_type>/<string:args>/<string:sort_conditions>/', methods=['GET'])
def read_recipe_list(search_type, args, sort_conditions):
	if request.method == 'GET':
		try:
			if args:
				LOG.info('search type: ' + search_type)
				LOG.info('args: ' + args)
				LOG.info('sort conditions: ' + sort_conditions)
				if search_type != 'by_name':
					searched_items = args.split('&')
					searched_items = [ObjectId(item) for item in searched_items]
				else:
					searched_items = args
				sort_conditions = sort_conditions.split('&')
				data = mongo.db.recipes.aggregate(get_pipeline(search_type, searched_items, sort_conditions))
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
						ObjectId(ingredient) for ingredient in recipe_has_but_ingredient_list_doesnt
						if len(ingredient) > 0
					]
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
