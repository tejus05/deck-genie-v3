import os
import asyncio
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from ppt_config_generator.models import PresentationTitlesModel
from ppt_generator.fix_validation_errors import get_validated_response

user_prompt_text = {
    "type": "text",
    "text": """
                **Input:**
                - Prompt: {prompt}
                - Presentation Tone: {tone}
                - Content: {content}
            """,
}


def get_prompt_template():
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                    Generate a specific, descriptive title for the presentation and individual slide titles based on the prompt and additional information.

                    # IMPORTANT: You must generate an actual, specific presentation title - NOT a generic placeholder or instruction.

                    # Steps
                    1. Analyze the prompt and additional information carefully.
                    2. Create a specific, descriptive presentation title that captures the main topic/theme.
                    3. Determine the optimal number of slides (5-20) based on content complexity and depth.
                    4. If the user specifies "I need X slides" or "Create X slides" in the prompt, respect that requirement.
                    5. Use provided input or any information you have on this topic.
                    6. Check if slide titles are provided in **Input**.
                    7. Generate title for each slide based on logical content flow.
                    8. If slide titles are provided in **Input** then use them as it is.
                    9. In case if slides for chapter is provided then analyze all chapter content and then structurally generate titles considering all slide content. \
                        Keep the flow as per given chapter content. Ensure that titles are generated to cover all the content in the chapter.

                    # Title Generation Rules
                    - The presentation title must be SPECIFIC to the content, not generic
                    - Use 3-8 words that describe what the presentation is actually about
                    - Examples of GOOD titles: "Digital Marketing Strategy 2024", "AI in Healthcare Applications", "Quarterly Sales Performance Review"
                    - Examples of BAD titles: "Presentation", "Title of Presentation", "Business Presentation"

                    # Tone Guidelines
                    Apply the specified tone when creating titles:
                    - **Investor Pitch**: Use compelling, growth-oriented titles that highlight opportunities and returns
                    - **Executive**: Create strategic, high-level titles focused on business outcomes
                    - **Technical**: Use precise, specific titles that emphasize methodology and implementation
                    - **Startup Pitch**: Generate energetic, innovative titles that showcase disruption and potential
                    - **Conversational**: Create friendly, accessible titles that are easy to understand
                    - **Professional**: Maintain balanced, business-appropriate titles suitable for general audiences

                    # Content Analysis Guidelines
                    - **Simple Topics** (basic concepts, introductions): 5-8 slides
                    - **Medium Complexity** (business processes, product features): 8-12 slides  
                    - **Complex Topics** (technical deep-dives, comprehensive analysis): 12-16 slides
                    - **Very Complex** (detailed research, multi-faceted subjects): 16-20 slides

                    # Notes
                    - Apply the specified tone from **Input** to all titles.
                    - Analyze content depth and complexity to determine optimal slide count.
                    - Respect explicit user requirements for slide count when mentioned in prompt.
                    - Ensure the prompt and additional information remains the main focus of the presentation.
                    - **Additional Information** serves as supporting information, providing depth and details.
                    - Slide titles should maintain a logical and coherent flow throughout the presentation.
                    - Slide **Title** should not contain slide number like (Slide 1, Slide 2, etc)
                    - Slide **Title** can have 3 to 8 words.
                    - Slide **Title** must not use any other special characters except ":".
                    - Presentation **Title** should be around 3 to 8 words.
                    - Extract titles from the **Additional Information** or **Prompt** if provided.
                    - If presentation flow is mentioned in **Additional Information** then use it to generate titles.
                    - If Chapter Content is provided than strictly adhere to it and then generate titles in the same content flow as chapter content.
                """,
            ),
            (
                "user",
                [user_prompt_text],
            ),
        ],
    )


async def generate_ppt_titles(
    prompt: Optional[str],
    content: Optional[str],
    tone: Optional[str] = None,
    max_retries: int = 3,
) -> PresentationTitlesModel:
    """Generate presentation titles with retry logic for API failures."""
    
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            model = (
                ChatGoogleGenerativeAI(model="gemini-2.0-flash")
                if os.getenv("LLM") == "google"
                else ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp")
            ).with_structured_output(PresentationTitlesModel.model_json_schema())

            chain = get_prompt_template() | model

            response = await get_validated_response(
                chain,
                {
                    "prompt": prompt,
                    "tone": tone or "Professional",
                    "content": content,
                },
                PresentationTitlesModel,
            )
            
            # Post-process to ensure we have a meaningful title
            if (not response.presentation_title or 
                response.presentation_title.lower() in ["presentation", "title", "untitled"] or
                "title of" in response.presentation_title.lower() or
                len(response.presentation_title.strip()) < 3):
                
                # Generate a fallback title from the prompt
                if prompt and len(prompt.strip()) > 0:
                    words = prompt.strip().split()[:4]
                    response.presentation_title = " ".join(words).title()
                else:
                    response.presentation_title = "Business Presentation"
            
            return response
            
        except Exception as e:
            last_exception = e
            error_str = str(e).lower()
            
            # If it's a quota exceeded error, provide fallback immediately
            if "quota" in error_str or "exceeded" in error_str:
                print("Quota exceeded, using fallback title generation")
                return _generate_fallback_titles(prompt, content, tone)
            
            # If it's a rate limit error, don't retry immediately
            if "rate limit" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # Exponential backoff
                    await asyncio.sleep(wait_time)
                continue
            
            # For other errors, retry with shorter delay
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
                continue
            
            # If all retries failed, use fallback
            print(f"All retries failed: {str(e)}, using fallback title generation")
            return _generate_fallback_titles(prompt, content, tone)
    
    # This should never be reached, but just in case
    return _generate_fallback_titles(prompt, content, tone)


def _generate_fallback_titles(prompt: Optional[str], content: Optional[str], tone: Optional[str]) -> PresentationTitlesModel:
    """Generate fallback titles when API is unavailable."""
    
    # Generate presentation title from prompt
    if prompt and len(prompt.strip()) > 0:
        # Take first few meaningful words
        words = [w for w in prompt.strip().split() if len(w) > 2][:5]
        presentation_title = " ".join(words).title()
    else:
        presentation_title = "Business Presentation"
    
    # Generate basic slide titles based on common business presentation structure
    titles = [
        f"{presentation_title} - Introduction",
        "Problem Statement",
        "Our Solution",
        "Product Demo",
        "Market Opportunity", 
        "Business Model",
        "Traction & Results",
        "Team Overview",
        "Go-to-Market Strategy",
        "Financial Projections",
        "Closing & Next Steps"
    ]
    
    # If prompt contains specific keywords, customize titles
    if prompt:
        prompt_lower = prompt.lower()
        if "startup" in prompt_lower or "funding" in prompt_lower:
            titles = [
                f"{presentation_title}",
                "Problem & Market Need",
                "Our Solution",
                "Product Demo",
                "Market Size & Opportunity",
                "Business Model",
                "Traction & Metrics",
                "Team & Advisors", 
                "Funding Ask",
                "Use of Funds",
                "Thank You & Q&A"
            ]
        elif "product" in prompt_lower:
            titles = [
                f"{presentation_title}",
                "Market Problem",
                "Product Overview",
                "Key Features",
                "User Benefits",
                "Competition Analysis",
                "Go-to-Market",
                "Roadmap",
                "Pricing Strategy",
                "Next Steps"
            ]
    
    return PresentationTitlesModel(
        presentation_title=presentation_title,
        titles=titles[:10]  # Limit to 10 slides
    )
