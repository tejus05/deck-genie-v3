from typing import List, Optional
from pydantic import BaseModel

from ppt_generator.models.pptx_models import PptxPresentationModel
from ppt_generator.models.query_and_prompt_models import (
    ImagePromptWithThemeAndAspectRatio,
)
from ppt_generator.models.slide_model import SlideModel
from api.sql_models import PresentationSqlModel, SlideSqlModel


class GeneratePresentationRequirementsRequest(BaseModel):
    prompt: Optional[str] = None
    n_slides: int
    tone: str
    research_reports: Optional[List[str]] = None
    images: Optional[List[str]] = None


class GenerateTitleRequest(BaseModel):
    presentation_id: str


class PresentationGenerateRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None
    images: Optional[List[str]] = None
    watermark: bool = True
    titles: List[str]


class GenerateImageRequest(BaseModel):
    presentation_id: str
    prompt: ImagePromptWithThemeAndAspectRatio


class SearchImageRequest(BaseModel):
    presentation_id: str
    query: Optional[str] = None
    page: int = 1
    limit: int = 10


class UpdatePresentationThemeRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None


class ExportAsRequest(BaseModel):
    presentation_id: str
    pptx_model: PptxPresentationModel


class PresentationAndSlides(BaseModel):
    presentation: PresentationSqlModel
    slides: List[SlideSqlModel]

    def to_response_dict(self):
        presentation = self.presentation.model_dump(mode="json")
        return {
            "presentation": presentation,
            "slides": [each.model_dump(mode="json") for each in self.slides],
        }


class PresentationUpdateRequest(BaseModel):
    presentation_id: str
    slides: List[SlideModel]


class PresentationAndUrl(BaseModel):
    presentation_id: str
    url: str


class PresentationAndUrls(BaseModel):
    presentation_id: str
    urls: List[str]


class PresentationAndPath(BaseModel):
    presentation_id: str
    path: str


class PresentationAndPaths(BaseModel):
    presentation_id: str
    paths: List[str]


class UpdatePresentationTitlesRequest(BaseModel):
    presentation_id: str
    titles: List[str]
