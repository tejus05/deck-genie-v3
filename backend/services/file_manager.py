import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from sqlmodel import Session, select
import uuid

from auth.models import User, UserFile, Presentation

class FileManager:
    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_upload_dir = Path(base_upload_dir)
        self.base_upload_dir.mkdir(exist_ok=True)
    
    def get_user_directory(self, user_id: int) -> Path:
        """Get user-specific directory."""
        user_dir = self.base_upload_dir / f"user_{user_id}"
        user_dir.mkdir(exist_ok=True)
        return user_dir
    
    def get_presentations_directory(self, user_id: int) -> Path:
        """Get user-specific presentations directory."""
        presentations_dir = self.get_user_directory(user_id) / "presentations"
        presentations_dir.mkdir(exist_ok=True)
        return presentations_dir
    
    def get_uploads_directory(self, user_id: int) -> Path:
        """Get user-specific uploads directory."""
        uploads_dir = self.get_user_directory(user_id) / "uploads"
        uploads_dir.mkdir(exist_ok=True)
        return uploads_dir
    
    async def save_uploaded_file(
        self, 
        file: UploadFile, 
        user_id: int,
        session: Session
    ) -> UserFile:
        """Save an uploaded file to user's directory."""
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Get user upload directory
        upload_dir = self.get_uploads_directory(user_id)
        file_path = upload_dir / unique_filename
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
        # Create database record
        user_file = UserFile(
            owner_id=user_id,
            filename=file.filename,
            file_type=file_extension.lower(),
            file_size=len(content),
            file_path=str(file_path)
        )
        
        session.add(user_file)
        session.commit()
        session.refresh(user_file)
        
        return user_file
    
    def save_presentation(
        self,
        user_id: int,
        title: str,
        file_content: bytes,
        file_extension: str = ".pptx",
        session: Session = None
    ) -> Presentation:
        """Save a generated presentation to user's directory."""
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Get user presentations directory
        presentations_dir = self.get_presentations_directory(user_id)
        file_path = presentations_dir / unique_filename
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save presentation: {str(e)}")
        
        # Create database record
        presentation = Presentation(
            owner_id=user_id,
            title=title,
            file_path=str(file_path)
        )
        
        if session:
            session.add(presentation)
            session.commit()
            session.refresh(presentation)
        
        return presentation
    
    def get_user_files(self, user_id: int, session: Session) -> List[UserFile]:
        """Get all files for a user."""
        statement = select(UserFile).where(UserFile.owner_id == user_id)
        return session.exec(statement).all()
    
    def get_user_presentations(self, user_id: int, session: Session) -> List[Presentation]:
        """Get all presentations for a user."""
        statement = select(Presentation).where(Presentation.owner_id == user_id)
        return session.exec(statement).all()
    
    def delete_file(self, file_id: int, user_id: int, session: Session) -> bool:
        """Delete a user's file."""
        # Get file record
        statement = select(UserFile).where(
            UserFile.id == file_id, 
            UserFile.owner_id == user_id
        )
        user_file = session.exec(statement).first()
        
        if not user_file:
            return False
        
        # Delete physical file
        try:
            os.remove(user_file.file_path)
        except FileNotFoundError:
            pass  # File already deleted
        
        # Delete database record
        session.delete(user_file)
        session.commit()
        
        return True
    
    def delete_presentation(self, presentation_id: int, user_id: int, session: Session) -> bool:
        """Delete a user's presentation."""
        # Get presentation record
        statement = select(Presentation).where(
            Presentation.id == presentation_id,
            Presentation.owner_id == user_id
        )
        presentation = session.exec(statement).first()
        
        if not presentation:
            return False
        
        # Delete physical file
        try:
            os.remove(presentation.file_path)
            if presentation.thumbnail_path:
                os.remove(presentation.thumbnail_path)
        except FileNotFoundError:
            pass  # File already deleted
        
        # Delete database record
        session.delete(presentation)
        session.commit()
        
        return True

# Global file manager instance
file_manager = FileManager()
