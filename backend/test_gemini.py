# -*- coding: utf-8 -*-
import google.generativeai as genai
from dotenv import load_dotenv
import os, sys, json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

response = model.generate_content(
    "Return JSON: {\"status\": \"ok\", \"message\": \"Gemini working\"}",
    generation_config=genai.GenerationConfig(
        temperature=0.1,
        response_mime_type="application/json"
    )
)
print(f"[OK] Response: {response.text}")
data = json.loads(response.text)
print(f"[OK] Parsed: {data}")
print("[OK] Gemini 2.5 Flash is working correctly!")
