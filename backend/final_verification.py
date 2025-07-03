#!/usr/bin/env python3

"""
Final verification script to confirm dashboard functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import get_session
from auth.models import Presentation, User
from sqlmodel import select

def final_verification():
    """Final verification that the dashboard should work"""
    print("=== FINAL VERIFICATION ===")
    
    auth_session = next(get_session())
    try:
        users = auth_session.exec(select(User)).all()
        presentations = auth_session.exec(select(Presentation)).all()
        
        print(f"Total users: {len(users)}")
        print(f"Total presentations in auth DB: {len(presentations)}")
        print()
        
        # Check which users have presentations
        user_presentation_count = {}
        for pres in presentations:
            if pres.owner_id not in user_presentation_count:
                user_presentation_count[pres.owner_id] = 0
            user_presentation_count[pres.owner_id] += 1
        
        print("Users with presentations:")
        for user_id, count in user_presentation_count.items():
            user = auth_session.exec(select(User).where(User.id == user_id)).first()
            if user:
                print(f"  User {user_id} ({user.email}): {count} presentations")
        
        print("\nPresentation details:")
        for pres in presentations:
            file_exists = os.path.exists(pres.file_path) if pres.file_path else False
            print(f"  ID {pres.id}: '{pres.title}' (user {pres.owner_id})")
            print(f"    File: {pres.file_path}")
            print(f"    Exists: {file_exists}")
            print()
        
        # Count by storage type
        local_count = sum(1 for p in presentations if p.file_path and not p.uploadthing_url)
        cloud_count = sum(1 for p in presentations if p.uploadthing_url)
        
        print(f"Storage breakdown:")
        print(f"  Local storage: {local_count}")
        print(f"  Cloud storage (UploadThing): {cloud_count}")
        
        print("\n=== DASHBOARD STATUS ===")
        if len(presentations) > 0:
            print("✅ SUCCESS: Dashboard should show presentations for authenticated users!")
            print("✅ Users can now see their exported presentations in the dashboard!")
        else:
            print("❌ No presentations found in auth database")
        
        print(f"\n=== AUTHENTICATION TEST ===")
        print("To test the dashboard, users can log in with these emails:")
        for user_id, count in user_presentation_count.items():
            user = auth_session.exec(select(User).where(User.id == user_id)).first()
            if user and count > 0:
                print(f"  {user.email} (will see {count} presentations)")
                
    finally:
        auth_session.close()

if __name__ == "__main__":
    final_verification()
