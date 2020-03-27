import os
import re
import json
from shutil import copyfile
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, current_app, session
from werkzeug.utils import secure_filename
from instantrecipe import mongo
from instantrecipe.auth import User, login_required, \
    confirm_required, admin_required
import logger


SERVER_ERROR_TEXT = 'Произошла ошибка сервера. \
    Пожалуйста, попробуйте позже.'
ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
recipes_bp = Blueprint('recipe', __name__)


@recipes_bp.route('/recipe/update/', methods=['GET'])
def update_recipe(recipe_id):
    if request.method == 'GET':
        try:
            data = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
            if data is None:
                return jsonify(data='Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_recipe: ' + str(e))
            return jsonify(data='Nothing was found!'), 204


@recipes_bp.route('/recipe/<recipe_id>/', methods=['GET'])
def read_recipe(recipe_id):
    if request.method == 'GET':
        try:
            if not ObjectId.is_valid(recipe_id):
                return jsonify(data='Nothing was found!'), 204
            data = mongo.db.recipes.find_one({
                u'_id': ObjectId(recipe_id),
                u'published': True
            })
            if data is None:
                return jsonify(data='Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_recipe: ' + str(e))
            return jsonify(data='Nothing was found!'), 204


@recipes_bp.route('/recipe/user_data/<recipe_id>/', methods=['GET'])
def read_recipe_user_data(recipe_id):
    if request.method != 'GET':
        return
    try:
        recipe = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
        is_favorite = False
        is_liked = False
        recipe_rating = len(recipe['liked_by'])
        if 'user' in session:
            user = session['user'].get()
            favorite_recipes = user['favorite_recipes']
            liked = user['liked_recipes']

            if recipe_id in favorite_recipes:
                is_favorite = True
            if recipe_id in liked:
                is_liked = True
        return jsonify(favorite=is_favorite, liked=is_liked,
                       rating=recipe_rating), 200
    except Exception as e:
        LOG.error('error while trying to read_recipe_user_data: ' + str(e))
        return jsonify(error=SERVER_ERROR_TEXT), 500


@recipes_bp.route('/recipe_all/<recipe_id>/', methods=['GET'])
@admin_required
def read_recipe_add(recipe_id):
    # то же что и read_recipe но включая {'published': False}
    if request.method == 'GET':
        try:
            data = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
            if not len(data):
                return jsonify(data='Nothing was found!'), 204
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_recipe: ' + str(e))
            return jsonify(data='Nothing was found!'), 204


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
    limit = {'$limit': 100}

    if search_type == 'by_ings':
        ings_info = {}
        ings_info_sizes = {}
        count_match_percent = {}
        matches, matches_size, match_condition, ings_info, ings_info_sizes = \
            get_ingredients_pipeline(searched_items)
        if 'full-match' in sort_conditions:
            count_match_percent = {'$addFields': {
                'matches_percent': {'$trunc': {
                    '$multiply': [{'$divide': ['$matches_size', {
                        '$size': {
                            '$setUnion': ['$ingredient_ids', searched_items]
                        }
                    }]}, 100]
                }}
            }}
            # выдача от наибольшего совпадения до наименьшего
            # от наименьшего расхождения со списком ингредиентов до наибольшего
            sort = {'$sort': {
                'matches_size': -1,
                'recipe_has_but_ingredient_list_doesnt_size': 1,
                'ingredient_list_has_but_recipe_doesnt_size': 1
            }}
        else:
            count_match_percent = {'$addFields': {
                'matches_percent': {'$trunc': {
                    '$multiply': [{'$divide': [
                        '$matches_size', {'$size': '$ingredient_ids'}
                    ]}, 100]
                }}
            }}
            # присутствие всех ингредиентов из поиска не обязательно
            # от наименьшего расхождения со списком ингредиентов до наибольшего
            sort = {'$sort': {
                'recipe_has_but_ingredient_list_doesnt_size': 1,
                'ingredient_list_has_but_recipe_doesnt_size': 1
            }}
        if not timesort:
            pipeline.extend([matches, matches_size, match_condition, ings_info,
                            ings_info_sizes, count_match_percent, sort, limit])
        else:
            pipeline.extend([matches, matches_size, match_condition, ings_info,
                            ings_info_sizes, count_match_percent, sort,
                            timesort, limit])
    elif search_type == 'by_tags':
        matches, matches_size, match_condition = \
            get_tags_pipeline(searched_items)
        sort = {'$sort': {'matches_size': -1}}
        if not timesort:
            pipeline.extend([matches, matches_size, match_condition, sort,
                            limit])
        else:
            pipeline.extend([matches, matches_size, match_condition, sort,
                            timesort, limit])
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


