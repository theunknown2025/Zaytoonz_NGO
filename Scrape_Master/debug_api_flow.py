#!/usr/bin/env python3
"""Debug the exact API flow to find where it fails"""

def debug_full_flow():
    """Debug the complete API flow step by step"""
    print("🔍 Debugging full API flow...")
    
    try:
        # Step 1: Test markdown fetch
        print("\n📝 Step 1: Fetching markdown...")
        from markdown import fetch_and_store_markdowns
        
        test_url = 'https://httpbin.org/html'
        unique_names = fetch_and_store_markdowns([test_url])
        print(f"✅ Markdown fetch: {unique_names}")
        
        if not unique_names:
            print("❌ No unique names returned")
            return False
            
        # Step 2: Test scraping with AI
        print("\n🤖 Step 2: Scraping with AI...")
        from scraper import scrape_urls
        
        fields = ['title', 'content']
        model = 'gpt-4o-mini'
        
        in_tokens, out_tokens, cost, scraped_data = scrape_urls(
            unique_names, 
            fields, 
            model
        )
        
        print(f"✅ AI scraping complete")
        print(f"📊 Tokens: {in_tokens}/{out_tokens}, Cost: ${cost}")
        print(f"📋 Data items: {len(scraped_data)}")
        print(f"🔍 First item structure: {type(scraped_data[0]) if scraped_data else 'No data'}")
        
        if scraped_data:
            first_item = scraped_data[0]
            print(f"🗂️ First item keys: {list(first_item.keys()) if isinstance(first_item, dict) else 'Not a dict'}")
            
            if 'parsed_data' in first_item:
                parsed = first_item['parsed_data']
                print(f"📊 Parsed data type: {type(parsed)}")
                print(f"📄 Parsed data: {parsed}")
                
        # Step 3: Test conversion
        print("\n🔄 Step 3: Converting to API format...")
        from api_wrapper import convert_scraped_data_to_job_format
        
        jobs = convert_scraped_data_to_job_format(scraped_data, fields)
        print(f"✅ Conversion complete")
        print(f"👔 Jobs found: {len(jobs)}")
        
        if jobs:
            print(f"🔍 First job: {jobs[0]}")
            
        # Step 4: Test response creation
        print("\n📤 Step 4: Creating API response...")
        from api_wrapper import ScrapeResponse, JobListResult
        
        if len(jobs) == 1:
            response = {
                "success": True,
                "data": jobs[0],
                "message": f"Successfully extracted job data from {test_url}"
            }
        else:
            response = {
                "success": True,
                "jobs": jobs,
                "data": {
                    "jobs": jobs,
                    "summary": {
                        "totalFound": len(jobs),
                        "source": test_url,
                        "pageTitle": "Scraped Jobs"
                    }
                },
                "message": f"Successfully extracted {len(jobs)} jobs from {test_url}"
            }
            
        print(f"✅ Response created: {response.get('success')}")
        print(f"💬 Message: {response.get('message')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Flow failed at some step: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    debug_full_flow() 