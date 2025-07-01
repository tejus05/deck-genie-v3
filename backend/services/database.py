from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

# Import all models to ensure they're registered with SQLModel metadata
from auth.models import User, Presentation, UserFile

load_dotenv()

# Database URL from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://username:password@localhost:5432/deck_genie_db"
)

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session
