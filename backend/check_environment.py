#!/usr/bin/env python3

import os
from dotenv import load_dotenv

load_dotenv()

def check_environment():
    print("=== ENVIRONMENT VARIABLES ===")
    
    uploadthing_secret = os.getenv("UPLOADTHING_SECRET")
    print(f"UPLOADTHING_SECRET: {'Set' if uploadthing_secret else 'NOT SET'}")
    
    if uploadthing_secret:
        print(f"UPLOADTHING_SECRET length: {len(uploadthing_secret)}")
        print(f"UPLOADTHING_SECRET starts with: {uploadthing_secret[:10] if len(uploadthing_secret) > 10 else uploadthing_secret}...")
    
    # Check other relevant env vars
    database_url = os.getenv("DATABASE_URL")
    print(f"DATABASE_URL: {'Set' if database_url else 'NOT SET'}")
    
    # Test UploadThing service initialization
    try:
        from services.uploadthing import uploadthing_service
        print("UploadThing service: Initialized successfully")
    except Exception as e:
        print(f"UploadThing service: Failed to initialize - {e}")

if __name__ == "__main__":
    check_environment()
