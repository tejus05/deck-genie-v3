import os
from fastapi import HTTPException, Response
from api.services.logging import LoggingService
from api.models import LogMetadata
from api.utils import get_presentation_dir, sanitize_filename
from api.sql_models import PresentationSqlModel
from api.services.database import get_sql_session
from auth.models import User


class DownloadPptxHandler:

    def __init__(self, presentation_id: str, current_user: User = None):
        self.presentation_id = presentation_id
        self.current_user = current_user
        self.presentation_dir = get_presentation_dir(self.presentation_id)

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            f"Downloading PPTX for presentation {self.presentation_id}",
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(
                PresentationSqlModel, self.presentation_id
            )

            if not presentation:
                raise HTTPException(status_code=404, detail="Presentation not found")

            # Check if file exists in database
            if not presentation.file or not os.path.exists(presentation.file):
                raise HTTPException(status_code=404, detail="Presentation file not found")

            # Generate filename
            title = presentation.title
            if (not title or 
                title == "Title of this presentation in about 3 to 8 words" or
                title == "Presentation" or
                len(title.strip()) == 0):
                if presentation.prompt and len(presentation.prompt.strip()) > 0:
                    words = presentation.prompt.strip().split()[:4]
                    title = " ".join(words).title()
                else:
                    title = f"Presentation {presentation.id[:8]}"

            filename = sanitize_filename(f"{title}.pptx")
            
            # Read the file content
            try:
                with open(presentation.file, "rb") as file:
                    file_content = file.read()
            except Exception as e:
                logging_service.logger.error(
                    f"Error reading presentation file: {str(e)}",
                    extra=log_metadata.model_dump(),
                )
                raise HTTPException(status_code=500, detail="Error reading presentation file")

            logging_service.logger.info(
                f"Successfully read presentation file for download: {filename}",
                extra=log_metadata.model_dump(),
            )

            # Return the file as a downloadable attachment
            return Response(
                content=file_content,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
