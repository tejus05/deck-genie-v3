from contextlib import contextmanager
import os
from sqlalchemy import create_engine
from sqlmodel import Session
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../../.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

sql_engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=300,
)

@contextmanager
def get_sql_session():
    session = Session(sql_engine)
    try:
        yield session
    finally:
        session.close()
