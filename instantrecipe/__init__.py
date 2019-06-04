import os
import json
import datetime
from bson.objectid import ObjectId
from flask import Flask, render_template
from flask_pymongo import PyMongo
from flask_wtf.csrf import CSRFProtect
from flask_session import Session
from flask_mail import Mail

import logger
from .instance.config import app_config

ROOT_PATH = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
os.environ.update({'ROOT_PATH': ROOT_PATH})
LOG = logger.get_root_logger(os.environ.get(
    'ROOT_LOGGER', 'root'), filename=os.path.join(ROOT_PATH, 'output.log'))


class JSONEncoder(json.JSONEncoder):
	''' extend json-encoder class'''

	def default(self, o):
		if isinstance(o, ObjectId):
			return str(o)
		if isinstance(o, datetime.datetime):
			return str(o)
		return json.JSONEncoder.default(self, o)

mongo = PyMongo()
mail = Mail()

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True, static_folder='frontend/dist', template_folder='frontend/dist')

    if test_config is None:
        app.config.from_object(app_config[os.getenv('APP_SETTINGS')])
        LOG.info('running environment: %s', os.environ.get('APP_SETTINGS'))
    else:
        app.config.from_object(app_config[test_config])
        # LOG.info('running environment: %s', test_config)

    mongo.init_app(app)
    app.json_encoder = JSONEncoder

    from .views import index, errors
    app.register_blueprint(index.index_bp)
    app.add_url_rule('/', endpoint='index')
    app.register_error_handler(404, errors.page_not_found)

    from .controllers import ingredients, recipes, tags, tips, users, utils
    api_prefix = '/api'
    app.register_blueprint(ingredients.ingredients_bp, url_prefix=api_prefix)
    app.register_blueprint(recipes.recipes_bp, url_prefix=api_prefix)
    app.register_blueprint(tags.tags_bp, url_prefix=api_prefix)
    app.register_blueprint(tips.tips_bp, url_prefix=api_prefix)
    app.register_blueprint(users.users_bp, url_prefix=api_prefix)
    app.register_blueprint(utils.utils_bp, url_prefix=api_prefix)

    csrf = CSRFProtect(app)
    Session(app)
    mail.init_app(app)

    return app
