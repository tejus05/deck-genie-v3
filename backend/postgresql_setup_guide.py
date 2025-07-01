"""
Helper script to guide users in setting up PostgreSQL connection
"""

def get_postgresql_providers():
    """Display popular PostgreSQL cloud providers and their connection string formats"""
    
    providers = {
        "Neon": {
            "url": "https://neon.tech",
            "format": "postgresql://username:password@ep-xyz.region.neon.tech/database_name?sslmode=require",
            "description": "Serverless PostgreSQL with generous free tier"
        },
        "Supabase": {
            "url": "https://supabase.com",
            "format": "postgresql://postgres:password@db.xyz.supabase.co:5432/postgres",
            "description": "Open source Firebase alternative with PostgreSQL"
        },
        "ElephantSQL": {
            "url": "https://www.elephantsql.com",
            "format": "postgresql://username:password@server.elephantsql.com/database_name",
            "description": "PostgreSQL as a Service with free tier"
        },
        "Railway": {
            "url": "https://railway.app",
            "format": "postgresql://postgres:password@containers-us-west-xyz.railway.app:5432/railway",
            "description": "Simple deployment platform with PostgreSQL add-on"
        },
        "Render": {
            "url": "https://render.com",
            "format": "postgresql://username:password@server.render.com/database_name",
            "description": "Cloud platform with managed PostgreSQL"
        },
        "Heroku Postgres": {
            "url": "https://www.heroku.com/postgres",
            "format": "postgresql://username:password@host.compute-1.amazonaws.com:5432/database_name",
            "description": "Managed PostgreSQL by Heroku"
        }
    }
    
    print("🐘 Popular PostgreSQL Cloud Providers:\n")
    
    for name, info in providers.items():
        print(f"📌 {name}")
        print(f"   Website: {info['url']}")
        print(f"   Description: {info['description']}")
        print(f"   Connection format: {info['format']}")
        print()
    
    print("📝 Steps to set up your PostgreSQL database:")
    print("1. Choose a provider from the list above")
    print("2. Sign up and create a new PostgreSQL database")
    print("3. Get your connection string from the provider's dashboard")
    print("4. Update the DATABASE_URL in your .env file")
    print("5. Run 'python setup_postgresql.py' to initialize the database")
    
    print("\n🔒 Security Note:")
    print("Make sure to:")
    print("- Use a strong password for your database")
    print("- Enable SSL connections (most providers do this by default)")
    print("- Don't commit your .env file to version control")

def validate_connection_string(connection_string):
    """Validate a PostgreSQL connection string format"""
    if not connection_string.startswith("postgresql://"):
        return False, "Connection string must start with 'postgresql://'"
    
    try:
        # Basic validation
        parts = connection_string.replace("postgresql://", "").split("@")
        if len(parts) != 2:
            return False, "Invalid format. Should be: postgresql://username:password@host:port/database"
        
        credentials, host_db = parts
        if ":" not in credentials:
            return False, "Missing password. Format: username:password"
        
        if "/" not in host_db:
            return False, "Missing database name"
        
        return True, "Connection string format looks valid!"
    
    except Exception as e:
        return False, f"Error validating connection string: {str(e)}"

if __name__ == "__main__":
    print("🚀 PostgreSQL Setup Helper for Deck Genie\n")
    
    get_postgresql_providers()
    
    print("\n" + "="*60)
    print("📋 Quick Setup Checklist:")
    print("="*60)
    print("□ 1. Choose a PostgreSQL provider")
    print("□ 2. Create a new database")
    print("□ 3. Get the connection string")
    print("□ 4. Update DATABASE_URL in .env file")
    print("□ 5. Run: python setup_postgresql.py")
    print("□ 6. Start your application")
    
    print("\n💡 Need help? Check the documentation of your chosen provider for:")
    print("   - How to create a new database")
    print("   - Where to find your connection string")
    print("   - How to configure SSL settings")
