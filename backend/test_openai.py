"""
Test OpenAI API connection
"""
import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

async def test_openai():
    api_key = os.getenv("OPENAI_API_KEY")
    
    print(f"API Key present: {bool(api_key)}")
    print(f"API Key starts with: {api_key[:20] if api_key else 'None'}...")
    
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return
    
    try:
        client = AsyncOpenAI(api_key=api_key)
        print("✅ OpenAI client created")
        
        print("\nTesting API call...")
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello, SmartEstate!' in one sentence."}
            ],
            max_tokens=50
        )
        
        print(f"✅ API call successful!")
        print(f"Response: {response.choices[0].message.content}")
        print(f"Tokens used: {response.usage.total_tokens}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_openai())
