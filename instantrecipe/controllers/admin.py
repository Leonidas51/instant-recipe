import os
import logger
import json
import shutil
from PIL import Image
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, current_app
from instantrecipe.auth import User, admin_required
from instantrecipe import mongo

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
	__name__, filename=os.path.join(ROOT_PATH, 'output.log'))
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/get_admin_page_data', methods=['GET'])
@admin_required
def get_admin_page_data():
	if request.method == 'GET':
		try:
			data = {}
			data['pending_images'] = mongo.db.upload_images.count({u'published': False, u'recipe_published': True})
			data['pending_recipes'] = mongo.db.recipes.count({u'pending': True})
			return jsonify(data = data)
		except Exception as e:
			LOG.error('error while trying to get_admin_page_data: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

@admin_bp.route('/admin/suggested_images', methods=['GET'])
@admin_required
def get_suggested_images():
	if request.method == 'GET':
		try:
			uploads = []
			for upload in mongo.db.upload_images.find({u'published': False, u'recipe_published': True}):
				uploads.append(upload)
			return jsonify(uploads = uploads)
		except Exception as e:
			LOG.error('error while trying to get_suggested_images: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

@admin_bp.route('/admin/reject_image', methods=['POST'])
@admin_required
def reject_image():
	if request.method == 'POST':
		try:
			image = mongo.db.upload_images.find_one({u'_id': ObjectId(request.json.get('image_id'))})
			image_directory = os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], image['recipe_id'])
			os.remove(os.path.join(image_directory, image['path']))
			if not (os.listdir(image_directory)):
				os.rmdir(image_directory)

			mongo.db.upload_images.remove({u"_id": image['_id']})
			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to reject_image: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

@admin_bp.route('/admin/accept_image', methods=['POST'])
@admin_required
def accept_image():
	if request.method == 'POST':
		try:
			image = mongo.db.upload_images.find_one({u'_id': ObjectId(request.json.get('image_id'))})
			image_directory = os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], image['recipe_id'])
			save_directory = os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], image['recipe_id'])

			if not os.path.exists(save_directory):
				os.makedirs(save_directory)
				filename = 'main.jpg'
			else:
				count = 1
				while True:
					if os.path.isfile(os.path.join(save_directory, str(count) + '.jpg')):
						count += 1
					else:
						filename = str(count) + '.jpg'
						break
			
			os.rename(os.path.join(image_directory, image['path']), os.path.join(save_directory, filename))
			make_thumbnail(os.path.join(save_directory, filename))
			mongo.db.upload_images.update_one(
				{u'_id': ObjectId(request.json.get('image_id'))},
				{u'$set': {'published': True}}
			)
			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to accept_image: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500
			
def make_thumbnail(path):
	try:
		save_path = os.path.split(path)
		size = 250, 200
		im = Image.open(path)
		im.thumbnail(size)
		im.save(os.path.join(save_path[0], 'thumbnail.jpg'), format='JPEG')
	except Exception as e:
		LOG.error('error while trying to make_thumbnail: ' + str(e))

@admin_bp.route('/admin/get_suggested_recipes', methods=['GET'])
@admin_required
def get_suggested_recipes():
	if request.method == 'GET':
		try:
			recipes = []
			for recipe in mongo.db.recipes.find({u'pending': True}):
				recipes.append(recipe)
			return jsonify(recipes = recipes)
		except Exception as e:
			LOG.error('error while trying to get_suggested_recipes: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

@admin_bp.route('/admin/publish_recipe', methods=['POST'])
@admin_required
def publish_recipe():
	if request.method == 'POST':
		try:
			recipe_id = request.json.get('recipe_id')
			mongo.db.recipes.update_one(
				{u'_id': ObjectId(recipe_id)},
				{u'$set': {u'published' : True, u'pending': False}}
			)

			if os.path.isfile(os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id, '1.jpg')):
				image_path = os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id, '1.jpg')
				save_path = os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], recipe_id, 'main.jpg')
				os.makedirs(os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], recipe_id))
				os.rename(image_path, save_path)
				make_thumbnail(save_path)
				mongo.db.upload_images.update_one(
					{u'recipe_id': ObjectId(recipe_id)},
					{u'$set': {u'published': True, u'recipe_published' : True}}
				)

			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to publish_recipe: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

