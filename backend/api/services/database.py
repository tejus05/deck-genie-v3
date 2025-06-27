from contextlib import contextmanager
import os
from sqlalchemy import create_engine
from sqlmodel import Session

# Use APP_DATA_DIRECTORY if set, otherwise use ./data as default
data_directory = os.getenv("APP_DATA_DIRECTORY", "./data")
sql_url = "sqlite:///" + os.path.join(data_directory, "fastapi.db")
sql_engine = create_engine(sql_url, connect_args={"check_same_thread": False})


@contextmanager
def get_sql_session():
    session = Session(sql_engine)
    try:
        yield session
    finally:
        session.close()
