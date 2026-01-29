import os
import httpx
import asyncio
from dotenv import load_dotenv

async def check_gemini():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    print(f"--- Gemini Diagnostic ---")
    if not api_key:
        print("❌ ERROR: No GEMINI_API_KEY found in .env file.")
        return
    
    print(f"Key identified (Length: {len(api_key)})")
    
    async with httpx.AsyncClient() as client:
        # 1. List Models
        print("Listing available models...")
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        try:
            list_res = await client.get(list_url)
            if list_res.status_code == 200:
                models = [m['name'].replace('models/', '') for m in list_res.json().get('models', [])]
                print(f"✅ Found {len(models)} models: {', '.join(models[:5])}...")
            else:
                print(f"❌ Failed to list models: {list_res.status_code}")
                print(f"Error: {list_res.text}")
                return
        except Exception as e:
            print(f"💥 Error listing models: {e}")
            return

        # 2. Try gemini-1.5-flash
        model = "gemini-1.5-flash"
        if model not in models:
            # Fallback to first available if 1.5-flash is missing
            model = models[0] if models else "gemini-pro"
            print(f"⚠️ {model} not found, trying {model} instead.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [{"parts": [{"text": "Say hello world"}]}]
    }
    
    print(f"Testing connection to {model}...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            
            if response.status_code == 200:
                print("✅ SUCCESS! The API key is valid and working.")
                print(f"Response: {response.json()['candidates'][0]['content']['parts'][0]['text']}")
            else:
                print(f"❌ FAILED with status code: {response.status_code}")
                error_data = response.json()
                print(f"Error Message: {error_data.get('error', {}).get('message', 'Unknown error')}")
                
                if response.status_code == 400:
                    print("💡 Tip: Check if the API key has any extra spaces or quotes in the .env file.")
                elif response.status_code == 403:
                    print("💡 Tip: This might be a region restriction or the API key doesn't have access to Gemini.")
                elif response.status_code == 429:
                    print("💡 Tip: You have reached your quota. Wait a minute and try again.")
    except Exception as e:
        print(f"💥 Exception occurred: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_gemini())
