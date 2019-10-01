import os
import re
from PIL import Image
from shutil import copyfile
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
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
	# находим массив совпадений
	matches = {'$addFields': {
		'matches': {
			'$setIntersection': ['$ingredient_ids', searched_items]
		},
	}}
	# находим количество совпадений
	matches_size = {'$addFields': {
		'matches_size': {'$size': '$matches'},
	}}
	# число совпадений с введенными данными
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

def get_tags_pipeline(searched_items):
	# находим массив совпадений
	matches = {'$addFields': {
		'matches': {
			'$setIntersection': ['$tag_ids', searched_items]
		},
	}}
	# находим количество совпадений
	matches_size = {'$addFields': {
		'matches_size': {'$size': '$matches'},
	}}
	# число совпадений с введенными данными
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
		searched_items = searched_items.lower()
		match = re.match('^[ёа-я0-9 ]+$', searched_items)
		if match is None:
			return None
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
				if sort_conditions is None:
					return jsonify(data = 'Nothing was found!'), 204
				if search_type != 'by_name':
					searched_items = args.split('&')
					searched_items = [ObjectId(item) for item in searched_items]
				else:
					searched_items = args
				sort_conditions = sort_conditions.split('&')
				pipeline = get_pipeline(search_type, searched_items, sort_conditions)
				if pipeline is None:
					return jsonify(data = 'Nothing was found!'), 204
				data = mongo.db.recipes.aggregate(pipeline)
				data = list(data)

				if not data:
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

@recipes_bp.route('/recipe/get_featured/', methods=['GET'])
def get_featured_recipes():
	if request.method == 'GET':
		try:
			data = mongo.db.recipes.find({'featured': True}).limit(2)
			data = [recipe for recipe in data]
			return jsonify(data), 200
		except Exception as e:
			LOG.error('error while trying to get_featured_recipes: ' + str(e))
			return jsonify(data = 'Nothing was found!'), 204

def make_thumbnail(path):
	try:
		file, ext = os.path.splitext(path)
		size = 250, 200
		im = Image.open(path)
		im.thumbnail(size)
		im.save(file + '.jpg', format='JPEG')
	except Exception as e:
		LOG.error('error while trying to make_thumbnail: ' + str(e))

def allowed_file(filename):
	ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@recipes_bp.route('/recipe/upload_photo/<string:recipe_id>', methods=['POST'])
def upload_recipe_photo(recipe_id):
	if request.method == 'POST':
		try:
			if 'photo' not in request.files:
				return jsonify(error = 'Ошибка: файл не был прикреплён'), 400
			file = request.files['photo']

			if file.filename == '':
				return jsonify(error = 'Ошибка: файл не был прикреплён'), 400
			
			if not ObjectId.is_valid(recipe_id):
				return jsonify(error = 'Рецепт не найден'), 400

			if mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)}) == None:
				return jsonify(error = 'Рецепт не найден'), 400
			
			if not allowed_file(file.filename):
				return jsonify(error = 'Формат не соответствует требованиям'), 400

			if file and allowed_file(file.filename):
				filename = secure_filename(file.filename)
			save_directory = os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id)
			if not os.path.exists(save_directory):
				os.makedirs(save_directory)

			main_path = os.path.join(save_directory, 'main.jpg')
			thumb_path = os.path.join(save_directory, 'thumbnail.jpg')

			file.save(main_path)
			copyfile(main_path, thumb_path)
			make_thumbnail(thumb_path)

			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to upload_recipe_photo: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500
