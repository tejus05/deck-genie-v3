#!/usr/bin/env python3

"""
Script to identify why presentations aren't appearing in dashboard.
This will test the complete flow from creation to export.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import get_session
from auth.models import Presentation, User
from sqlmodel import select

def check_current_state():
    """Check current state of both databases"""
    print("=== CURRENT DATABASE STATE ===")
    
    # Check auth database
    auth_session = next(get_session())
    try:
        auth_presentations = auth_session.exec(select(Presentation)).all()
        auth_users = auth_session.exec(select(User)).all()
        
        print(f"Auth Database:")
        print(f"  Users: {len(auth_users)}")
        print(f"  Presentations: {len(auth_presentations)}")
        
        if auth_users:
            print(f"  Sample Users:")
            for user in auth_users[:3]:
                print(f"    User {user.id}: {user.email} (active: {user.is_active})")
        
        if auth_presentations:
            print(f"  Sample Presentations:")
            for pres in auth_presentations[-3:]:
                print(f"    {pres.id}: {pres.title} (owner: {pres.owner_id})")
                
    finally:
        auth_session.close()
    
    # Check generation database
    from api.services.database import get_sql_session
    from api.sql_models import PresentationSqlModel
    
    with get_sql_session() as gen_session:
        gen_presentations = gen_session.exec(select(PresentationSqlModel)).all()
        print(f"\nGeneration Database:")
        print(f"  Presentations: {len(gen_presentations)}")
        
        if gen_presentations:
            print(f"  Recent Presentations:")
            for pres in gen_presentations[-5:]:
                has_file = pres.file and os.path.exists(pres.file) if pres.file else False
                print(f"    {pres.id}: {pres.title or 'No Title'} (has_file: {has_file})")
    
    # Check uploaded files
    print(f"\nUploaded Files:")
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        pptx_files = []
        for root, dirs, files in os.walk(uploads_dir):
            for file in files:
                if file.endswith('.pptx'):
                    pptx_files.append(os.path.join(root, file))
        print(f"  Total PPTX files in uploads: {len(pptx_files)}")
        if pptx_files:
            print(f"  Sample files:")
            for file in pptx_files[:5]:
                print(f"    {file}")
    else:
        print(f"  Uploads directory not found")

def identify_issue():
    """Identify the specific issue with presentation saving"""
    print("\n=== ISSUE IDENTIFICATION ===")
    
    # Count presentations with files vs without
    from api.services.database import get_sql_session
    from api.sql_models import PresentationSqlModel
    
    # Check uploaded files
    uploads_dir = "uploads"
    uploaded_files = []
    if os.path.exists(uploads_dir):
        for root, dirs, files in os.walk(uploads_dir):
            for file in files:
                if file.endswith('.pptx'):
                    uploaded_files.append(os.path.join(root, file))
    
    with get_sql_session() as gen_session:
        all_gen_presentations = gen_session.exec(select(PresentationSqlModel)).all()
        with_files = [p for p in all_gen_presentations if p.file and os.path.exists(p.file)]
        
        print(f"Generation DB: {len(all_gen_presentations)} total, {len(with_files)} with recorded files")
        print(f"Uploaded Files: {len(uploaded_files)} PPTX files found in uploads directory")
    
    # Check auth database
    auth_session = next(get_session())
    try:
        auth_presentations = auth_session.exec(select(Presentation)).all()
        print(f"Auth DB: {len(auth_presentations)} presentations")
        
        # The issue: Most presentations from generation DB are not in auth DB
        # This means they're either:
        # 1. Not exported
        # 2. Exported without authentication 
        # 3. Export failing to save to auth DB
        
        print(f"\nGAP: {len(uploaded_files)} presentations have been exported to files, but only {len(auth_presentations)} are in user accounts")
        print("This indicates that exports are happening without proper authentication or save is failing.")
        
        return len(uploaded_files), len(auth_presentations)
        
    finally:
        auth_session.close()

def propose_solution():
    """Propose the solution to fix the issue"""
    print("\n=== PROPOSED SOLUTION ===")
    print("The issue is that presentations are being exported without being saved to user accounts.")
    print("This happens when:")
    print("1. Users create presentations without being logged in")
    print("2. Authentication tokens are missing during export") 
    print("3. Export process fails to save to auth DB but still succeeds in file creation")
    print("\nTo fix this, we need to:")
    print("1. Ensure authentication is required for export")
    print("2. Always save successful exports to user accounts") 
    print("3. Provide better error handling and logging")
    print("4. Optionally: Save presentations to auth DB during creation, not just export")

if __name__ == "__main__":
    check_current_state()
    with_files, in_auth = identify_issue()
    propose_solution()
    
    print(f"\n=== SUMMARY ===")
    print(f"Problem: {with_files} presentations exported, only {in_auth} in user dashboards")
    print(f"Solution: Fix authentication flow during export to ensure presentations are saved to user accounts")
