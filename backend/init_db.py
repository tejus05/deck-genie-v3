#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, text
from services.database import engine
from auth.models import User, Presentation, UserFile

def init_database():
    try:
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL environment variable is not set!")
            return False
            
        if "sqlite" in database_url.lower():
            print("⚠️  Still using SQLite database!")
            return False
        
        SQLModel.metadata.create_all(engine)
        print("✅ Database initialized successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        return False

def check_connection():
    try:
        with Session(engine) as session:
            result = session.exec(text("SELECT 1")).first()
            if result:
                print("✅ Database connection successful!")
                return True
            else:
                print("❌ Database connection failed!")
                return False
                
    except Exception as e:
        print(f"❌ Error testing connection: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Database Initialization")
    
    if not check_connection():
        print("💡 Check your DATABASE_URL in .env file")
        sys.exit(1)
    
    if init_database():
        print("🎉 Setup complete!")
    else:
        print("❌ Setup failed!")
        sys.exit(1)
