"""
Setup script for FREE AI (Google Gemini)
"""
import os
import subprocess
import sys

def main():
    print("🆓 Setting up FREE AI with Google Gemini")
    print("=" * 50)
    
    # Step 1: Install Gemini
    print("\n📦 Step 1: Installing Google Gemini SDK...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
        print("✅ Google Gemini SDK installed successfully!")
    except Exception as e:
        print(f"❌ Failed to install: {e}")
        return
    
    # Step 2: Check for API key
    print("\n🔑 Step 2: Checking for API key...")
    
    # Read current .env
    env_path = ".env"
    env_content = ""
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            env_content = f.read()
    
    # Check if GEMINI_API_KEY exists
    if "GEMINI_API_KEY=" in env_content and not env_content.split("GEMINI_API_KEY=")[1].split("\n")[0].strip() == "":
        print("✅ GEMINI_API_KEY found in .env")
    else:
        print("\n⚠️  GEMINI_API_KEY not found in .env")
        print("\n📝 To get your FREE API key:")
        print("   1. Go to: https://aistudio.google.com/app/apikey")
        print("   2. Click 'Create API Key'")
        print("   3. Copy the key (starts with AIza...)")
        print("\n")
        
        api_key = input("Paste your Gemini API key here (or press Enter to skip): ").strip()
        
        if api_key:
            # Add or update GEMINI_API_KEY
            if "GEMINI_API_KEY=" in env_content:
                # Update existing
                lines = env_content.split("\n")
                for i, line in enumerate(lines):
                    if line.startswith("GEMINI_API_KEY="):
                        lines[i] = f"GEMINI_API_KEY={api_key}"
                env_content = "\n".join(lines)
            else:
                # Add new
                env_content += f"\n\n# Google Gemini (FREE)\nGEMINI_API_KEY={api_key}\n"
            
            # Add USE_GEMINI flag
            if "USE_GEMINI=" not in env_content:
                env_content += "USE_GEMINI=true\n"
            else:
                lines = env_content.split("\n")
                for i, line in enumerate(lines):
                    if line.startswith("USE_GEMINI="):
                        lines[i] = "USE_GEMINI=true"
                env_content = "\n".join(lines)
            
            # Write back
            with open(env_path, 'w') as f:
                f.write(env_content)
            
            print("✅ API key saved to .env")
        else:
            print("⏭️  Skipped. You can add it manually to .env later")
    
    # Step 3: Enable Gemini
    print("\n⚙️  Step 3: Enabling Gemini...")
    if "USE_GEMINI=true" not in env_content:
        if "USE_GEMINI=" in env_content:
            lines = env_content.split("\n")
            for i, line in enumerate(lines):
                if line.startswith("USE_GEMINI="):
                    lines[i] = "USE_GEMINI=true"
            env_content = "\n".join(lines)
        else:
            env_content += "\nUSE_GEMINI=true\n"
        
        with open(env_path, 'w') as f:
            f.write(env_content)
    
    print("✅ Gemini enabled in .env")
    
    # Final instructions
    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("=" * 50)
    print("\n✅ What's configured:")
    print("   - Google Gemini SDK installed")
    print("   - USE_GEMINI=true in .env")
    
    if "GEMINI_API_KEY=" in env_content and env_content.split("GEMINI_API_KEY=")[1].split("\n")[0].strip():
        print("   - GEMINI_API_KEY configured")
    else:
        print("   - ⚠️  GEMINI_API_KEY not set (add it to .env)")
    
    print("\n🚀 Next steps:")
    if "GEMINI_API_KEY=" not in env_content or not env_content.split("GEMINI_API_KEY=")[1].split("\n")[0].strip():
        print("   1. Get FREE API key: https://aistudio.google.com/app/apikey")
        print("   2. Add to .env: GEMINI_API_KEY=AIza_YOUR_KEY")
        print("   3. Restart backend: python main.py")
    else:
        print("   1. Restart backend: python main.py")
        print("   2. Test AI features - they're FREE now!")
    
    print("\n💰 Cost: $0 (FREE FOREVER!)")
    print("📊 Limits: 1500 requests/day (more than enough!)")
    print("\n")

if __name__ == "__main__":
    main()
