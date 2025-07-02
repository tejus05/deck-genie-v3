#!/usr/bin/env python3

from api.services.database import get_sql_session
from api.sql_models import PresentationSqlModel, SlideSqlModel
from sqlmodel import select

def check_sql_presentations():
    print("=== SQL PRESENTATIONS (Generation System) ===")
    
    with get_sql_session() as session:
        presentations = session.exec(select(PresentationSqlModel)).all()
        print(f"Total SQL presentations: {len(presentations)}")
        
        for p in presentations:
            print(f"ID: {p.id}")
            print(f"  Title: {p.title}")
            print(f"  Prompt: {p.prompt}")
            print(f"  File: {p.file}")
            print(f"  Created: {p.created_at}")
            print("---")
        
        print("\n=== SQL SLIDES ===")
        slides = session.exec(select(SlideSqlModel)).all()
        print(f"Total slides: {len(slides)}")
        
        # Group slides by presentation
        presentation_slides = {}
        for slide in slides:
            if slide.presentation not in presentation_slides:
                presentation_slides[slide.presentation] = []
            presentation_slides[slide.presentation].append(slide)
        
        for presentation_id, slides in presentation_slides.items():
            print(f"Presentation {presentation_id}: {len(slides)} slides")

if __name__ == "__main__":
    check_sql_presentations()
