from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from typing import List, Optional, Optional
from pydantic import BaseModel

from auth.middleware import get_current_active_user
from auth.models import User, UserFileRead, PresentationRead, Presentation
from services.database import get_session
from services.file_manager import file_manager

router = APIRouter(prefix="/files", tags=["file-management"])

class PresentationWithUrls(BaseModel):
    """Presentation response with computed URLs"""
    id: int
    title: str
    description: Optional[str] = None
    created_at: str
    updated_at: str
    owner_id: int
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    uploadthing_url: Optional[str] = None
    uploadthing_key: Optional[str] = None
    uploadthing_thumbnail_url: Optional[str] = None
    uploadthing_thumbnail_key: Optional[str] = None
    file_size: Optional[int] = None
    # Computed fields
    download_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    storage_type: str = "unknown"

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

@router.get("/my-presentations", response_model=List[PresentationWithUrls])
def get_my_presentations(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all presentations for the current user with computed URLs."""
    presentations = file_manager.get_user_presentations(current_user.id, session)
    return [presentation_to_response(p) for p in presentations]

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
async def delete_presentation(
    presentation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a user's presentation."""
    success = await file_manager.delete_presentation_async(presentation_id, current_user.id, session)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found"
        )
    
    return {"message": "Presentation deleted successfully"}

@router.get("/presentations/{presentation_id}/download")
async def download_presentation(
    presentation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Download a user's presentation (supports both UploadThing and legacy storage)."""
    # Get presentation record
    statement = select(Presentation).where(
        Presentation.id == presentation_id,
        Presentation.owner_id == current_user.id
    )
    presentation = session.exec(statement).first()
    
    if not presentation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found"
        )
    
    # For UploadThing presentations, redirect to UploadThing URL
    if presentation.uploadthing_url:
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=presentation.uploadthing_url)
    
    # For legacy presentations, serve file directly
    elif presentation.file_path:
        file_content = file_manager.get_presentation_file_content(presentation)
        if file_content:
            from fastapi.responses import Response
            filename = f"{presentation.title}.pptx"
            return Response(
                content=file_content,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Presentation file not found"
    )

@router.get("/presentations/{presentation_id}", response_model=PresentationWithUrls)
def get_presentation(
    presentation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get a specific presentation with computed URLs."""
    statement = select(Presentation).where(
        Presentation.id == presentation_id,
        Presentation.owner_id == current_user.id
    )
    presentation = session.exec(statement).first()
    
    if not presentation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found"
        )
    
    return presentation_to_response(presentation)

@router.post("/presentations/bulk-delete")
async def bulk_delete_presentations(
    presentation_ids: List[int],
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete multiple presentations."""
    deleted_count = 0
    failed_ids = []
    
    for presentation_id in presentation_ids:
        try:
            success = await file_manager.delete_presentation_async(
                presentation_id, current_user.id, session
            )
            if success:
                deleted_count += 1
            else:
                failed_ids.append(presentation_id)
        except Exception as e:
            failed_ids.append(presentation_id)
    
    return {
        "deleted_count": deleted_count,
        "failed_ids": failed_ids,
        "message": f"Successfully deleted {deleted_count} presentations"
    }

def presentation_to_response(presentation: Presentation) -> PresentationWithUrls:
    """Convert Presentation model to response with computed URLs"""
    download_url = None
    if presentation.uploadthing_url:
        download_url = presentation.uploadthing_url
    elif presentation.file_path:
        download_url = f"/files/presentations/{presentation.id}/download"
    
    thumbnail_url = None
    if presentation.uploadthing_thumbnail_url:
        thumbnail_url = presentation.uploadthing_thumbnail_url
    elif presentation.thumbnail_path:
        thumbnail_url = presentation.thumbnail_path
    
    storage_type = "uploadthing" if presentation.uploadthing_url else "local" if presentation.file_path else "unknown"
    
    return PresentationWithUrls(
        id=presentation.id,
        title=presentation.title,
        description=presentation.description,
        created_at=presentation.created_at.isoformat(),
        updated_at=presentation.updated_at.isoformat(),
        owner_id=presentation.owner_id,
        file_path=presentation.file_path,
        thumbnail_path=presentation.thumbnail_path,
        uploadthing_url=presentation.uploadthing_url,
        uploadthing_key=presentation.uploadthing_key,
        uploadthing_thumbnail_url=presentation.uploadthing_thumbnail_url,
        uploadthing_thumbnail_key=presentation.uploadthing_thumbnail_key,
        file_size=presentation.file_size,
        download_url=download_url,
        thumbnail_url=thumbnail_url,
        storage_type=storage_type
    )
