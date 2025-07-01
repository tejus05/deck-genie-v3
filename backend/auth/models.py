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
    file_path: str  # Path to the generated PPT file
    thumbnail_path: Optional[str] = None
    
    # Relationships
    owner: User = Relationship(back_populates="presentations")

class PresentationCreate(PresentationBase):
    pass

class PresentationRead(PresentationBase):
    id: int
    owner_id: int
    file_path: str
    thumbnail_path: Optional[str] = None

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
