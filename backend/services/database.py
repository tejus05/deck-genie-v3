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

print(f"Connecting to database: {DATABASE_URL.split('@')[0]}@[HIDDEN]")

# Create engine with PostgreSQL-specific settings
engine = create_engine(
    DATABASE_URL, 
    echo=True,  # Set to False in production
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,  # Enables pessimistic disconnect handling
    pool_recycle=300,  # Recycle connections every 5 minutes
)

def create_db_and_tables():
    """Create database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session
