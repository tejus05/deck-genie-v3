#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')

from services.database import get_session
from auth.models import User

def check_users():
    """Check users in the auth database"""
    session = next(get_session())
    try:
        users = session.query(User).all()
        print(f"Total users in auth database: {len(users)}")
        
        for user in users:
            print(f"User ID: {user.id}, Email: {user.email}, Name: {user.full_name}")
    
    finally:
        session.close()

if __name__ == "__main__":
    check_users()
