import os
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint
from instantrecipe import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
	__name__, filename=os.path.join(ROOT_PATH, 'output.log'))
recipes_bp = Blueprint('recipe', __name__)


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

# sort_type = ['difficulty, 'time', 'full-match']
def get_pipeline(ingredients_list, sort_conditions=[]):
	pipeline = [
		{'$match': {'published': True}},
		# находим количество совпадений ингредиентов
		{'$addFields': {
			'matches_num': {
				'$size': {'$setIntersection': ['$ingredient_ids', ingredients_list]}
			},
		}},
		# число совпадений с введенными ингредиентами
		{'$match': {'matches_num': {'$gt': 0}}},
		# выясняем дополнительные подробности
		{'$addFields': {
			'ingredient_list_has_but_recipe_doesnt': {
				'$size': {'$setDifference': [ingredients_list, '$ingredient_ids']}
			},
			'recipe_has_but_ingredient_list_doesnt': {
				'$size': {'$setDifference': ['$ingredient_ids', ingredients_list]}
			},
		}}
	]
	count_match_percent = count_match_percent = {'$addFields': {'matches_percent': {'$trunc': {
								'$multiply': [{'$divide': [
									'$matches_num', {'$size': '$ingredient_ids'}
								]}, 100]
							}}}}
	# присутствие всех ингредиентов из поиска не обязательно
	# от наименьшего расхождения со списком ингредиентов до наибольшего
	sort = {'$sort': {
				'recipe_has_but_ingredient_list_doesnt': 1,
				'ingredient_list_has_but_recipe_doesnt': 1
			}}
	if 'full-match' in sort_conditions:
		count_match_percent = {'$addFields': {'matches_percent': {'$trunc': {
									'$multiply': [{'$divide': ['$matches_num', {'$size': {
										'$setUnion': ['$ingredient_ids', ingredients_list]
									}}]}, 100]
								}}}}
		# выдача от наибольшего совпадения до наименьшего
		# от наименьшего расхождения со списком ингредиентов до наибольшего
		sort = {'$sort': {
					'matches_num': -1,
					'recipe_has_but_ingredient_list_doesnt': 1,
					'ingredient_list_has_but_recipe_doesnt': 1
				}}

	pipeline.extend([count_match_percent, sort])
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