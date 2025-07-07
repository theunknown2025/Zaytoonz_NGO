#!/usr/bin/env python3
"""Test script to debug the API scraping issue"""

import requests
import json
import time

def test_api():
    url = "http://localhost:8000/api/scrape"
    
    test_data = {
        'url': 'https://httpbin.org/html',
        'fields': ['title', 'content'],
        'model': 'gpt-4o-mini'
    }
    
    print("🧪 Testing API endpoint...")
    print(f"📡 Sending request to: {url}")
    print(f"📦 Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(url, json=test_data, timeout=60)
        print(f"📊 Status Code: {response.status_code}")
        
        result = response.json()
        print(f"✅ Success: {result.get('success')}")
        print(f"❌ Error: {result.get('error')}")
        print(f"💬 Message: {result.get('message')}")
        
        if not result.get('success'):
            print("\n🔍 Full response:")
            print(json.dumps(result, indent=2))
            
    except requests.exceptions.ConnectionError:
        print("❌ API server not running. Start it with: python run_api.py")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_api() 