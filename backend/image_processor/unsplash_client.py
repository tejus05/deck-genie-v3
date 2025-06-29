import os
import asyncio
import aiohttp
from typing import List, Optional
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI


class UnsplashImage(BaseModel):
    id: str
    url: str
    alt_description: Optional[str] = None
    width: int
    height: int
    download_url: str


class UnsplashClient:
    def __init__(self):
        self.api_key = os.getenv("UNSPLASH_API_KEY")
        if not self.api_key:
            print("Warning: UNSPLASH_API_KEY environment variable not found")
            self.api_key = None
        
        self.base_url = "https://api.unsplash.com"
        self.headers = {
            "Authorization": f"Client-ID {self.api_key}" if self.api_key else "",
            "Accept": "application/json"
        }

    async def generate_search_keywords(self, prompt: str) -> str:
        """Use Gemini to generate relevant keywords for Unsplash search"""
        try:
            keyword_prompt = f"""
            Given this image prompt, generate 3-5 relevant keywords that would help find high-quality stock photos on Unsplash.
            Focus on concrete, visual elements that photographers would capture.
            
            Image prompt: {prompt}
            
            Return only the keywords separated by spaces, no additional text.
            Examples:
            - "business meeting office" for corporate scenes
            - "nature landscape mountains" for outdoor scenes
            - "technology laptop workspace" for tech-related images
            """
            
            llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
            response = await llm.ainvoke([keyword_prompt])
            
            # Extract keywords from response
            keywords = response.content.strip()
            return keywords
            
        except Exception as e:
            print(f"Error generating keywords with Gemini: {e}")
            # Fallback to using the original prompt
            return prompt[:100]  # Limit length for API

    async def search_images(
        self, 
        query: str, 
        page: int = 1, 
        per_page: int = 10,
        orientation: str = "landscape"
    ) -> List[UnsplashImage]:
        """Search for images on Unsplash"""
        try:
            # Check if API key is available
            if not self.api_key:
                print("Unsplash API key not available, returning empty results")
                return []
            
            # Generate better search keywords using Gemini
            search_keywords = await self.generate_search_keywords(query)
            
            url = f"{self.base_url}/search/photos"
            params = {
                "query": search_keywords,
                "page": page,
                "per_page": min(per_page, 30),  # Unsplash limits to 30 per page
                "orientation": orientation,
                "order_by": "relevant",
                "content_filter": "high"  # Filter out potentially inappropriate content
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params) as response:
                    if response.status != 200:
                        print(f"Unsplash API error: {response.status} - {await response.text()}")
                        return []
                    
                    data = await response.json()
                    results = data.get("results", [])
                    
                    images = []
                    for result in results:
                        try:
                            # Use regular quality for better performance
                            image_url = result["urls"]["regular"]
                            download_url = result["links"]["download"]
                            
                            images.append(UnsplashImage(
                                id=result["id"],
                                url=image_url,
                                alt_description=result.get("alt_description"),
                                width=result["width"],
                                height=result["height"],
                                download_url=download_url
                            ))
                        except KeyError as e:
                            print(f"Error parsing Unsplash result: {e}")
                            continue
                    
                    return images
                    
        except Exception as e:
            print(f"Error searching Unsplash: {e}")
            return []

    async def download_image(self, unsplash_image: UnsplashImage, output_path: str) -> str:
        """Download an image from Unsplash to local storage"""
        try:
            # Normalize path for cross-platform compatibility
            output_path = os.path.normpath(output_path)
            
            async with aiohttp.ClientSession() as session:
                # First, trigger the download endpoint to credit the photographer
                try:
                    async with session.get(unsplash_image.download_url, headers=self.headers):
                        pass  # Just trigger the download tracking
                except:
                    pass  # Don't fail if tracking fails
                
                # Download the actual image
                async with session.get(unsplash_image.url) as response:
                    if response.status == 200:
                        os.makedirs(os.path.dirname(output_path), exist_ok=True)
                        with open(output_path, 'wb') as f:
                            f.write(await response.read())
                        return output_path
                    else:
                        print(f"Failed to download image: {response.status}")
                        return ""
                        
        except Exception as e:
            print(f"Error downloading image: {e}")
            return ""


# Global instance with error handling
try:
    unsplash_client = UnsplashClient()
except Exception as e:
    print(f"Failed to initialize Unsplash client: {e}")
    unsplash_client = None
