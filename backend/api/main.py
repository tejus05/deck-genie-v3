import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlmodel import SQLModel
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from api.routers.presentation.router import presentation_router
from api.routers.config import router as config_router
from api.services.database import sql_engine
from api.services.presentation_storage import presentation_storage
from api.utils import update_env_with_user_config

# Import authentication components
from auth.routes import router as auth_router
from auth.oauth import oauth_router
from routers.files import router as files_router
from services.database import create_db_and_tables


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create data directory if it doesn't exist
    app_data_dir = os.getenv("APP_DATA_DIRECTORY", "./data")
    os.makedirs(app_data_dir, exist_ok=True)
    
    SQLModel.metadata.create_all(sql_engine)
    
    # Create authentication database tables
    create_db_and_tables()
    
    yield


app = FastAPI(lifespan=lifespan)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for legacy data (config, db, etc.)
data_directory = os.getenv("APP_DATA_DIRECTORY", os.path.join(os.getcwd(), "data"))
app.mount("/static", StaticFiles(directory=data_directory), name="static")

# Mount presentations from temp directory - using a custom static handler for better cross-platform support
app.mount("/presentations", StaticFiles(directory=presentation_storage.presentation_base_dir, follow_symlink=True), name="presentations")


@app.middleware("http")
async def update_env_middleware(request: Request, call_next):
    update_env_with_user_config()
    return await call_next(request)


@app.get("/download/{presentation_id}/{filename}")
async def download_file(presentation_id: str, filename: str):
    file_path = presentation_storage.get_presentation_file_path(presentation_id, filename)

    if os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            media_type="application/octet-stream",
            filename=filename,
        )
    else:
        # Try direct path in storage directory for legacy files
        direct_path = os.path.join(presentation_storage.presentation_base_dir, filename)
        if os.path.exists(direct_path):
            return FileResponse(
                path=direct_path,
                media_type="application/octet-stream",
                filename=filename,
            )

    return {"error": "File not found"}

@app.get("/images/{presentation_id}/{filename}")
async def serve_image(presentation_id: str, filename: str):
    """Serve images with proper cross-platform path handling"""
    # Try presentation images directory first
    images_dir = presentation_storage.get_presentation_images_dir(presentation_id)
    image_path = os.path.join(images_dir, filename)
    
    if os.path.exists(image_path):
        # Determine media type based on file extension
        ext = filename.lower().split('.')[-1]
        media_type = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg', 
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }.get(ext, 'image/jpeg')
        
        return FileResponse(
            path=image_path,
            media_type=media_type,
            filename=filename,
        )
    
    return {"error": "Image not found"}

@app.middleware("http")
async def catch_static_errors(request: Request, call_next):
    """Catch and log static file serving errors for debugging"""
    response = await call_next(request)
    
    # Log 404s for static files to help debug Windows path issues
    if response.status_code == 404 and ("/static/" in str(request.url) or "/presentations/" in str(request.url)):
        print(f"Static file not found: {request.url}")
        print(f"Looking for: {request.url.path}")
        # Decode URL-encoded paths for debugging
        import urllib.parse
        decoded_path = urllib.parse.unquote(str(request.url.path))
        print(f"Decoded path: {decoded_path}")
    
    return response

@app.get("/storage/stats")
async def get_storage_stats():
    """Get current storage statistics."""
    return presentation_storage.get_storage_stats()


@app.post("/storage/cleanup")
async def manual_cleanup():
    """Manually trigger cleanup of old presentations."""
    presentation_storage.cleanup_old_presentations()
    return {"message": "Cleanup completed", "stats": presentation_storage.get_storage_stats()}


@app.delete("/storage/presentation/{presentation_id}")
async def delete_presentation(presentation_id: str):
    """Delete a specific presentation."""
    success = presentation_storage.delete_presentation(presentation_id)
    if success:
        return {"message": f"Presentation {presentation_id} deleted successfully"}
    else:
        return {"error": f"Failed to delete presentation {presentation_id}"}
        

app.include_router(presentation_router)
app.include_router(config_router)
app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(files_router)
