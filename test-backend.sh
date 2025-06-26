#!/bin/bash

# Test script to check backend connectivity and available endpoints

echo "🔍 Testing backend connectivity..."

# Test if backend is running
echo "1. Testing backend status..."
curl -s http://127.0.0.1:8000/docs > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running on http://127.0.0.1:8000"
else
    echo "❌ Backend is not accessible on http://127.0.0.1:8000"
    echo "   Please make sure the backend is running"
    exit 1
fi

# Test OpenAPI docs to see available endpoints
echo ""
echo "2. Checking available endpoints..."
curl -s http://127.0.0.1:8000/openapi.json | jq '.paths | keys[]' | grep export || echo "No export endpoints found"

# Test the specific export endpoint with minimal data
echo ""
echo "3. Testing export endpoint with minimal data..."
curl -X POST http://127.0.0.1:8000/ppt/presentation/export_as_pptx \
  -H "Content-Type: application/json" \
  -d '{
    "presentation_id": "test-id", 
    "pptx_model": {
      "background_color": "#ffffff",
      "slides": []
    }
  }' -v

echo ""
echo "🏁 Backend connectivity test complete"
