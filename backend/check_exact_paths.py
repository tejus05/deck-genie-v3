#!/usr/bin/env python3

"""
Check exact file_path values in auth database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import get_session
from auth.models import Presentation
from sqlmodel import select

def check_exact_paths():
    """Check exact file_path values in database"""
    print("=== EXACT FILE PATHS IN DATABASE ===")
    
    auth_session = next(get_session())
    try:
        presentations = auth_session.exec(select(Presentation)).all()
        for pres in presentations:
            print(f"ID {pres.id}: {pres.title}")
            print(f"  file_path: {repr(pres.file_path)}")
            if pres.file_path:
                # Try to fix the path
                fixed_path = pres.file_path.replace('\\', '/')
                print(f"  fixed_path: {repr(fixed_path)}")
                print(f"  exists (original): {os.path.exists(pres.file_path)}")
                print(f"  exists (fixed): {os.path.exists(fixed_path)}")
            print()
                
    finally:
        auth_session.close()

if __name__ == "__main__":
    check_exact_paths()
