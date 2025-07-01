import uvicorn
import os
import tempfile
import sys
from dotenv import load_dotenv

# Add the current directory to the Python path for proper imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Set default environment variables before importing anything else
data_dir = os.path.join(os.getcwd(), "data")
os.environ.setdefault("APP_DATA_DIRECTORY", data_dir)
os.environ.setdefault("TEMP_DIRECTORY", os.path.join(data_dir, "temp"))
os.environ.setdefault("USER_CONFIG_PATH", os.path.join(data_dir, "config.json"))

# Set Google Gemini as default LLM
os.environ.setdefault("LLM", "google")
# Google API key will be loaded from .env file

from api.main import app

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True, log_level="info")
