# -*- coding: utf-8 -*-
"""
List available Gemini models
"""
from google import genai
from dotenv import load_dotenv
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    try:
        client = genai.Client(api_key=api_key)
        print("[OK] Listing available models...\n")
        
        models = client.models.list()
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
        
    except Exception as e:
        print(f"[ERROR] {e}")
else:
    print("[ERROR] No API key configured")
