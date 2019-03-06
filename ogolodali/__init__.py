import os
import json
import datetime
from bson.objectid import ObjectId
from flask import Flask, render_template
from flask_pymongo import PyMongo
import logger

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

def create_app(test_config=None):
    LOG.info('running environment: %s', os.environ.get('ENV'))

    app = Flask(__name__, static_folder='frontend/dist', template_folder='frontend/public/templates')

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['MONGO_URI'] = os.environ.get('DB')

    if test_config:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    mongo.init_app(app)
    app.json_encoder = JSONEncoder

    from .views import index, errors
    app.register_blueprint(index.index_bp)
    app.add_url_rule('/', endpoint='index')
    app.register_error_handler(404, errors.page_not_found)

    from .controllers import tips, recipes
    app.register_blueprint(tips.tips_bp)
    app.add_url_rule('/tip', endpoint='tip')
    app.register_blueprint(recipes.recipes_bp)
    app.add_url_rule('/recipe', endpoint='recipe')

    return app
