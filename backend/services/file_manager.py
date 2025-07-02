import os
import shutil
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import UploadFile, HTTPException
from sqlmodel import Session, select
import uuid
import logging

from auth.models import User, UserFile, Presentation
from services.uploadthing import uploadthing_service

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
    
    async def save_presentation_async(
        self,
        user_id: int,
        title: str,
        file_content: bytes,
        file_extension: str = ".pptx",
        session: Session = None,
        use_uploadthing: bool = True
    ) -> Presentation:
        """Save a generated presentation (async version for UploadThing support)."""
        
        if use_uploadthing:
            return await self._save_presentation_uploadthing(
                user_id, title, file_content, file_extension, session
            )
        else:
            return self._save_presentation_legacy(
                user_id, title, file_content, file_extension, session
            )
    
    def save_presentation(
        self,
        user_id: int,
        title: str,
        file_content: bytes,
        file_extension: str = ".pptx",
        session: Session = None,
        use_uploadthing: bool = False  # Default to legacy for backward compatibility
    ) -> Presentation:
        """Save a generated presentation (sync version for backward compatibility)."""
        return self._save_presentation_legacy(
            user_id, title, file_content, file_extension, session
        )
    
    async def _save_presentation_uploadthing(
        self,
        user_id: int,
        title: str,
        file_content: bytes,
        file_extension: str = ".pptx",
        session: Session = None
    ) -> Presentation:
        """Save presentation using UploadThing."""
        try:
            # Generate filename
            filename = f"{title.replace(' ', '_')}{file_extension}"
            
            # Upload to UploadThing
            upload_result = await uploadthing_service.upload_presentation(
                file_content=file_content,
                filename=filename,
                user_id=user_id
            )
            
            if not upload_result or not upload_result.get('url'):
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to upload to UploadThing: No URL returned"
                )
            
            # Create database record with UploadThing data
            presentation = Presentation(
                owner_id=user_id,
                title=title,
                uploadthing_url=upload_result['url'],
                uploadthing_key=upload_result['key'],
                file_size=len(file_content)
            )
            
            # Try to generate thumbnail if possible
            try:
                thumbnail_result = await self._generate_presentation_thumbnail(
                    file_content, upload_result['key']
                )
                if thumbnail_result:
                    presentation.uploadthing_thumbnail_url = thumbnail_result['url']
                    presentation.uploadthing_thumbnail_key = thumbnail_result['key']
            except Exception as e:
                logging.warning(f"Failed to generate thumbnail: {str(e)}")
            
            if session:
                session.add(presentation)
                session.commit()
                session.refresh(presentation)
            
            return presentation
            
        except Exception as e:
            logging.error(f"Failed to save presentation with UploadThing: {str(e)}")
            # Fallback to legacy method
            return self._save_presentation_legacy(
                user_id, title, file_content, file_extension, session
            )
    
    def _save_presentation_legacy(
        self,
        user_id: int,
        title: str,
        file_content: bytes,
        file_extension: str = ".pptx",
        session: Session = None
    ) -> Presentation:
        """Save presentation using legacy local storage method."""
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
        
        # Create database record with legacy file path
        presentation = Presentation(
            owner_id=user_id,
            title=title,
            file_path=str(file_path),
            file_size=len(file_content)
        )
        
        if session:
            session.add(presentation)
            session.commit()
            session.refresh(presentation)
        
        return presentation
    
    async def _generate_presentation_thumbnail(
        self, 
        file_content: bytes, 
        presentation_key: str
    ) -> Optional[Dict[str, Any]]:
        """Generate thumbnail for presentation. Placeholder for future implementation."""
        # This is a placeholder - in a real implementation, you might:
        # 1. Convert first slide of PPTX to image
        # 2. Upload thumbnail to UploadThing
        # 3. Return thumbnail upload result
        return None
    
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
    
    async def delete_presentation_async(self, presentation_id: int, user_id: int, session: Session) -> bool:
        """Delete a user's presentation (async version for UploadThing support)."""
        # Get presentation record
        statement = select(Presentation).where(
            Presentation.id == presentation_id,
            Presentation.owner_id == user_id
        )
        presentation = session.exec(statement).first()
        
        if not presentation:
            return False
        
        # Delete from UploadThing if it uses UploadThing storage
        if presentation.uploadthing_key:
            try:
                # Delete main file from UploadThing
                result = await uploadthing_service.delete_file(presentation.uploadthing_key)
                if not result.get('success'):
                    logging.warning(f"Failed to delete file from UploadThing: {result.get('error')}")
                
                # Delete thumbnail if exists
                if presentation.uploadthing_thumbnail_key:
                    thumb_result = await uploadthing_service.delete_file(presentation.uploadthing_thumbnail_key)
                    if not thumb_result.get('success'):
                        logging.warning(f"Failed to delete thumbnail from UploadThing: {thumb_result.get('error')}")
                        
            except Exception as e:
                logging.error(f"Error deleting from UploadThing: {str(e)}")
        
        # Delete physical file for legacy storage
        if presentation.file_path:
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
    
    def delete_presentation(self, presentation_id: int, user_id: int, session: Session) -> bool:
        """Delete a user's presentation (sync version for backward compatibility)."""
        # Get presentation record
        statement = select(Presentation).where(
            Presentation.id == presentation_id,
            Presentation.owner_id == user_id
        )
        presentation = session.exec(statement).first()
        
        if not presentation:
            return False
        
        # For UploadThing presentations, log warning but continue with database deletion
        if presentation.uploadthing_key:
            logging.warning(f"Cannot delete UploadThing files synchronously for presentation {presentation_id}")
        
        # Delete physical file for legacy storage
        if presentation.file_path:
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
    
    def get_presentation_download_url(self, presentation: Presentation) -> Optional[str]:
        """Get download URL for a presentation (UploadThing URL or local file path)."""
        if presentation.uploadthing_url:
            return presentation.uploadthing_url
        elif presentation.file_path and os.path.exists(presentation.file_path):
            # For legacy presentations, we'll need to serve through our API
            return f"/files/presentations/{presentation.id}/download"
        return None
    
    def get_presentation_file_content(self, presentation: Presentation) -> Optional[bytes]:
        """Get file content for a presentation (for legacy local files)."""
        if presentation.file_path and os.path.exists(presentation.file_path):
            try:
                with open(presentation.file_path, "rb") as f:
                    return f.read()
            except Exception as e:
                logging.error(f"Error reading presentation file: {str(e)}")
        return None

# Global file manager instance
file_manager = FileManager()
