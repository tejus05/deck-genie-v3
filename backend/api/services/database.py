from contextlib import contextmanager
import os
from sqlalchemy import create_engine
from sqlmodel import Session
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

print(f"Connecting to database: {DATABASE_URL.split('@')[0]}@[HIDDEN]")

# Create engine with PostgreSQL-specific settings
sql_engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,  # Enables pessimistic disconnect handling
    pool_recycle=300,  # Recycle connections every 5 minutes
)


@contextmanager
def get_sql_session():
    session = Session(sql_engine)
    try:
        yield session
    finally:
        session.close()
