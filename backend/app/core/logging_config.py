import logging
import sys
import os
from logging.handlers import TimedRotatingFileHandler

LOG_FILE = "app/cache/app.log"
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

FORMATTER = logging.Formatter("%(asctime)s - %(filename)s - %(message)s")

def get_console_handler():
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(FORMATTER)
    return console_handler

def get_file_handler():
    file_handler = TimedRotatingFileHandler(LOG_FILE, when='midnight')
    file_handler.setFormatter(FORMATTER)
    return file_handler

def get_logger(logger_name="my_app"):
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:  # ensure we don't add multiple handlers
        logger.addHandler(get_console_handler())
        logger.addHandler(get_file_handler())

    logger.propagate = False
    return logger
