import os
import uuid
from typing import List
from fastapi import UploadFile

from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndPaths
from api.services.logging import LoggingService
from api.services.instances import temp_file_service


class UploadImagesHandler:

    def __init__(self, images: List[UploadFile]):
        self.images = images
        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(
                {
                    "images_count": len(self.images),
                }
            ),
            extra=log_metadata.model_dump(),
        )

        # Create uploads directory in data directory
        data_directory = os.getenv("APP_DATA_DIRECTORY", os.path.join(os.getcwd(), "data"))
        uploads_dir = os.path.join(data_directory, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        uploaded_paths = []

        for index, image in enumerate(self.images):
            # Generate unique filename with original extension
            original_filename = image.filename or "image.jpg"
            file_extension = os.path.splitext(original_filename)[1] or ".jpg"
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Save to uploads directory
            image_path = os.path.join(uploads_dir, unique_filename)
            
            with open(image_path, "wb") as f:
                content = await image.read()
                f.write(content)
            
            # Store relative path that can be accessed via /static/
            uploaded_paths.append(f"uploads/{unique_filename}")

        response = PresentationAndPaths(
            presentation_id="",  # Not tied to specific presentation
            paths=uploaded_paths
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
