#!/usr/bin/env python3
"""Debug script to test scraping components individually"""

def test_markdown_fetch():
    """Test markdown fetching"""
    print("🧪 Testing markdown fetch...")
    try:
        from markdown import fetch_and_store_markdowns
        unique_names = fetch_and_store_markdowns(['https://httpbin.org/html'])
        print(f"✅ Markdown fetch successful: {unique_names}")
        return unique_names
    except Exception as e:
        print(f"❌ Markdown fetch failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_model_validation():
    """Test model validation"""
    print("\n🧪 Testing model validation...")
    try:
        from assets import MODELS_USED
        print(f"📋 Available models: {list(MODELS_USED.keys())}")
        
        model = "gpt-4o-mini"
        if model in MODELS_USED:
            print(f"✅ Model '{model}' is valid")
            return True
        else:
            print(f"❌ Model '{model}' not found in MODELS_USED")
            return False
    except Exception as e:
        print(f"❌ Model validation failed: {e}")
        return False

def test_scraping():
    """Test the scraping process"""
    print("\n🧪 Testing scraping process...")
    try:
        from scraper import scrape_urls
        
        # First get some markdown
        unique_names = test_markdown_fetch()
        if not unique_names:
            print("❌ Can't test scraping without markdown")
            return False
            
        print(f"📄 Using unique_names: {unique_names}")
        
        fields = ['title', 'content']
        model = 'gpt-4o-mini'
        
        print(f"🤖 Calling scrape_urls with fields: {fields}, model: {model}")
        
        in_tokens, out_tokens, cost, parsed_results = scrape_urls(
            unique_names, 
            fields, 
            model
        )
        
        print(f"✅ Scraping successful!")
        print(f"📊 Tokens - In: {in_tokens}, Out: {out_tokens}, Cost: ${cost}")
        print(f"📋 Results count: {len(parsed_results)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Scraping failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_key():
    """Test API key availability"""
    print("\n🧪 Testing API key...")
    try:
        from api_management import get_api_key
        api_key = get_api_key('gpt-4o-mini')
        
        if api_key:
            print(f"✅ API key found: {api_key[:10]}...")
            return True
        else:
            print("❌ No API key found")
            return False
    except Exception as e:
        print(f"❌ API key test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Debug Scraper Components\n")
    
    # Test each component
    test_api_key()
    test_model_validation()
    test_markdown_fetch()
    test_scraping()
    
    print("\n✨ Debug complete!") 