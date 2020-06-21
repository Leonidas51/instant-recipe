import os
from flask import redirect
from ..utils import logger

ROOT_PATH = os.environ.get('ROOT_PATH')
if ROOT_PATH is not None:
    LOG = logger.get_root_logger(
        __name__, filename=os.path.join(ROOT_PATH, 'output.log'))


def page_not_found(error):
    LOG.error(error)
    return redirect('404', code=404)
