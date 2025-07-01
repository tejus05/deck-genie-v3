import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from ppt_config_generator.ppt_title_summary_generator import generate_ppt_titles

# Load environment variables
load_dotenv()

async def test_fallback_titles():
    """Test the fallback title generation when quota is exceeded."""
    
    print("Testing title generation with quota exceeded...")
    
    try:
        # This should trigger the quota exceeded error and use fallback
        result = await generate_ppt_titles(
            prompt="KrishiSetu - AI-powered agricultural platform for farmers in India",
            content="Agricultural technology startup focusing on IoT sensors and AI-driven crop advisory",
            tone="Professional"
        )
        
        print("\n✅ SUCCESS: Title generation completed!")
        print(f"📋 Presentation Title: {result.presentation_title}")
        print(f"📊 Number of slides: {len(result.titles)}")
        print("\n🔸 Slide Titles:")
        for i, title in enumerate(result.titles, 1):
            print(f"  {i}. {title}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_fallback_titles())
    if success:
        print("\n🎉 Test completed successfully!")
    else:
        print("\n💥 Test failed!")
