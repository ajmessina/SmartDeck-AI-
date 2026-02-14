# -*- coding: utf-8 -*-
"""
Test with google-generativeai library
"""
import google.generativeai as genai
from dotenv import load_dotenv
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {api_key[:20]}..." if api_key else "No API key found")

if api_key:
    try:
        genai.configure(api_key=api_key)
        print("[OK] API configured")
        
        # List available models
        print("\n[INFO] Available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"  - {m.name}")
        
        # Test generation
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("\n[OK] Model loaded: gemini-1.5-flash")
        
        response = model.generate_content("Say 'Hello from Gemini!' in one sentence")
        print(f"[OK] Response: {response.text}")
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
else:
    print("[ERROR] No API key configured")
