"""
Direct test of Gemini API to diagnose 404 issues
"""
import httpx
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def test_model(model_name, api_version="v1"):
    """Test a specific model"""
    url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model_name}:generateContent"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": "Say hello in Khmer"}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 100
                    }
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                print(f"✅ {model_name} ({api_version}): SUCCESS")
                print(f"   Response: {text[:50]}...")
                return True
            else:
                print(f"❌ {model_name} ({api_version}): {response.status_code}")
                print(f"   Error: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"💥 {model_name} ({api_version}): {str(e)[:100]}")
        return False

async def main():
    print("=" * 60)
    print("GEMINI API DIAGNOSTIC TEST")
    print("=" * 60)
    print(f"API Key: {GEMINI_API_KEY[:10]}...{GEMINI_API_KEY[-4:]}\n")
    
    # Models to test
    models_to_test = [
        ("gemini-2.5-flash", "v1beta"),  # Newest experimental
        ("gemini-2.0-flash", "v1beta"),
        ("gemini-1.5-flash", "v1beta"),
        ("gemini-1.5-flash", "v1"),
        ("gemini-1.5-pro", "v1beta"),
        ("gemini-1.5-pro", "v1"),
        ("gemini-pro", "v1"),
    ]
    
    working_models = []
    
    for model, version in models_to_test:
        success = await test_model(model, version)
        if success:
            working_models.append((model, version))
        await asyncio.sleep(0.5)  # Small delay between requests
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print("=" * 60)
    if working_models:
        print(f"✅ Found {len(working_models)} working model(s):")
        for model, version in working_models:
            print(f"   - {model} ({version})")
    else:
        print("❌ No working models found!")
        print("\nPossible issues:")
        print("1. API key might not be activated for Gemini API")
        print("2. Billing might not be enabled")
        print("3. Region restrictions")
        print("\nVisit: https://aistudio.google.com/apikey to check your key")
    
if __name__ == "__main__":
    asyncio.run(main())