@recipes_bp.route((
    '/recipe_list/<string:search_type>/<string:args>/<string:sort_conditions>/'
), methods=['GET'])
def read_recipe_list(search_type, args, sort_conditions):
    if request.method == 'GET':
        try:
            if args:
                if sort_conditions is None:
                    return jsonify(data='Nothing was found!'), 204
                if search_type != 'by_name':
                    searched_items = args.split('&')
                    searched_items = [
                        ObjectId(item) for item in searched_items
                    ]
                else:
                    searched_items = args
                sort_conditions = sort_conditions.split('&')
                pipeline = get_pipeline(
                    search_type, searched_items, sort_conditions)
                if pipeline is None:
                    return jsonify(data='Nothing was found!'), 204
                data = mongo.db.recipes.aggregate(pipeline)
                data = list(data)

                if not data:
                    return jsonify(data='Nothing was found!'), 204

                return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to read_recipe_list: ' + str(e))
            return jsonify(data='Nothing was found!'), 204


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
                        ObjectId(ingredient)
                        for ingredient in recipe_has_but_ingredient_list_doesnt
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
            return jsonify(data='Nothing was found!'), 204


@recipes_bp.route('/recipe/get_featured/', methods=['GET'])
def get_featured_recipes():
    if request.method == 'GET':
        try:
            data = mongo.db.recipes.find({'featured': True}).limit(2)
            data = [recipe for recipe in data]
            return jsonify(data), 200
        except Exception as e:
            LOG.error('error while trying to get_featured_recipes: ' + str(e))
            return jsonify(data='Nothing was found!'), 204


def allowed_file(filename):
    ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_recipe_photo(file, recipe_id=None):
    if file.filename == '':
        return 'Файл не был прикреплён'

    if not allowed_file(file.filename):
        return 'Формат фото не соответствует требованиям'

    if recipe_id:
        if not ObjectId.is_valid(recipe_id):
            return 'Рецепт не найден'

        if mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)}) is None:
            return 'Рецепт не найден'

    return ''


def save_recipe_photo(file, recipe_id, recipe_published):
    save_directory = os.path.join(
        current_app.config['PHOTOS_UPLOAD_FOLDER'], str(recipe_id))

    if not os.path.exists(save_directory):
        os.makedirs(save_directory)
        filename = '1.jpg'
    else:
        count = 1
        while True:
            if os.path.isfile(
                    os.path.join(save_directory, str(count) + '.jpg')):
                count += 1
            else:
                filename = str(count) + '.jpg'
                break

    upload = {}
    upload['uploader_id'] = session.get('user').get()['_id']
    upload['uploader_name'] = session.get('user').get()['name']
    upload['recipe_id'] = recipe_id
    upload['recipe_name'] = mongo.db.recipes.find_one({
        u'_id': ObjectId(recipe_id)
    }).get('name')
    upload['recipe_published'] = recipe_published
    upload['published'] = False
    upload['path'] = filename

    mongo.db.upload_images.insert_one(upload)
    path = os.path.join(save_directory, filename)
    file.save(path)


@recipes_bp.route('/recipe/upload_photo/<string:recipe_id>', methods=['POST'])
@login_required
@confirm_required
def upload_recipe_photo(recipe_id):
    if request.method == 'POST':
        try:
            if 'photo' not in request.files:
                return jsonify(error='Ошибка: файл не был прикреплён'), 400
            file = request.files['photo']

            photo_error = validate_recipe_photo(file, recipe_id)
            if len(photo_error):
                return jsonify(error=photo_error), 400

            save_recipe_photo(file, recipe_id, True)

            return jsonify(data='success!'), 200
        except Exception as e:
            LOG.error('error while trying to upload_recipe_photo: ' + str(e))
            return jsonify(error=SERVER_ERROR_TEXT), 500


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


def parse_instructions(steps):
    steps = steps.split(',')
    for i, step in enumerate(steps):
        steps[i] = str(i+1) + '. ' + step

    return ('\n').join(steps)


