import os
from datetime import timedelta


class Config(object):
    """Parent configuration class."""
    DEBUG = False
    CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 60 * 60 * 24 * 365 # one year (count in seconds)
    SECRET_KEY = os.getenv('SECRET_KEY')
    CONFIRM_SALT = os.getenv('CONFIRM_SALT')
    RESTORE_SALT = os.getenv('RESTORE_SALT')
    MONGO_URI = os.getenv('DB')
    SESSION_TYPE = 'mongodb'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    PHOTOS_UPLOAD_FOLDER = 'instantrecipe/images/recipes/upload'
    PHOTOS_DIST_FOLDER = 'instantrecipe/images/recipes/dist'
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024 # 5 Mb max

    # mail settings
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True

class DevelopmentConfig(Config):
    """Configurations for Development."""
    DEBUG = True
    FLASK_ENV = 'development'
    FLASK_DEBUG = True

    MAIL_USERNAME = os.getenv('DEV_MAIL_USER')
    MAIL_PASSWORD = os.getenv('DEV_MAIL_PASSWORD')


class TestingConfig(Config):
    """Configurations for Testing, with a separate test database."""
    TESTING = True
    DEBUG = True
    FLASK_ENV = 'development'
    FLASK_DEBUG = True

    #Полин че это


class ProductionConfig(Config):
    """Configurations for Production."""
    DEBUG = False
    TESTING = False
    FLASK_ENV = 'production'
    FLASK_DEBUG = False

    #туточки почта на прод


app_config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
}
