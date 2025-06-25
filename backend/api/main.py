import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from api.routers.presentation.router import presentation_router
from api.routers.config import router as config_router
from api.services.database import sql_engine
from api.utils import update_env_with_user_config


@asynccontextmanager
async def lifespan(_: FastAPI):
    os.makedirs(os.getenv("APP_DATA_DIRECTORY"), exist_ok=True)
    SQLModel.metadata.create_all(sql_engine)
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

# Mount static files
data_directory = os.getenv("APP_DATA_DIRECTORY", os.path.join(os.getcwd(), "data"))
app.mount("/static", StaticFiles(directory=data_directory), name="static")


@app.middleware("http")
async def update_env_middleware(request: Request, call_next):
    update_env_with_user_config()
    return await call_next(request)


@app.get("/download/{presentation_id}/{filename}")
async def download_file(presentation_id: str, filename: str):
    data_directory = os.getenv("APP_DATA_DIRECTORY", os.path.join(os.getcwd(), "data"))
    file_path = os.path.join(data_directory, presentation_id, filename)

    if os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            media_type="application/octet-stream",
            filename=filename,
        )
    else:
        # Try direct path in data directory
        direct_path = os.path.join(data_directory, filename)
        if os.path.exists(direct_path):
            return FileResponse(
                path=direct_path,
                media_type="application/octet-stream",
                filename=filename,
            )

    return {"error": "File not found"}


app.include_router(presentation_router)
app.include_router(config_router)
