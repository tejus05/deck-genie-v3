from typing import Annotated, List, Optional
import uuid
from fastapi import APIRouter, Body, File, UploadFile, Depends

# Add authentication imports
from auth.middleware import get_current_active_user
from auth.models import User

from api.models import SessionModel
from api.request_utils import RequestUtils
from api.routers.presentation.handlers.delete_presentation import (
    DeletePresentationHandler,
)
from api.routers.presentation.handlers.delete_slide import DeleteSlideHandler
from api.routers.presentation.handlers.download_pptx import DownloadPptxHandler
from api.routers.presentation.handlers.export_as_pptx import ExportAsPptxHandler
from api.routers.presentation.handlers.generate_data import (
    PresentationGenerateDataHandler,
)
from api.routers.presentation.handlers.generate_image import GenerateImageHandler
from api.routers.presentation.handlers.generate_presentation_requirements import (
    GeneratePresentationRequirementsHandler,
)
from api.routers.presentation.handlers.generate_stream import (
    PresentationGenerateStreamHandler,
)
from api.routers.presentation.handlers.generate_titles import (
    PresentationTitlesGenerateHandler,
)
from api.routers.presentation.handlers.get_presentation import GetPresentationHandler
from api.routers.presentation.handlers.get_presentations import GetPresentationsHandler
from api.routers.presentation.handlers.update_presentation_theme import (
    UpdatePresentationThemeHandler,
)
from api.routers.presentation.handlers.update_slide_models import (
    UpdateSlideModelsHandler,
)
from api.routers.presentation.handlers.upload_presentation_thumbnail import (
    UploadPresentationThumbnailHandler,
)
from api.routers.presentation.models import (
    ExportAsRequest,
    GenerateImageRequest,
    GeneratePresentationRequirementsRequest,
    PresentationAndPath,
    PresentationAndPaths,
    PresentationAndSlides,
    GenerateTitleRequest,
    PresentationGenerateRequest,
    UpdatePresentationThemeRequest,
    PresentationUpdateRequest,
)
from api.sql_models import PresentationSqlModel
from api.utils import handle_errors
from ppt_generator.models.slide_model import SlideModel

presentation_router = APIRouter(prefix="/ppt")


@presentation_router.get(
    "/user_presentations", response_model=List[PresentationSqlModel]
)
async def get_user_presentations():
    request_utils = RequestUtils("/ppt/user_presentations")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        GetPresentationsHandler().get, logging_service, log_metadata
    )


@presentation_router.get("/presentation", response_model=PresentationAndSlides)
async def get_presentation_from_id(presentation_id: str):
    request_utils = RequestUtils("/ppt/presentation")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        GetPresentationHandler(presentation_id).get, logging_service, log_metadata
    )


@presentation_router.post("/create", response_model=PresentationSqlModel)
async def create_presentation(
    data: GeneratePresentationRequirementsRequest,
    current_user: User = Depends(get_current_active_user)
):
    request_utils = RequestUtils("/ppt/create")
    presentation_id = str(uuid.uuid4())
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        GeneratePresentationRequirementsHandler(presentation_id, data, current_user).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/titles/generate", response_model=PresentationSqlModel)
async def generate_titles(
    data: GenerateTitleRequest,
    current_user: User = Depends(get_current_active_user)
):
    request_utils = RequestUtils("/ppt/titles/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        PresentationTitlesGenerateHandler(data, current_user).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/generate/data", response_model=SessionModel)
async def submit_presentation_generation_data(
    data: PresentationGenerateRequest,
):
    request_utils = RequestUtils("/ppt/generate/data")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        PresentationGenerateDataHandler(data).post, logging_service, log_metadata
    )


@presentation_router.get("/generate/stream")
async def presentation_generation_stream(presentation_id: str, session: str):
    request_utils = RequestUtils("/ppt/generate/stream")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        PresentationGenerateStreamHandler(presentation_id, session).get,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/presentation/thumbnail", response_model=PresentationAndPath)
async def update_presentation(
    presentation_id: Annotated[str, Body()],
    thumbnail: Annotated[UploadFile, File()],
):
    request_utils = RequestUtils("/ppt/presentation/thumbnail")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        UploadPresentationThumbnailHandler(presentation_id, thumbnail).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/presentation/theme")
async def update_presentation(
    data: UpdatePresentationThemeRequest,
):
    request_utils = RequestUtils("/ppt/presentation/theme")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        UpdatePresentationThemeHandler(data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/slides/update", response_model=PresentationAndSlides)
async def update_slide_models(data: PresentationUpdateRequest):
    request_utils = RequestUtils("/ppt/slides/update")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        UpdateSlideModelsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/image/generate", response_model=PresentationAndPaths)
async def generate_image(data: GenerateImageRequest):
    request_utils = RequestUtils("/ppt/image/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        GenerateImageHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post(
    "/presentation/export_as_pptx", response_model=PresentationAndPath
)
async def export_as_pptx(
    data: ExportAsRequest,
    current_user: User = Depends(get_current_active_user)
):
    request_utils = RequestUtils("/ppt/presentation/export_as_pptx")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        ExportAsPptxHandler(data, current_user).post, logging_service, log_metadata
    )


@presentation_router.get("/presentation/download_pptx/{presentation_id}")
async def download_pptx(
    presentation_id: str,
    current_user: User = Depends(get_current_active_user)
):
    request_utils = RequestUtils("/ppt/presentation/download_pptx")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        DownloadPptxHandler(presentation_id, current_user).get, logging_service, log_metadata
    )


@presentation_router.delete("/delete", status_code=204)
async def delete_presentation(presentation_id: str):
    request_utils = RequestUtils("/ppt/delete")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        DeletePresentationHandler(presentation_id).delete, logging_service, log_metadata
    )


@presentation_router.delete("/slide/delete", status_code=204)
async def delete_slide(slide_id: str, presentation_id: str):
    request_utils = RequestUtils("/ppt/slide/delete")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        DeleteSlideHandler(slide_id).delete, logging_service, log_metadata
    )
