import os
import tempfile
import threading
import time
import uuid
import json
from datetime import datetime, timedelta
from typing import Optional
import shutil

from api.services.temp_file import TempFileService


class PresentationStorageService:
    """
    Service for managing presentation storage in OS temp directory with automatic cleanup.
    """
    
    def __init__(self, cleanup_after_hours: int = 24):
        self.temp_service = TempFileService()
        
        # Try to read cleanup time from config, fallback to default
        try:
            config_path = os.path.join(os.getenv("APP_DATA_DIRECTORY", ""), "config.json")
            if os.path.exists(config_path):
                with open(config_path, "r") as f:
                    config = json.load(f)
                    self.cleanup_after_hours = config.get("presentation_cleanup_hours", cleanup_after_hours)
            else:
                self.cleanup_after_hours = cleanup_after_hours
        except Exception:
            self.cleanup_after_hours = cleanup_after_hours
            
        self.presentation_base_dir = os.path.join(
            tempfile.gettempdir(), 
            "deck_genie_presentations"
        )
        os.makedirs(self.presentation_base_dir, exist_ok=True)
        
        # Start cleanup daemon thread
        self._start_cleanup_daemon()
    
    def _start_cleanup_daemon(self):
        """Start a daemon thread that periodically cleans up old presentations."""
        def cleanup_daemon():
            while True:
                try:
                    self.cleanup_old_presentations()
                    # Run cleanup every hour
                    time.sleep(3600)
                except Exception as e:
                    print(f"Cleanup daemon error: {e}")
                    time.sleep(3600)  # Continue running even if there's an error
        
        cleanup_thread = threading.Thread(target=cleanup_daemon, daemon=True)
        cleanup_thread.start()
    
    def get_presentation_dir(self, presentation_id: str) -> str:
        """Get the directory for a specific presentation, creating it if it doesn't exist."""
        presentation_dir = os.path.join(self.presentation_base_dir, presentation_id)
        os.makedirs(presentation_dir, exist_ok=True)
        
        # Create a timestamp file to track when this presentation was created
        timestamp_file = os.path.join(presentation_dir, ".created_at")
        if not os.path.exists(timestamp_file):
            with open(timestamp_file, "w") as f:
                f.write(str(datetime.now().timestamp()))
        
        return presentation_dir
    
    def get_presentation_images_dir(self, presentation_id: str) -> str:
        """Get the images directory for a specific presentation."""
        images_dir = os.path.join(self.get_presentation_dir(presentation_id), "images")
        os.makedirs(images_dir, exist_ok=True)
        return images_dir
    
    def get_presentation_file_path(self, presentation_id: str, filename: str) -> str:
        """Get the full path for a file within a presentation directory."""
        return os.path.join(self.get_presentation_dir(presentation_id), filename)
    
    def store_presentation_file(self, presentation_id: str, filename: str, content: bytes) -> str:
        """Store a file for a presentation and return the file path."""
        file_path = self.get_presentation_file_path(presentation_id, filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        return file_path
    
    def get_presentation_file(self, presentation_id: str, filename: str) -> Optional[bytes]:
        """Retrieve a file for a presentation."""
        file_path = self.get_presentation_file_path(presentation_id, filename)
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, "rb") as f:
            return f.read()
    
    def presentation_exists(self, presentation_id: str) -> bool:
        """Check if a presentation directory exists."""
        return os.path.exists(self.get_presentation_dir(presentation_id))
    
    def delete_presentation(self, presentation_id: str) -> bool:
        """Delete a specific presentation and all its files."""
        presentation_dir = os.path.join(self.presentation_base_dir, presentation_id)
        
        if os.path.exists(presentation_dir):
            try:
                shutil.rmtree(presentation_dir)
                return True
            except Exception as e:
                print(f"Error deleting presentation {presentation_id}: {e}")
                return False
        
        return False
    
    def cleanup_old_presentations(self):
        """Remove presentations older than the configured cleanup time."""
        if not os.path.exists(self.presentation_base_dir):
            return
        
        cutoff_time = datetime.now() - timedelta(hours=self.cleanup_after_hours)
        cutoff_timestamp = cutoff_time.timestamp()
        
        cleaned_count = 0
        
        for presentation_id in os.listdir(self.presentation_base_dir):
            presentation_dir = os.path.join(self.presentation_base_dir, presentation_id)
            
            if not os.path.isdir(presentation_dir):
                continue
            
            # Check timestamp file
            timestamp_file = os.path.join(presentation_dir, ".created_at")
            should_delete = False
            
            if os.path.exists(timestamp_file):
                try:
                    with open(timestamp_file, "r") as f:
                        created_timestamp = float(f.read().strip())
                    
                    if created_timestamp < cutoff_timestamp:
                        should_delete = True
                except (ValueError, FileNotFoundError):
                    # If we can't read the timestamp, use directory modification time
                    dir_mtime = os.path.getmtime(presentation_dir)
                    if dir_mtime < cutoff_timestamp:
                        should_delete = True
            else:
                # No timestamp file, use directory modification time
                dir_mtime = os.path.getmtime(presentation_dir)
                if dir_mtime < cutoff_timestamp:
                    should_delete = True
            
            if should_delete:
                try:
                    shutil.rmtree(presentation_dir)
                    cleaned_count += 1
                    print(f"Cleaned up old presentation: {presentation_id}")
                except Exception as e:
                    print(f"Error cleaning up presentation {presentation_id}: {e}")
        
        if cleaned_count > 0:
            print(f"Cleanup completed: removed {cleaned_count} old presentations")
    
    def get_storage_stats(self) -> dict:
        """Get statistics about the current storage usage."""
        if not os.path.exists(self.presentation_base_dir):
            return {
                "total_presentations": 0,
                "total_size_mb": 0,
                "base_directory": self.presentation_base_dir
            }
        
        total_size = 0
        presentation_count = 0
        
        for presentation_id in os.listdir(self.presentation_base_dir):
            presentation_dir = os.path.join(self.presentation_base_dir, presentation_id)
            
            if os.path.isdir(presentation_dir):
                presentation_count += 1
                
                # Calculate directory size
                for root, dirs, files in os.walk(presentation_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        if os.path.exists(file_path):
                            total_size += os.path.getsize(file_path)
        
        return {
            "total_presentations": presentation_count,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "base_directory": self.presentation_base_dir,
            "cleanup_after_hours": self.cleanup_after_hours
        }


# Global instance
presentation_storage = PresentationStorageService()
