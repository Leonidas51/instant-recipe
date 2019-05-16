import os
from datetime import timedelta


class Config(object):
    """Parent configuration class."""
    DEBUG = False
    CSRF_ENABLED = True
    SECRET_KEY = os.getenv('SECRET_KEY')
    MONGO_URI = os.getenv('DB')
    SESSION_TYPE = 'mongodb'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    UPLOAD_FOLDER = 'instantrecipe/frontend/src/images'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 Mb max


class DevelopmentConfig(Config):
    """Configurations for Development."""
    DEBUG = True
    FLASK_ENV = 'development'
    FLASK_DEBUG = True


class TestingConfig(Config):
    """Configurations for Testing, with a separate test database."""
    TESTING = True
    DEBUG = True
    FLASK_ENV = 'development'
    FLASK_DEBUG = True


class ProductionConfig(Config):
    """Configurations for Production."""
    DEBUG = False
    TESTING = False
    FLASK_ENV = 'production'
    FLASK_DEBUG = False


app_config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
}
