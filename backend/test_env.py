"""
Test if .env file is being loaded correctly
"""
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Check if variables are loaded
print("Testing environment variables:")
print("-" * 50)

openai_key = os.getenv("OPENAI_API_KEY")
google_key = os.getenv("GOOGLE_MAPS_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"OPENAI_API_KEY: {'✅ Set' if openai_key else '❌ Not set'}")
if openai_key:
    print(f"  Value starts with: {openai_key[:10]}...")

print(f"GOOGLE_MAPS_API_KEY: {'✅ Set' if google_key else '❌ Not set'}")
if google_key:
    print(f"  Value starts with: {google_key[:10]}...")

print(f"SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Not set'}")
if supabase_url:
    print(f"  Value: {supabase_url}")

print(f"SUPABASE_SERVICE_KEY: {'✅ Set' if supabase_key else '❌ Not set'}")
if supabase_key:
    print(f"  Value starts with: {supabase_key[:10]}...")

print("-" * 50)

if not openai_key:
    print("\n⚠️  OPENAI_API_KEY is not set!")
    print("Make sure your .env file has:")
    print("OPENAI_API_KEY=sk-proj-your-key-here")

if not google_key:
    print("\n⚠️  GOOGLE_MAPS_API_KEY is not set!")
    print("Make sure your .env file has:")
    print("GOOGLE_MAPS_API_KEY=your-key-here")

if openai_key and google_key:
    print("\n✅ All required API keys are set!")
    print("You can now run: python main.py")
