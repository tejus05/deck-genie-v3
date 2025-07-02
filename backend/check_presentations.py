#!/usr/bin/env python3

from services.database import get_session
from auth.models import Presentation, User
from sqlmodel import select

def check_presentations():
    session = next(get_session())
    print("=== PRESENTATIONS IN DATABASE ===")
    presentations = session.exec(select(Presentation)).all()
    print(f"Total presentations: {len(presentations)}")
    
    for p in presentations:
        print(f"ID: {p.id}")
        print(f"  Title: {p.title}")
        print(f"  Owner ID: {p.owner_id}")
        print(f"  UploadThing URL: {p.uploadthing_url is not None}")
        print(f"  UploadThing Key: {p.uploadthing_key is not None}")
        print(f"  File Path: {p.file_path is not None}")
        print(f"  Created At: {p.created_at}")
        print("---")
    
    print("\n=== USERS IN DATABASE ===")
    users = session.exec(select(User)).all()
    print(f"Total users: {len(users)}")
    
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}")
    
    session.close()

if __name__ == "__main__":
    check_presentations()
