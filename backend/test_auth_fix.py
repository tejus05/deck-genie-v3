#!/usr/bin/env python3

"""
Test script to verify authentication flow during presentation export.
This helps us understand why presentations aren't being saved to user accounts.
"""

import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    print("=== Testing Authentication Flow ===")
    
    # Test 1: Check if we can create a user and get auth token
    print("\n1. Testing user authentication...")
    
    # Register a test user
    register_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Register response: {response.status_code}")
        if response.status_code == 200:
            print("User registered successfully")
        elif response.status_code == 400:
            print("User already exists, continuing...")
        else:
            print(f"Register failed: {response.text}")
            return None
    except Exception as e:
        print(f"Register error: {e}")
    
    # Login to get token
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login response: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print(f"Login successful, got token: {token[:20]}...")
            return token
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_presentation_creation_with_auth(token):
    print("\n2. Testing presentation creation with authentication...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Create a presentation
    create_data = {
        "prompt": "Test presentation about AI and machine learning benefits",
        "tone": "professional"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ppt/create", json=create_data, headers=headers)
        print(f"Create presentation response: {response.status_code}")
        if response.status_code == 200:
            presentation_data = response.json()
            presentation_id = presentation_data.get("id")
            print(f"Presentation created successfully: {presentation_id}")
            return presentation_id
        else:
            print(f"Create presentation failed: {response.text}")
            return None
    except Exception as e:
        print(f"Create presentation error: {e}")
        return None

def test_export_with_auth(token, presentation_id):
    print("\n3. Testing presentation export with authentication...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Simplified export data (minimal for testing)
    export_data = {
        "presentation_id": presentation_id,
        "pptx_model": {
            "background_color": "#ffffff",
            "slides": [
                {
                    "shapes": [
                        {
                            "type": "textbox",
                            "position": {"left": 100, "top": 100, "width": 800, "height": 400},
                            "paragraphs": [
                                {
                                    "text_runs": [
                                        {"text": "Test Slide", "font": {"size": 24, "bold": True}}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ppt/presentation/export_as_pptx", json=export_data, headers=headers)
        print(f"Export presentation response: {response.status_code}")
        if response.status_code == 200:
            export_result = response.json()
            print(f"Export successful: {export_result}")
            return True
        else:
            print(f"Export failed: {response.text}")
            return False
    except Exception as e:
        print(f"Export error: {e}")
        return False

def check_auth_db_after_export():
    print("\n4. Checking auth database after export...")
    
    try:
        from services.database import get_session
        from auth.models import Presentation
        
        session = next(get_session())
        presentations = session.exec(select(Presentation)).all()
        print(f"Total presentations in auth DB: {len(presentations)}")
        
        if presentations:
            latest = presentations[-1]
            print(f"Latest presentation: {latest.title} by user {latest.owner_id}")
        
        session.close()
    except Exception as e:
        print(f"Error checking auth DB: {e}")

if __name__ == "__main__":
    # Test the complete flow
    token = test_auth_flow()
    if token:
        presentation_id = test_presentation_creation_with_auth(token)
        if presentation_id:
            export_success = test_export_with_auth(token, presentation_id)
            check_auth_db_after_export()
        else:
            print("Cannot test export without presentation ID")
    else:
        print("Cannot continue without authentication token")
