import os
from flask import render_template
import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
LOG = logger.get_root_logger(
    __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


def page_not_found(error):
    LOG.error(error)
    return render_template('errors/404.html')
