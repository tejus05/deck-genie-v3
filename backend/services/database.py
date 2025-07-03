from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv
from auth.models import User, Presentation, UserFile

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(
    DATABASE_URL, 
    echo=False,
    pool_size=10,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=300,
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
