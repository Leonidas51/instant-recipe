import os
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint
from ogolodali import mongo
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
	__name__, filename=os.path.join(ROOT_PATH, 'output.log'))
recipes_bp = Blueprint('recipe', __name__)


@recipes_bp.route('/recipe/<recipe_id>/', methods=['GET'])
def read_recipe(recipe_id):
	data = mongo.db.recipes.find_one({u'numeric_id': int(recipe_id)})
	if data == None:
		return jsonify(data = 'Nothing was found!'), 204
	return jsonify(data), 200

@recipes_bp.route('/recipe_list/<string:ingredients_list>/', methods=['GET'])
def read_recipe_list(ingredients_list):
	# картофель, морковь, лук
	ingredients_list = ['ObjectId("4f6d5ab72c607d9762000002")',
				'ObjectId("4f6d5ab72c607d9762000004")',
				'ObjectId("4f6d5ab72c607d9762000019")']
	ingredients_list = [ObjectId(ingredient[10:-2]) for ingredient in ingredients_list]
	data = mongo.db.recipes.aggregate([
		{'$match': {'published': True}},
		{'$project': {
			'author': True,
			'cooking_time': True,
			'cooking_time_max': True,
			'cooking_time_min': True,
			'difficulty': True,
			'includes_wrong_ingredients': True,
			'ingredient_ids': True,
			'ingredient_names': True,
			'link': True,
			'list_ids': True,
			'name': True,
			'name_translit': True,
			'numeric_id': True,
			'published': True,
			'serves': True,
			'tag_ids': True,
			'tag_names': True,
			'wrong_ingredients': True,
			'matches_num': {
				'$size': {
					'$setIntersection': ['$ingredient_ids', ingredients_list]
				}
			},
			'ingredient_list_has_but_recipe_doesnt': {
				'$size': {
					'$setDifference': [ingredients_list, '$ingredient_ids']
				}
			},
			'recipe_has_but_ingredient_list_doesnt': {
				'$size': {
					'$setDifference': ['$ingredient_ids', ingredients_list]
				}
			}
		}},
		# число совпадений с введенными ингредиентами
		{'$match': {'matches_num': {'$gt': 0}}},
		# выдача от наибольшего совпадения до наименьшего
		# от наименьшего расхождения со списком ингредиентов до наибольшего
		{'$sort': {
			'matches_num': -1,
			'recipe_has_but_ingredient_list_doesnt': 1,
			'ingredient_list_has_but_recipe_doesnt': 1
		}}
	])
	data = list(data)
	if data == None:
		return jsonify(data = 'Nothing was found!'), 204
	return jsonify(data), 200
