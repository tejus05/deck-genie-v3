"""
Script to verify and fix slide ordering in PostgreSQL database
"""

from api.services.database import get_sql_session
from api.sql_models import PresentationSqlModel, SlideSqlModel
from sqlmodel import select

def check_slide_ordering():
    """Check slide ordering for presentations"""
    with get_sql_session() as session:
        # Get all presentations
        presentations = session.exec(select(PresentationSqlModel)).all()
        
        print(f"📊 Checking slide ordering for {len(presentations)} presentations...\n")
        
        issues_found = 0
        for presentation in presentations:
            # Get slides with ordering
            slides = session.exec(
                select(SlideSqlModel)
                .where(SlideSqlModel.presentation == presentation.id)
                .order_by(SlideSqlModel.index)
            ).all()
            
            if slides:
                print(f"📋 Presentation: {presentation.title or presentation.id[:8]}")
                print(f"   Total slides: {len(slides)}")
                
                # Check if ordering is correct
                expected_indices = list(range(len(slides)))
                actual_indices = [slide.index for slide in slides]
                
                if actual_indices != expected_indices:
                    print(f"   ❌ Ordering issue found!")
                    print(f"   Expected: {expected_indices}")
                    print(f"   Actual:   {actual_indices}")
                    issues_found += 1
                else:
                    print(f"   ✅ Slides are correctly ordered: {actual_indices}")
                
                # Show first few slides for verification
                for i, slide in enumerate(slides[:3]):
                    slide_type = "Title" if slide.index == 0 else f"Slide {slide.index + 1}"
                    print(f"   {i+1}. Index {slide.index}: {slide_type}")
                
                if len(slides) > 3:
                    print(f"   ... and {len(slides) - 3} more slides")
                print()
        
        if issues_found == 0:
            print("🎉 All presentations have correctly ordered slides!")
        else:
            print(f"⚠️  Found ordering issues in {issues_found} presentations")
        
        return issues_found == 0

if __name__ == "__main__":
    check_slide_ordering()
