from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlmodel import Session
from typing import List

from auth.middleware import get_current_active_user
from auth.models import User, UserFileRead, PresentationRead
from services.database import get_session
from services.file_manager import file_manager

router = APIRouter(prefix="/files", tags=["file-management"])

@router.post("/upload", response_model=UserFileRead)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Upload a file to user's directory."""
    # Validate file type (optional)
    allowed_types = {'.pdf', '.pptx', '.docx', '.txt', '.png', '.jpg', '.jpeg'}
    file_extension = file.filename.split('.')[-1].lower()
    
    if f'.{file_extension}' not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed"
        )
    
    user_file = await file_manager.save_uploaded_file(file, current_user.id, session)
    return user_file

@router.get("/my-files", response_model=List[UserFileRead])
def get_my_files(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all files for the current user."""
    return file_manager.get_user_files(current_user.id, session)

@router.get("/my-presentations", response_model=List[PresentationRead])
def get_my_presentations(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all presentations for the current user."""
    return file_manager.get_user_presentations(current_user.id, session)

@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Download a user's file."""
    user_files = file_manager.get_user_files(current_user.id, session)
    user_file = next((f for f in user_files if f.id == file_id), None)
    
    if not user_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        path=user_file.file_path,
        filename=user_file.filename,
        media_type='application/octet-stream'
    )

@router.delete("/delete/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a user's file."""
    success = file_manager.delete_file(file_id, current_user.id, session)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return {"message": "File deleted successfully"}

@router.delete("/presentations/{presentation_id}")
def delete_presentation(
    presentation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a user's presentation."""
    success = file_manager.delete_presentation(presentation_id, current_user.id, session)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found"
        )
    
    return {"message": "Presentation deleted successfully"}
