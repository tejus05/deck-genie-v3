import os
import tempfile
from typing import Optional, Dict, Any
import aiohttp
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

class UploadThingService:
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
        try:
            with tempfile.NamedTemporaryFile(suffix=".pptx", delete=False) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
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
            if 'temp_file_path' in locals():
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
    
    async def delete_file(self, file_key: str) -> bool:
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

uploadthing_service = UploadThingService()