@admin_bp.route('/admin/delete_recipe', methods=['POST'])
@admin_required
def delete_recipe():
	if request.method == 'POST':
		try:
			recipe_id = request.json.get('recipe_id')
			mongo.db.recipes.remove({u'_id': ObjectId(recipe_id)})

			if os.path.isdir(os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id)):
				shutil.rmtree(os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id))
				mongo.db.upload_images.remove({u'recipe_id': ObjectId(recipe_id)})

			if os.path.isdir(os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], recipe_id)):
				shutil.rmtree(os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], recipe_id))
				mongo.db.upload_images.remove({u'recipe_id': ObjectId(recipe_id)})
			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to delete_recipe: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

@admin_bp.route('/admin/delete_image', methods=['POST'])
@admin_required
def delete_image():
	if request.method == 'POST':
		try:
			recipe_id = request.json.get('recipe_id')

			if os.path.isdir(os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id)):
				shutil.rmtree(os.path.join(current_app.config['PHOTOS_UPLOAD_FOLDER'], recipe_id))
				mongo.db.upload_images.remove({u'recipe_id': recipe_id})

			if os.path.isdir(os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], recipe_id)):
				shutil.rmtree(os.path.join(current_app.config['PHOTOS_DIST_FOLDER'], recipe_id))
				mongo.db.upload_images.remove({u'recipe_id': recipe_id})
			
			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to delete_image: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500

def parse_time(time):
	hours = 0
	minutes = 0
	result = ''

	while(time >= 60):
		hours += 1
		time -= 60
	
	minutes = time
	
	if hours > 0:
		result += str(hours) + ' ч.'
	if minutes > 0:
		result += ' ' + str(minutes) + ' мин.'
	
	return result.strip()

def parse_interval(min, max):
	if min == max:
		return parse_time(min)

	return parse_time(min) + ' — ' + parse_time(max)

@admin_bp.route('/admin/edit_recipe', methods=['POST'])
@admin_required
def edit_recipe():
	if request.method == 'POST':
		try:
			data = request.form.to_dict()
			recipe = {}

			if not data['recipe_name']:
				return jsonify(error = 'Укажите название рецепта'), 400

			if not data['cooking_time_min'] or not data['cooking_time_max']:
				return jsonify(error = 'Укажите время приготовления'), 400

			if int(data['cooking_time_min']) < 1 or int(data['cooking_time_max']) < 1:
				return jsonify(error = 'Укажите валидное время'), 400

			if not data['serves']:
				return jsonify(error = 'Укажите число порций'), 400

			if int(data['serves']) < 1:
				return jsonify(error = 'Укажите валидное число порций'), 400

			ings = json.loads(data['ings'])
			opt_ings = json.loads(data['opt_ings'])
			tags = json.loads(data['tags'])

			if not len(ings):
				return jsonify(error = 'Укажите ингредиенты'), 400

			recipe['name'] = data['recipe_name'].strip()
			recipe['cooking_time_min'] = int(data['cooking_time_min'])
			recipe['cooking_time_max'] = int(data['cooking_time_max'])
			recipe['cooking_time'] = parse_interval(int(data['cooking_time_min']), int(data['cooking_time_max']))
			recipe['difficulty'] = int(data['difficulty'])
			recipe['serves'] = int(data['serves'])

			#legacy ings
			recipe['ingredient_names'] = {'mandatory': {}, 'optional': {}}
			recipe['ingredient_ids'] = []

			for ing in ings:
				recipe['ingredient_ids'].append(ing['id'])
				recipe['ingredient_names']['mandatory'][ing['name']] = ing['amount']

			for ing in opt_ings:
				recipe['ingredient_names']['optional'][ing['name']] = ing['amount']

			#new ings
			recipe['ings_mandatory'] = ings
			recipe['ings_optional'] = opt_ings

			#legacy tags
			recipe['tag_ids'] = []
			recipe['tag_names'] = []
			for tag in tags:
				recipe['tag_ids'].append(tag['id'])
				recipe['tag_names'].append(tag['name'])

			#new tags
			recipe['tags'] = tags

			recipe['instructions_source'] = data['steps']
			recipe['featured'] = (data['featured'] == 'true')
			recipe['published'] = (data['published'] == 'true')
			
			mongo.db.recipes.update_one(
				{u'_id': ObjectId(data['recipe_id'])},
				{u'$set': recipe}
			)
			return jsonify(data = 'success!'), 200
		except Exception as e:
			LOG.error('error while trying to edit_recipe: ' + str(e))
			return jsonify(error = 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'), 500
