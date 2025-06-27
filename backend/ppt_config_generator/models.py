from typing import List
from pydantic import BaseModel, Field


class PresentationTitlesModel(BaseModel):
    presentation_title: str = Field(
        description="Generate a specific and descriptive title for this presentation in 3 to 8 words based on the content"
    )
    titles: List[str] = Field(
        description="List of title of every slide in presentation in about 2 to 8 words"
    )
