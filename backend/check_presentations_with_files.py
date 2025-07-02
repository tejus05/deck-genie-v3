#!/usr/bin/env python3

from api.services.database import get_sql_session
from api.sql_models import PresentationSqlModel
from sqlmodel import select

def check_presentations_with_files():
    print("=== PRESENTATIONS WITH FILES ===")
    
    with get_sql_session() as session:
        presentations = session.exec(select(PresentationSqlModel)).all()
        print(f"Total SQL presentations: {len(presentations)}")
        
        presentations_with_files = []
        for p in presentations:
            if p.file:
                presentations_with_files.append(p)
        
        print(f"Presentations with files: {len(presentations_with_files)}")
        
        for p in presentations_with_files:
            print(f"ID: {p.id}")
            print(f"  Title: {p.title}")
            print(f"  File: {p.file}")
            print(f"  Created: {p.created_at}")
            print("---")

if __name__ == "__main__":
    check_presentations_with_files()
