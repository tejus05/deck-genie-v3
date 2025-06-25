#!/usr/bin/env python3
import os

# Set Google Gemini as default LLM
os.environ.setdefault("LLM", "google")
os.environ.setdefault("GOOGLE_API_KEY", "AIzaSyBjqKxUF4WTY4rI1KVPvrNcUoLqfxNM8yc")

print("LLM:", os.getenv("LLM"))
print("GOOGLE_API_KEY:", os.getenv("GOOGLE_API_KEY"))

from api.utils import get_user_config
config = get_user_config()
print("Config LLM:", config.LLM)
print("Config GOOGLE_API_KEY:", config.GOOGLE_API_KEY[:20] + "..." if config.GOOGLE_API_KEY else None)
