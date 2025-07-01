"""
Database initialization script for PostgreSQL migration
This script creates the necessary tables in PostgreSQL and optionally migrates data from SQLite
"""

import os
import sqlite3
import json
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlmodel import Session, SQLModel
from dotenv import load_dotenv

# Import models
from api.sql_models import PresentationSqlModel, SlideSqlModel, KeyValueSqlModel

load_dotenv()

def create_tables():
    """Create all tables in PostgreSQL database"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    print(f"Creating tables in PostgreSQL database...")
    
    # Create engine
    engine = create_engine(database_url)
    
    # Create all tables
    SQLModel.metadata.create_all(engine)
    print("✅ Tables created successfully!")
    
    return engine

def migrate_from_sqlite():
    """Migrate data from SQLite to PostgreSQL if SQLite database exists"""
    sqlite_path = "./auth_database.db"
    
    if not os.path.exists(sqlite_path):
        print("No SQLite database found. Starting fresh with PostgreSQL.")
        return
    
    print("SQLite database found. Migrating data to PostgreSQL...")
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row  # Enable column access by name
    
    # Connect to PostgreSQL
    database_url = os.getenv("DATABASE_URL")
    pg_engine = create_engine(database_url)
    
    try:
        with Session(pg_engine) as session:
            # Migrate presentations
            sqlite_cursor = sqlite_conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in sqlite_cursor.fetchall()]
            
            if 'presentationsqlmodel' in tables:
                print("Migrating presentations...")
                presentations = sqlite_conn.execute("SELECT * FROM presentationsqlmodel").fetchall()
                for pres in presentations:
                    pg_presentation = PresentationSqlModel(
                        id=pres['id'],
                        created_at=datetime.fromisoformat(pres['created_at']) if pres['created_at'] else datetime.now(),
                        prompt=pres['prompt'],
                        n_slides=pres['n_slides'],
                        theme=json.loads(pres['theme']) if pres['theme'] else None,
                        file=pres['file'],
                        title=pres['title'],
                        titles=json.loads(pres['titles']) if pres['titles'] else None,
                        tone=pres['tone'],
                        summary=pres['summary'],
                        thumbnail=pres['thumbnail'],
                        data=json.loads(pres['data']) if pres['data'] else None
                    )
                    session.add(pg_presentation)
                print(f"✅ Migrated {len(presentations)} presentations")
            
            if 'slidesqlmodel' in tables:
                print("Migrating slides...")
                slides = sqlite_conn.execute("SELECT * FROM slidesqlmodel").fetchall()
                for slide in slides:
                    pg_slide = SlideSqlModel(
                        id=slide['id'],
                        index=slide['index'],
                        type=slide['type'],
                        design_index=slide['design_index'],
                        images=json.loads(slide['images']) if slide['images'] else None,
                        presentation=slide['presentation'],
                        content=json.loads(slide['content']) if slide['content'] else {},
                        properties=json.loads(slide['properties']) if slide['properties'] else None
                    )
                    session.add(pg_slide)
                print(f"✅ Migrated {len(slides)} slides")
            
            if 'keyvaluesqlmodel' in tables:
                print("Migrating key-value pairs...")
                kvs = sqlite_conn.execute("SELECT * FROM keyvaluesqlmodel").fetchall()
                for kv in kvs:
                    pg_kv = KeyValueSqlModel(
                        id=kv['id'],
                        key=kv['key'],
                        value=json.loads(kv['value']) if kv['value'] else None
                    )
                    session.add(pg_kv)
                print(f"✅ Migrated {len(kvs)} key-value pairs")
            
            session.commit()
            print("✅ Data migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        raise
    finally:
        sqlite_conn.close()

def backup_sqlite():
    """Create a backup of the SQLite database before migration"""
    sqlite_path = "./auth_database.db"
    if os.path.exists(sqlite_path):
        backup_path = f"./auth_database_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        import shutil
        shutil.copy2(sqlite_path, backup_path)
        print(f"✅ SQLite database backed up to: {backup_path}")

def main():
    """Main function to set up PostgreSQL database"""
    print("🚀 Setting up PostgreSQL database for Deck Genie...")
    
    # Check if DATABASE_URL is set
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable is not set!")
        print("Please update your .env file with your PostgreSQL connection string:")
        print("DATABASE_URL=postgresql://username:password@host:port/database_name")
        return
    
    if database_url.startswith("sqlite"):
        print("❌ DATABASE_URL is still pointing to SQLite!")
        print("Please update your .env file with your PostgreSQL connection string:")
        print("DATABASE_URL=postgresql://username:password@host:port/database_name")
        return
    
    try:
        # Test connection
        engine = create_engine(database_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Successfully connected to PostgreSQL database!")
        
        # Backup SQLite if it exists
        backup_sqlite()
        
        # Create tables
        create_tables()
        
        # Migrate data from SQLite if it exists
        migrate_from_sqlite()
        
        print("\n🎉 PostgreSQL setup completed successfully!")
        print("You can now start your application with the PostgreSQL database.")
        
    except Exception as e:
        print(f"❌ Error setting up PostgreSQL database: {e}")
        print("\nPlease check:")
        print("1. Your DATABASE_URL is correct")
        print("2. Your PostgreSQL server is running and accessible")
        print("3. The database specified in DATABASE_URL exists")
        print("4. Your credentials have the necessary permissions")

if __name__ == "__main__":
    main()
