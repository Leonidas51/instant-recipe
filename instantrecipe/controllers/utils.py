import os
from bson.objectid import ObjectId
from flask import request, jsonify, Blueprint, session
from instantrecipe import mongo
import logger
from flask_wtf.csrf import generate_csrf
from instantrecipe.auth import User, admin_required


ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))
utils_bp = Blueprint('utils', __name__)

"""
@utils_bp.route('/utils/csrf/', methods=['GET'])
def request_CSRF_token():
    if request.method == 'GET':
        try:
            return jsonify({'csrftoken': generate_csrf()}), 200
        except Exception as e:
            LOG.error('error while trying to request_CSRF_token: ' + str(e))
            return jsonify(data = str(e)), 200

def filter_brackets(instructions):
  match_square_and_round_brackets =
      re.compile('\[[»ЁёА-я0-9 »]+\]\([A-z0-9 \/]+\)')
  match_square_brackets =
      re.compile('\[[»ЁёА-я »]+\]\[[A-z0-9 \/]+\]')

  def replace_square(match):
    ind = match.group().find('][')
    return match.group()[1:ind]
  def replace_round(match):
    ind = match.group().find('](')
    return match.group()[1:ind]

  instructions = match_square_and_round_brackets.sub(
      replace_round, instructions)
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
"""


@utils_bp.route('/remove_salt/', methods=['GET'])
@admin_required
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
            new_ingredient_names.pop(salt, None)
            result = mongo.db.recipes.update_one(
              {'_id': recipe['_id']},
              {'$set': {'ingredient_names.mandatory': new_ingredient_names}})
    result = mongo.db.ingredients.delete_one({'_id': salt_id})

    return jsonify(data='removed salt'), 200


@utils_bp.route('/create_images_table/', methods=['GET'])
@admin_required
def create_images_table():
    try:
        mongo.db.create_collection('upload_images')
        return jsonify(result='success'), 200
    except Exception as e:
        LOG.error('error while trying to create_images_table: ' + str(e))


@utils_bp.route('/remove_unpublished/', methods=['GET'])
@admin_required
def remove_unpublished():
    try:
        mongo.db.recipes.remove({'published': False})
        return jsonify(result='success'), 200
    except Exception as e:
        LOG.error('error while trying to remove_unpublished: ' + str(e))


@utils_bp.route('/standartize_recipes_ings/', methods=['GET'])
@admin_required
def standartize_recipes_ings():
    try:
        recipes_with_skipped_ings = []
        for recipe in mongo.db.recipes.find({}):
            new_ings_mandatory = []
            new_ings_optional = []
            ings_mandatory = recipe['ingredient_names']['mandatory']
            ings_optional = recipe['ingredient_names']['optional']

            for ing in ings_mandatory.keys():
                new_ing = {}
                amount = ings_mandatory[ing]
                ing_id = mongo.db.ingredients.find_one({u'name': ing})
                if ing_id is None:
                    mongo.db.recipes.update_one(
                      {u'_id': recipe['_id']},
                      {u'$set': {u'published': False}}
                    )
                    continue
                new_ing['id'] = ObjectId(ing_id[u'_id'])
                new_ing['name'] = ing
                new_ing['amount'] = amount
                new_ings_mandatory.append(new_ing)

            for ing in ings_optional.keys():
                new_ing = {}
                amount = ings_optional[ing]
                new_ing['name'] = ing
                new_ing['amount'] = amount
                new_ings_optional.append(new_ing)

            mongo.db.recipes.update_one(
              {u'_id': recipe['_id']},
              {u'$set': {
                  u'ings_mandatory': new_ings_mandatory, 
                  u'ings_optional': new_ings_optional
              }}
            )
            return jsonify(result='success'), 200
    except Exception as e:
        LOG.error('error while trying to standartize_recipes_ings: ' + str(e))
        LOG.info(recipe['_id'])
        return jsonify(result='error'), 400


@utils_bp.route('/standartize_recipes_tags/', methods=['GET'])
@admin_required
def standartize_recipes_tags():
    try:
        for recipe in mongo.db.recipes.find({}):
            new_tags = []
            for tag_id in recipe['tag_ids']:
                tag_full = mongo.db.tags.find_one({u'_id': tag_id})
                new_tag = {}
                new_tag['id'] = ObjectId(tag_full['_id'])
                new_tag['name'] = tag_full['name']
                new_tags.append(new_tag)
            mongo.db.recipes.update_one(
                {u'_id': recipe['_id']},
                {u'$set': {u'tags': new_tags}}
            )
        return jsonify(result='success'), 200
    except Exception as e:
        LOG.error('error while trying to standartize_recipes_tags: ' + str(e))
        LOG.info(recipe['_id'])
        return jsonify(result='error'), 400