@recipes_bp.route('/recipe/suggest', methods=['POST'])
@login_required
@confirm_required
def suggest_recipe():
    if request.method == 'POST':
        try:
            data = request.form.to_dict()
            recipe = {}

            if not data['recipe_name']:
                return jsonify(error='Укажите название рецепта'), 400

            if not data['cooking_time_min'] or not data['cooking_time_max']:
                return jsonify(error='Укажите время приготовления'), 400

            if int(data['cooking_time_min']) < 1 or \
                    int(data['cooking_time_max']) < 1:
                return jsonify(error='Укажите валидное время'), 400

            if not data['serves']:
                return jsonify(error='Укажите число порций'), 400

            if int(data['serves']) < 1:
                return jsonify(error='Укажите валидное число порций'), 400

            if 'photo' in request.files:
                img_error = validate_recipe_photo(request.files['photo'])

                if len(img_error):
                    return jsonify(error=img_error), 400

            ings = json.loads(data['ings'])
            opt_ings = json.loads(data['opt_ings'])

            if not len(ings):
                return jsonify(error='Укажите ингредиенты'), 400

            recipe['name'] = data['recipe_name'].strip()
            recipe['cooking_time_min'] = int(data['cooking_time_min'])
            recipe['cooking_time_max'] = int(data['cooking_time_max'])
            recipe['cooking_time'] = parse_interval(
                int(data['cooking_time_min']), int(data['cooking_time_max']))
            recipe['difficulty'] = int(data['difficulty'])
            recipe['serves'] = int(data['serves'])
            recipe['ingredient_ids'] = []
            # legacy ings format
            recipe['ingredient_names'] = {'mandatory': {}, 'optional': {}}

            for ing in ings:
                recipe['ingredient_ids'].append(ing['id'])
                recipe['ingredient_names']['mandatory'][ing['name']] = \
                    ing['amount']

            for ing in opt_ings:
                recipe['ingredient_names']['optional'][ing['name']] = \
                    ing['amount']

            # new ings format
            recipe['ings_mandatory'] = ings
            recipe['ings_optional'] = opt_ings

            recipe['instructions_source'] = data['steps']

            recipe['tag_ids'] = []
            recipe['tag_names'] = []
            recipe['author'] = session['user'].get()['name']
            recipe['author_id'] = session['user'].get_id()
            recipe['published'] = False
            recipe['featured'] = False
            recipe['pending'] = True

            recipe_id = mongo.db.recipes.insert_one(recipe).inserted_id

            if 'photo' in request.files:
                save_recipe_photo(request.files['photo'], recipe_id, False)

            return jsonify(data='success!'), 200
        except Exception as e:
            LOG.error('error wli trying to suggest_recipe: ' + str(e))
            return jsonify(error=SERVER_ERROR_TEXT), 500


@recipes_bp.route('/recipe/add_to_favorites/<string:recipe_id>',
                  methods=['GET'])
@login_required
def add_to_favorites(recipe_id):
    if request.method != 'GET':
        return

    try:
        data = {}
        user = session['user']
        data['favorite_recipes'] = user.get()['favorite_recipes']
        data['favorite_recipes'].append(recipe_id)
        user.update(data)
        user.set_from_db_by_email(user.get()['email'])

        return jsonify(data='success!'), 200
    except Exception as e:
        LOG.error('error while trying to add_to_favorites: ' + str(e))
        return jsonify(error=SERVER_ERROR_TEXT), 500


@recipes_bp.route('/recipe/remove_from_favorites/<string:recipe_id>',
                  methods=['GET'])
@login_required
def remove_from_favorites(recipe_id):
    if request.method != 'GET':
        return

    try:
        data = {}
        user = session['user']
        data['favorite_recipes'] = user.get()['favorite_recipes']
        if recipe_id in data['favorite_recipes']:
            data['favorite_recipes'].remove(recipe_id)
            user.update(data)
            user.set_from_db_by_email(user.get()['email'])

        return jsonify(data='success!'), 200
    except Exception as e:
        LOG.error('error while trying to remove_from_favorites: ' + str(e))
        return jsonify(error=SERVER_ERROR_TEXT), 500


@recipes_bp.route('/recipe/add_to_liked/<string:recipe_id>', methods=['GET'])
@login_required
def add_to_liked(recipe_id):
    if request.method != 'GET':
        return

    try:
        data = {}
        user = session['user']
        user_id = user.get_id()
        data['liked_recipes'] = user.get()['liked_recipes']
        data['liked_recipes'].append(recipe_id)
        user.update(data)
        user.set_from_db_by_email(user.get()['email'])

        recipe = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
        if user_id not in recipe['liked_by']:
            recipe['liked_by'].append(user_id)
            mongo.db.recipes.update_one(
                {u'_id': recipe['_id']},
                {u'$set': {u'liked_by': recipe['liked_by']}}
            )

        return jsonify(data='success!'), 200
    except Exception as e:
        LOG.error('error while trying to add_to_liked: ' + str(e))
        return jsonify(error=SERVER_ERROR_TEXT), 500


@recipes_bp.route('/recipe/remove_from_liked/<string:recipe_id>',
                  methods=['GET'])
@login_required
def remove_from_liked(recipe_id):
    if request.method != 'GET':
        return

    try:
        data = {}
        user = session['user']
        user_id = user.get_id()
        data['liked_recipes'] = user.get()['liked_recipes']
        if recipe_id in data['liked_recipes']:
            data['liked_recipes'].remove(recipe_id)
            user.update(data)
            user.set_from_db_by_email(user.get()['email'])

        recipe = mongo.db.recipes.find_one({u'_id': ObjectId(recipe_id)})
        if user_id in recipe['liked_by']:
            recipe['liked_by'].remove(user_id)
            mongo.db.recipes.update_one(
                {u'_id': recipe['_id']},
                {u'$set': {u'liked_by': recipe['liked_by']}}
            )

        return jsonify(data='success!'), 200
    except Exception as e:
        LOG.error('error while trying to remove_from_liked: ' + str(e))
        return jsonify(error=SERVER_ERROR_TEXT), 500
