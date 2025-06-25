import json
import os
from fastapi import APIRouter, HTTPException
from api.models import UserConfig
from api.utils import get_user_config

router = APIRouter(prefix="/config", tags=["config"])

@router.get("/")
async def get_config():
    """Get current user configuration"""
    try:
        config = get_user_config()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get configuration: {str(e)}")

@router.post("/")
async def save_config(config: UserConfig):
    """Save user configuration"""
    try:
        user_config_path = os.getenv("USER_CONFIG_PATH")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(user_config_path), exist_ok=True)
        
        # Save configuration to file
        with open(user_config_path, "w") as f:
            json.dump(config.model_dump(exclude_none=True), f, indent=2)
        
        # Update environment variables
        if config.LLM:
            os.environ["LLM"] = config.LLM
        if config.GOOGLE_API_KEY:
            os.environ["GOOGLE_API_KEY"] = config.GOOGLE_API_KEY
            
        return {"message": "Configuration saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save configuration: {str(e)}")
