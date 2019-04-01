import os


class Config(object):
    """Parent configuration class."""
    DEBUG = False
    CSRF_ENABLED = True
    SECRET = os.getenv('SECRET_KEY')
    MONGO_URI = os.getenv('DB')


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
