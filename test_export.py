#!/usr/bin/env python3

import sys
import os
import asyncio
import tempfile
sys.path.append('backend')

from api.routers.presentation.handlers.export_as_pptx import ExportAsPptxHandler
from api.routers.presentation.models import ExportAsRequest
from api.models import LogMetadata
from api.services.logging import LoggingService
from auth.models import User
from ppt_generator.models.pptx_models import PptxPresentationModel

async def test_export_handler():
    """Test the export handler with a simulated user"""
    
    # Create a mock user
    user = User(
        id=1,
        email="test@example.com", 
        full_name="Test User"
    )
    
    # Create export request with an existing presentation
    export_request = ExportAsRequest(
        presentation_id="e326f118-7555-4430-9dc4-b5d7002f588a",  # Use an existing presentation
        pptx_model=PptxPresentationModel()  # Empty model
    )
    
    # Create handler with user
    handler = ExportAsPptxHandler(export_request, user)
    
    # Create logging service
    logging_service = LoggingService()
    log_metadata = LogMetadata(
        presentation_id=export_request.presentation_id,
        session_id="test-session"
    )
    
    try:
        print("Starting export test...")
        result = await handler.post(logging_service, log_metadata)
        print(f"Export result: {result}")
        return True
    except Exception as e:
        print(f"Export failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_export_handler())
    print(f"Test {'PASSED' if success else 'FAILED'}")
