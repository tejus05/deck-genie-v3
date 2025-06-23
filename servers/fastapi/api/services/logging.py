import os
from typing import Any
import logging
from logging import Logger


class LoggingService:

    def __init__(self, stream_name: str):
        self._logger = Logger(stream_name)

        log_file_path = os.path.join(os.getenv("APP_DATA_DIRECTORY"), "logs", "api.log")
        os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
        self._logger.addHandler(logging.FileHandler(log_file_path))

    @property
    def logger(self) -> Logger:
        return self._logger

    def message(self, msg: Any):
        return {"msg": msg}
