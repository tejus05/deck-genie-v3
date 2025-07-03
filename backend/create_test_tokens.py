#!/usr/bin/env python3

"""
Create test tokens for existing users
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import get_session
from auth.models import User
from auth.utils import create_access_token
from sqlmodel import select

def create_test_tokens():
    """Create test tokens for existing users"""
    print("=== CREATING TEST TOKENS ===")
    
    auth_session = next(get_session())
    try:
        users = auth_session.exec(select(User)).all()
        
        for user in users[:3]:  # Just first 3 users
            if user.is_active:
                token = create_access_token(data={"sub": user.email, "user_id": user.id})
                print(f"User {user.id} ({user.email}):")
                print(f"  Token: {token}")
                print()
                
    finally:
        auth_session.close()

if __name__ == "__main__":
    create_test_tokens()
