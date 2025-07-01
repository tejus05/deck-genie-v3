import uuid
from api.models import LogMetadata
from api.routers.presentation.models import GeneratePresentationRequirementsRequest
from api.services.logging import LoggingService
from api.services.database import get_sql_session
from api.services.instances import temp_file_service
from api.sql_models import PresentationSqlModel

# Add authentication import
from auth.models import User


class GeneratePresentationRequirementsHandler:
    def __init__(
        self,
        presentation_id: str,
        data: GeneratePresentationRequirementsRequest,
        current_user: User = None,
    ):
        self.data = data
        self.presentation_id = presentation_id
        self.current_user = current_user
        self.prompt = data.prompt
        self.tone = data.tone
        self.research_reports = data.research_reports or []
        self.images = data.images or []

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        # Create presentation without document processing
        presentation = PresentationSqlModel(
            id=self.presentation_id,
            prompt=self.prompt,
            n_slides=0,  # Will be determined dynamically by AI
            tone=self.tone,
            summary="",  # No summary since we don't process documents
        )

        with get_sql_session() as sql_session:
            sql_session.add(presentation)
            sql_session.commit()
            sql_session.refresh(presentation)

        logging_service.logger.info(
            logging_service.message(presentation.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return presentation
