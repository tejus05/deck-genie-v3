#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Set Google Gemini as default LLM
os.environ.setdefault("LLM", "google")
# Google API key will be loaded from .env file

print("LLM:", os.getenv("LLM"))
print("GOOGLE_API_KEY:", os.getenv("GOOGLE_API_KEY"))

from api.utils import get_user_config
config = get_user_config()
print("Config LLM:", config.LLM)
print("Config GOOGLE_API_KEY:", config.GOOGLE_API_KEY[:20] + "..." if config.GOOGLE_API_KEY else None)
