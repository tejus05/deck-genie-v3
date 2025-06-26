import uuid
from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndUrls, SearchImageRequest
from api.services.logging import LoggingService
from image_processor.images_finder import search_images_for_selection


class SearchImageHandler:

    def __init__(self, data: SearchImageRequest):
        self.data = data

        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        # Search for images using Unsplash
        image_urls = []
        if self.data.query:
            image_urls = await search_images_for_selection(
                prompt=self.data.query,
                page=self.data.page,
                limit=self.data.limit
            )

        response = PresentationAndUrls(
            presentation_id=self.data.presentation_id, 
            urls=image_urls
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
