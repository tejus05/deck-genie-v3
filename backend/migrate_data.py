#!/usr/bin/env python3
"""
Data migration script from SQLite to NeonDB
"""
import os
import sqlite3
import sys
from dotenv import load_dotenv
from sqlmodel import Session, select
from services.database import engine
from auth.models import User, Presentation, UserFile
from datetime import datetime

def migrate_from_sqlite():
    """Migrate data from SQLite to NeonDB"""
    try:
        # Load environment variables
        load_dotenv()
        
        # Check if old SQLite database exists
        sqlite_paths = [
            "auth_database.db",
            "data/fastapi.db",
            os.path.join(os.getenv("APP_DATA_DIRECTORY", "./data"), "fastapi.db")
        ]
        
        sqlite_db = None
        for path in sqlite_paths:
            if os.path.exists(path):
                sqlite_db = path
                break
                
        if not sqlite_db:
            print("ℹ️  No existing SQLite database found to migrate from.")
            print("Starting with fresh database...")
            return True
            
        print(f"📁 Found SQLite database: {sqlite_db}")
        print("🔄 Starting migration...")
        
        # Connect to SQLite
        sqlite_conn = sqlite3.connect(sqlite_db)
        sqlite_conn.row_factory = sqlite3.Row  # Enable column access by name
        sqlite_cursor = sqlite_conn.cursor()
        
        # Check what tables exist
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in sqlite_cursor.fetchall()]
        print(f"📊 Found tables in SQLite: {tables}")
        
        # Migrate users
        if 'user' in tables:
            print("👥 Migrating users...")
            sqlite_cursor.execute("SELECT * FROM user")
            users = sqlite_cursor.fetchall()
            
            with Session(engine) as session:
                for user_row in users:
                    # Check if user already exists
                    existing_user = session.exec(
                        select(User).where(User.email == user_row['email'])
                    ).first()
                    
                    if not existing_user:
                        user = User(
                            email=user_row['email'],
                            full_name=user_row['full_name'],
                            hashed_password=user_row['hashed_password'],
                            is_active=bool(user_row['is_active']),
                            created_at=datetime.fromisoformat(user_row['created_at']) if user_row['created_at'] else datetime.utcnow(),
                            picture=user_row.get('picture'),
                            google_id=user_row.get('google_id')
                        )
                        session.add(user)
                
                session.commit()
                print(f"✅ Migrated {len(users)} users")
        
        # Migrate presentations
        if 'presentation' in tables:
            print("📊 Migrating presentations...")
            sqlite_cursor.execute("SELECT * FROM presentation")
            presentations = sqlite_cursor.fetchall()
            
            with Session(engine) as session:
                for pres_row in presentations:
                    # Check if presentation already exists
                    existing_pres = session.exec(
                        select(Presentation).where(Presentation.id == pres_row['id'])
                    ).first()
                    
                    if not existing_pres:
                        presentation = Presentation(
                            title=pres_row['title'],
                            description=pres_row.get('description'),
                            owner_id=pres_row['owner_id'],
                            file_path=pres_row['file_path'],
                            thumbnail_path=pres_row.get('thumbnail_path'),
                            created_at=datetime.fromisoformat(pres_row['created_at']) if pres_row['created_at'] else datetime.utcnow(),
                            updated_at=datetime.fromisoformat(pres_row['updated_at']) if pres_row['updated_at'] else datetime.utcnow()
                        )
                        session.add(presentation)
                
                session.commit()
                print(f"✅ Migrated {len(presentations)} presentations")
        
        # Migrate user files
        if 'userfile' in tables:
            print("📁 Migrating user files...")
            sqlite_cursor.execute("SELECT * FROM userfile")
            files = sqlite_cursor.fetchall()
            
            with Session(engine) as session:
                for file_row in files:
                    # Check if file already exists
                    existing_file = session.exec(
                        select(UserFile).where(UserFile.id == file_row['id'])
                    ).first()
                    
                    if not existing_file:
                        user_file = UserFile(
                            filename=file_row['filename'],
                            file_type=file_row['file_type'],
                            file_size=file_row['file_size'],
                            owner_id=file_row['owner_id'],
                            file_path=file_row['file_path'],
                            uploaded_at=datetime.fromisoformat(file_row['uploaded_at']) if file_row['uploaded_at'] else datetime.utcnow()
                        )
                        session.add(user_file)
                
                session.commit()
                print(f"✅ Migrated {len(files)} user files")
        
        sqlite_conn.close()
        print("🎉 Migration completed successfully!")
        
        # Suggest backing up SQLite file
        print(f"\n💡 Consider backing up your SQLite file: {sqlite_db}")
        print("   You can rename it to {sqlite_db}.backup")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR during migration: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔄 SQLite to NeonDB Migration")
    print("=" * 40)
    
    if migrate_from_sqlite():
        print("\n✅ Migration successful!")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)
