import os
import json
import datetime
from bson.objectid import ObjectId
from flask import Flask
from flask_pymongo import PyMongo

class JSONEncoder(json.JSONEncoder):
	''' extend json-encoder class'''

	def default(self, o):
		if isinstance(o, ObjectId):
			return str(o)
		if isinstance(o, datetime.datetime):
			return str(o)
		return json.JSONEncoder.default(self, o)

ogolodali = Flask(__name__, static_folder='frontend/dist', template_folder='frontend/public/templates')

# add mongo url to flask config, so that flask_pymongo can use it to make connection
ogolodali.config['MONGO_URI'] = os.environ.get('DB')
mongo = PyMongo(ogolodali)

# use the modified encoder class to handle ObjectId & datetime object while jsonifying the response.
ogolodali.json_encoder = JSONEncoder

from ogolodali.controllers import *