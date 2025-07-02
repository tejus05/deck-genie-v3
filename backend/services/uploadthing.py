"""
UploadThing service for handling file uploads to UploadThing cloud storage.
This service provides functionality for uploading PPT files using HTTP API.
"""

import os
import tempfile
from typing import Optional, Dict, Any
import aiohttp
from dotenv import load_dotenv

load_dotenv()

class UploadThingService:
    """Service for managing file uploads to UploadThing using HTTP API."""
    
    def __init__(self):
        self.secret_key = os.getenv("UPLOADTHING_SECRET")
        if not self.secret_key:
            raise ValueError("UPLOADTHING_SECRET environment variable is required")
        
        self.base_url = "https://api.uploadthing.com"
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
    
    async def upload_presentation(
        self, 
        file_content: bytes, 
        filename: str, 
        user_id: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """
        Upload a presentation file to UploadThing via HTTP API.
        
        Args:
            file_content: The PPT file content as bytes
            filename: Name of the file
            user_id: ID of the user who owns this presentation
            metadata: Additional metadata to store with the file
            
        Returns:
            Dict containing url, key, and other upload info
        """
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=".pptx", delete=False) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            # Prepare form data for upload
            upload_metadata = {
                "user_id": str(user_id),
                "file_type": "presentation",
                "original_filename": filename,
                **(metadata or {})
            }
            
            async with aiohttp.ClientSession() as session:
                with open(temp_file_path, 'rb') as f:
                    data = aiohttp.FormData()
                    data.add_field('file', f, filename=filename, content_type='application/vnd.openxmlformats-officedocument.presentationml.presentation')
                    data.add_field('metadata', str(upload_metadata))
                    
                    async with session.post(
                        f"{self.base_url}/upload",
                        data=data,
                        headers={"Authorization": f"Bearer {self.secret_key}"}
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return {
                                "url": result.get("url", ""),
                                "key": result.get("key", ""),
                                "filename": filename,
                                "size": len(file_content)
                            }
                        else:
                            raise Exception(f"Upload failed with status {response.status}")
            
        except Exception as e:
            raise Exception(f"Failed to upload presentation to UploadThing: {str(e)}")
        finally:
            # Clean up temporary file
            if 'temp_file_path' in locals():
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
    
    async def delete_file(self, file_key: str) -> bool:
        """
        Delete a file from UploadThing via HTTP API.
        
        Args:
            file_key: The UploadThing key of the file to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.delete(
                    f"{self.base_url}/files/{file_key}",
                    headers=self.headers
                ) as response:
                    return response.status == 200
        except Exception as e:
            print(f"Failed to delete file from UploadThing: {str(e)}")
            return False

# Global instance
uploadthing_service = UploadThingService()
