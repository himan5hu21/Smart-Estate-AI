"""
Test Google Gemini API connection
"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    
    print(f"API Key present: {bool(api_key)}")
    print(f"API Key starts with: {api_key[:20] if api_key else 'None'}...")
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment")
        return
    
    try:
        client = genai.Client(api_key=api_key)
        print("✅ Gemini client created")
        
        print("\nTesting API call...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents="Say 'Hello, SmartEstate!' in one sentence."
        )
        
        print(f"✅ API call successful!")
        print(f"Response: {response.text}")
        print(f"\n💰 Cost: $0 (FREE!)")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
