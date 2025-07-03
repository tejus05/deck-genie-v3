#!/usr/bin/env python3

"""
Fix file paths in auth database by converting backslashes to forward slashes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import get_session
from auth.models import Presentation
from sqlmodel import select

def fix_file_paths():
    """Fix file paths by converting backslashes to forward slashes"""
    print("=== FIXING FILE PATHS IN DATABASE ===")
    
    auth_session = next(get_session())
    try:
        presentations = auth_session.exec(select(Presentation)).all()
        fixed_count = 0
        
        for pres in presentations:
            if pres.file_path and '\\' in pres.file_path:
                old_path = pres.file_path
                new_path = pres.file_path.replace('\\', '/')
                
                print(f"Fixing ID {pres.id}: {pres.title}")
                print(f"  Old: {old_path}")
                print(f"  New: {new_path}")
                print(f"  File exists: {os.path.exists(new_path)}")
                
                pres.file_path = new_path
                fixed_count += 1
        
        if fixed_count > 0:
            auth_session.commit()
            print(f"\nFixed {fixed_count} file paths!")
        else:
            print("\nNo file paths needed fixing.")
                
    finally:
        auth_session.close()

if __name__ == "__main__":
    fix_file_paths()
