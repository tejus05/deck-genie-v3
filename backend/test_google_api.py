import os
import asyncio
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load environment variables
load_dotenv()

async def test_google_api_connection():
    """Test if Google API is properly configured and accessible."""
    try:
        # Get API key from environment
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return False, "GOOGLE_API_KEY not found in environment variables"
        
        print(f"Using API key: {api_key[:10]}...{api_key[-4:]}")
        
        # Initialize the model
        model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
        
        # Test with a simple message
        messages = [HumanMessage(content="Test connection. Reply with 'OK'.")]
        
        # Set a short timeout for the test
        try:
            response = await asyncio.wait_for(model.ainvoke(messages), timeout=15.0)
            return True, f"API connection successful: {response.content}"
        except asyncio.TimeoutError:
            return False, "API connection timeout"
        except Exception as e:
            error_str = str(e).lower()
            if "quota" in error_str:
                return False, "API quota exceeded"
            elif "rate limit" in error_str:
                return False, "API rate limit exceeded"
            elif "authentication" in error_str or "api key" in error_str:
                return False, "API authentication failed - check your API key"
            else:
                return False, f"API error: {str(e)}"
    
    except Exception as e:
        return False, f"Configuration error: {str(e)}"

if __name__ == "__main__":
    success, message = asyncio.run(test_google_api_connection())
    print(f"API Test: {'SUCCESS' if success else 'FAILED'}")
    print(f"Message: {message}")
