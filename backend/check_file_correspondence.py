#!/usr/bin/env python3

"""
Check which presentations in auth DB correspond to uploaded files
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import get_session
from auth.models import Presentation, User
from sqlmodel import select

def check_file_correspondence():
    """Check which presentations have corresponding files"""
    print("=== FILE CORRESPONDENCE CHECK ===")
    
    # Get uploaded files
    uploads_dir = "uploads"
    uploaded_files = {}
    if os.path.exists(uploads_dir):
        for root, dirs, files in os.walk(uploads_dir):
            for file in files:
                if file.endswith('.pptx'):
                    # Extract user ID from path
                    parts = root.split(os.sep)
                    if 'user_' in root:
                        user_part = [p for p in parts if p.startswith('user_')]
                        if user_part:
                            user_id = int(user_part[0].replace('user_', ''))
                            if user_id not in uploaded_files:
                                uploaded_files[user_id] = []
                            uploaded_files[user_id].append(file)
    
    print(f"Uploaded files by user:")
    for user_id, files in uploaded_files.items():
        print(f"  User {user_id}: {len(files)} files")
        for file in files:
            print(f"    {file}")
    
    # Check auth database presentations
    auth_session = next(get_session())
    try:
        auth_presentations = auth_session.exec(select(Presentation)).all()
        print(f"\nAuth Database presentations:")
        for pres in auth_presentations:
            user_files = uploaded_files.get(pres.owner_id, [])
            has_files = len(user_files) > 0
            print(f"  {pres.id}: {pres.title} (owner: {pres.owner_id}, has_files: {has_files})")
            if pres.file_path:
                file_exists = os.path.exists(pres.file_path)
                print(f"    file_path: {pres.file_path} (exists: {file_exists})")
                
    finally:
        auth_session.close()

if __name__ == "__main__":
    check_file_correspondence()
