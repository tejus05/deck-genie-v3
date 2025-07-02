from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    picture: Optional[str] = None
    google_id: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    # Relationships
    presentations: List["Presentation"] = Relationship(back_populates="owner")
    files: List["UserFile"] = Relationship(back_populates="owner")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

# Presentation model for user-specific storage
class PresentationBase(SQLModel):
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Presentation(PresentationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    file_path: Optional[str] = None  # Path to the generated PPT file (for backward compatibility)
    thumbnail_path: Optional[str] = None  # Local thumbnail path (for backward compatibility)
    
    # UploadThing fields
    uploadthing_url: Optional[str] = None  # UploadThing file URL
    uploadthing_key: Optional[str] = None  # UploadThing file key for deletion
    uploadthing_thumbnail_url: Optional[str] = None  # UploadThing thumbnail URL
    uploadthing_thumbnail_key: Optional[str] = None  # UploadThing thumbnail key
    file_size: Optional[int] = None  # File size in bytes
    
    # Relationships
    owner: User = Relationship(back_populates="presentations")

class PresentationCreate(PresentationBase):
    pass

class PresentationRead(PresentationBase):
    id: int
    owner_id: int
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    
    # UploadThing fields
    uploadthing_url: Optional[str] = None
    uploadthing_key: Optional[str] = None
    uploadthing_thumbnail_url: Optional[str] = None
    uploadthing_thumbnail_key: Optional[str] = None
    file_size: Optional[int] = None
    
    # Computed fields for frontend
    @property
    def download_url(self) -> Optional[str]:
        """Get the download URL (UploadThing URL or API endpoint for legacy files)"""
        if self.uploadthing_url:
            return self.uploadthing_url
        elif self.file_path:
            return f"/files/presentations/{self.id}/download"
        return None
    
    @property
    def thumbnail_url(self) -> Optional[str]:
        """Get the thumbnail URL (UploadThing thumbnail or local path)"""
        if self.uploadthing_thumbnail_url:
            return self.uploadthing_thumbnail_url
        elif self.thumbnail_path:
            return self.thumbnail_path
        return None
    
    @property
    def storage_type(self) -> str:
        """Identify the storage type for this presentation"""
        if self.uploadthing_url:
            return "uploadthing"
        elif self.file_path:
            return "local"
        return "unknown"

# File management model
class UserFileBase(SQLModel):
    filename: str
    file_type: str  # 'ppt', 'pdf', 'image', etc.
    file_size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class UserFile(UserFileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    file_path: str
    
    # Relationships
    owner: User = Relationship(back_populates="files")

class UserFileRead(UserFileBase):
    id: int
    owner_id: int
    file_path: str
