import uuid

from api.models import LogMetadata
from api.routers.presentation.models import GenerateTitleRequest
from api.services.instances import temp_file_service
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel
from ppt_config_generator.models import PresentationTitlesModel
from ppt_config_generator.ppt_title_summary_generator import generate_ppt_titles
from api.services.database import get_sql_session

# Add authentication import
from auth.models import User


class PresentationTitlesGenerateHandler:
    def __init__(self, data: GenerateTitleRequest, current_user: User = None):
        self.data = data
        self.current_user = current_user

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(
                PresentationSqlModel, self.data.presentation_id
            )

            presentation_titles: PresentationTitlesModel = await generate_ppt_titles(
                presentation.prompt,
                presentation.summary,
                presentation.tone,
            )

            presentation.title = presentation_titles.presentation_title
            presentation.titles = presentation_titles.titles
            presentation.n_slides = len(presentation_titles.titles)  # Update with dynamic count

            sql_session.commit()
            sql_session.refresh(presentation)

        logging_service.logger.info(
            logging_service.message(presentation.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return presentation
