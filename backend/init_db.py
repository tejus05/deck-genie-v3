#!/usr/bin/env python3
"""
Database initialization script for NeonDB migration
"""
import os
import sys
from dotenv import load_dotenv
from sqlmodel import SQLModel
from services.database import engine
from auth.models import User, Presentation, UserFile

def init_database():
    """Initialize the database with all tables"""
    try:
        print("🔄 Initializing database...")
        
        # Load environment variables
        load_dotenv()
        
        # Check if DATABASE_URL is set
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ ERROR: DATABASE_URL environment variable is not set!")
            print("Please set your NeonDB connection string in the .env file")
            return False
            
        if "sqlite" in database_url.lower():
            print("⚠️  WARNING: Still using SQLite database!")
            print("Please update DATABASE_URL to use your NeonDB connection string")
            return False
            
        print(f"✅ Database URL configured: {database_url.split('@')[0]}@[HIDDEN]")
        
        # Create all tables
        print("🔄 Creating database tables...")
        SQLModel.metadata.create_all(engine)
        
        print("✅ Database initialized successfully!")
        print("🎉 All tables created:")
        print("   - users")
        print("   - presentations")  
        print("   - userfiles")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR initializing database: {str(e)}")
        return False

def check_connection():
    """Test database connection"""
    try:
        print("🔄 Testing database connection...")
        
        from sqlmodel import Session, text
        
        with Session(engine) as session:
            result = session.exec(text("SELECT 1")).first()
            if result:
                print("✅ Database connection successful!")
                return True
            else:
                print("❌ Database connection failed!")
                return False
                
    except Exception as e:
        print(f"❌ ERROR testing connection: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 NeonDB Database Initialization")
    print("=" * 40)
    
    # Test connection first
    if not check_connection():
        print("\n💡 Troubleshooting tips:")
        print("1. Check your DATABASE_URL in .env file")
        print("2. Ensure your NeonDB instance is running")
        print("3. Verify network connectivity")
        sys.exit(1)
    
    # Initialize database
    if init_database():
        print("\n🎉 Setup complete! You can now start your application.")
    else:
        print("\n❌ Setup failed! Please check the error messages above.")
        sys.exit(1)
