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
    UPLOAD_FOLDER = 'instantrecipe/frontend/src/images'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 Mb max

    # mail settings
    MAIL_SERVER = 'smtp.yandex.ru'
    MAIL_PORT = 587
    MAIL_USE_TLS = True

    # authentication
    MAIL_USERNAME = os.getenv('APP_MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('APP_MAIL_PASSWORD')

    # mail accounts
    MAIL_DEFAULT_SENDER = MAIL_USERNAME + '@yandex.ru'


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
