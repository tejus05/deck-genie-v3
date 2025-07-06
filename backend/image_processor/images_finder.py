import asyncio
import os
import uuid
import aiohttp
from typing import List

from ppt_generator.models.query_and_prompt_models import (
    ImagePromptWithThemeAndAspectRatio,
)
from api.utils import get_resource
from image_processor.unsplash_client import unsplash_client, UnsplashImage


async def generate_image(
    input: ImagePromptWithThemeAndAspectRatio,
    output_directory: str,
) -> str:
    image_prompt = f"{input.image_prompt}, {input.theme_prompt}"
    print(f"Request - Finding Image for {image_prompt}")

    try:
        # Use Unsplash to find high-quality images
        image_path = await search_and_download_image(image_prompt, output_directory, input.aspect_ratio.value)
        if image_path and os.path.exists(image_path):
            print(f"Successfully found image from Unsplash: {image_path}")
            return image_path
        
        # If Unsplash fails, return placeholder image
        print("Unsplash search failed, using placeholder image")
        return get_resource("assets/images/placeholder.jpg")

    except Exception as e:
        print(f"Error finding image: {e}")
        return get_resource("assets/images/placeholder.jpg")


async def search_and_download_image(prompt: str, output_directory: str, aspect_ratio: str) -> str:
    """Search for images on Unsplash and download the best match"""
    try:
        # Check if Unsplash client is available
        if not unsplash_client:
            print("Unsplash client not available")
            return ""
            
        # Determine orientation based on aspect ratio
        orientation = "landscape"  # default
        if aspect_ratio in ["2:3", "4:5", "9:16", "9:21"]:
            orientation = "portrait"
        elif aspect_ratio == "1:1":
            orientation = "squarish"
        
        # Search for images
        images = await unsplash_client.search_images(
            query=prompt,
            page=1,
            per_page=3,  # Get top 3 results
            orientation=orientation
        )
        
        if not images:
            print(f"No images found on Unsplash for query: {prompt}")
            return ""
        
        # Take the first (most relevant) image
        best_image = images[0]
        
        # Generate unique filename
        filename = f"{str(uuid.uuid4())}.jpg"
        output_path = os.path.join(output_directory, filename)
        
        # Download the image
        downloaded_path = await unsplash_client.download_image(best_image, output_path)
        
        if downloaded_path:
            print(f"Successfully downloaded image from Unsplash: {downloaded_path}")
            return downloaded_path
        else:
            print("Failed to download image from Unsplash")
            return ""
            
    except Exception as e:
        print(f"Error in search_and_download_image: {e}")
        return ""


async def search_images_for_selection(prompt: str, page: int = 1, limit: int = 10) -> List[str]:
    """Search for multiple images and return their URLs for user selection"""
    try:
        # Check if Unsplash client is available
        if not unsplash_client:
            print("Unsplash client not available")
            return []
            
        # Search for images with landscape orientation by default
        images = await unsplash_client.search_images(
            query=prompt,
            page=page,
            per_page=limit,
            orientation="landscape"
        )
        
        # Return the image URLs for display
        return [img.url for img in images]
        
    except Exception as e:
        print(f"Error searching images for selection: {e}")
        return []

