from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from datetime import timedelta
import httpx
import json
import os
from urllib.parse import urlencode
from typing import Optional

from .models import User
from .utils import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from services.database import get_session

# Get Google OAuth credentials from environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Create router
oauth_router = APIRouter(tags=["oauth"])

@oauth_router.get("/auth/google/login")
async def google_login():
    """Start Google OAuth flow."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured"
        )
    
    # Prepare Google OAuth URL
    redirect_uri = f"{BACKEND_URL}/auth/google/callback"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    # Redirect to Google's OAuth page
    auth_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
    return RedirectResponse(url=auth_url)

@oauth_router.get("/auth/google/callback")
async def google_callback(
    code: Optional[str] = None, 
    error: Optional[str] = None,
    request: Request = None, 
    session: Session = Depends(get_session)
):
    """Handle Google OAuth callback."""
    # Handle cancellation or error from Google
    if error or not code:
        error_msg = error or "Authorization cancelled"
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/login?error={error_msg}"
        )
        
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/login?error=Google+OAuth+is+not+configured"
        )
    
    # Exchange code for token
    redirect_uri = f"{BACKEND_URL}/auth/google/callback"
    token_url = "https://oauth2.googleapis.com/token"
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            token_url,
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"}
        )
        
        if token_response.status_code != 200:
            return RedirectResponse(
                url=f"{FRONTEND_URL}/auth/login?error=Authentication+failed"
            )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        # Get user info from Google
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_info_response.status_code != 200:
            return RedirectResponse(
                url=f"{FRONTEND_URL}/auth/login?error=Could+not+fetch+user+information"
            )
        
        user_info = user_info_response.json()
        
    # Check if user exists, create if not
    email = user_info.get("email")
    if not email:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/login?error=Email+not+provided+by+Google"
        )
    
    # Try to find existing user
    db_user = session.exec(select(User).where(User.email == email)).first()
    
    if not db_user:
        # Create new user with Google info
        # Using a random password as login will be through OAuth
        import secrets
        import string
        
        # Generate a random password
        alphabet = string.ascii_letters + string.digits
        random_password = ''.join(secrets.choice(alphabet) for _ in range(16))
        
        # Hash password
        from .utils import get_password_hash
        hashed_password = get_password_hash(random_password)
        
        # Create user
        db_user = User(
            email=email,
            full_name=user_info.get("name", ""),
            hashed_password=hashed_password,
            is_active=True,
            google_id=user_info.get("id"),
            picture=user_info.get("picture")
        )
        
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    elif not db_user.google_id:
        # Update existing user with Google ID
        db_user.google_id = user_info.get("id")
        db_user.picture = user_info.get("picture", db_user.picture)
        
        # If the user doesn't have a name, use the Google name
        if not db_user.full_name:
            db_user.full_name = user_info.get("name", "")
            
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = create_access_token(
        data={"sub": db_user.email}, 
        expires_delta=access_token_expires
    )
    
    # Redirect to frontend with token
    return RedirectResponse(
        url=f"{FRONTEND_URL}/auth/google/callback?token={jwt_token}&user_id={db_user.id}"
    )
