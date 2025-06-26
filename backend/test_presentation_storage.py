#!/usr/bin/env python3
"""
Test script for the new presentation storage service.
"""

import os
import sys
import tempfile
import uuid
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up environment variables
os.environ["APP_DATA_DIRECTORY"] = str(backend_dir / "data")

from api.services.presentation_storage import presentation_storage


def test_presentation_storage():
    """Test the presentation storage functionality."""
    print("Testing Presentation Storage Service")
    print("=" * 50)
    
    # Test 1: Create a presentation directory
    test_id = str(uuid.uuid4())
    print(f"1. Creating presentation directory for ID: {test_id}")
    
    presentation_dir = presentation_storage.get_presentation_dir(test_id)
    print(f"   Directory created at: {presentation_dir}")
    print(f"   Exists: {os.path.exists(presentation_dir)}")
    
    # Test 2: Create images directory
    print(f"2. Creating images directory")
    images_dir = presentation_storage.get_presentation_images_dir(test_id)
    print(f"   Images directory: {images_dir}")
    print(f"   Exists: {os.path.exists(images_dir)}")
    
    # Test 3: Store a file
    print(f"3. Storing a test file")
    test_content = b"This is a test presentation file."
    file_path = presentation_storage.store_presentation_file(test_id, "test.txt", test_content)
    print(f"   File stored at: {file_path}")
    print(f"   Exists: {os.path.exists(file_path)}")
    
    # Test 4: Retrieve the file
    print(f"4. Retrieving the test file")
    retrieved_content = presentation_storage.get_presentation_file(test_id, "test.txt")
    print(f"   Content matches: {retrieved_content == test_content}")
    
    # Test 5: Check if presentation exists
    print(f"5. Checking if presentation exists")
    exists = presentation_storage.presentation_exists(test_id)
    print(f"   Presentation exists: {exists}")
    
    # Test 6: Get storage stats
    print(f"6. Getting storage statistics")
    stats = presentation_storage.get_storage_stats()
    print(f"   Storage stats: {stats}")
    
    # Test 7: Clean up the test presentation
    print(f"7. Cleaning up test presentation")
    deleted = presentation_storage.delete_presentation(test_id)
    print(f"   Deletion successful: {deleted}")
    print(f"   Directory still exists: {os.path.exists(presentation_dir)}")
    
    print("\n" + "=" * 50)
    print("Test completed!")
    
    # Print final stats
    final_stats = presentation_storage.get_storage_stats()
    print(f"Final storage stats: {final_stats}")


if __name__ == "__main__":
    test_presentation_storage()
