#!/usr/bin/env python3
"""Test the data conversion process"""

def test_conversion():
    """Test the conversion from scraper output to API format"""
    print("🧪 Testing data conversion...")
    
    try:
        # Simulate scraped data like what scraper returns
        mock_scraped_data = [
            {
                "unique_name": "test_unique_name",
                "parsed_data": {
                    "listings": [
                        {
                            "title": "Test Job Title",
                            "content": "This is test content",
                            "company": "Test Company",
                            "location": "Test Location"
                        }
                    ]
                }
            }
        ]
        
        print(f"📦 Mock data: {mock_scraped_data}")
        
        from api_wrapper import convert_scraped_data_to_job_format
        
        fields = ['title', 'content']
        jobs = convert_scraped_data_to_job_format(mock_scraped_data, fields)
        
        print(f"✅ Conversion successful!")
        print(f"📋 Jobs count: {len(jobs)}")
        print(f"🔍 First job: {jobs[0] if jobs else 'No jobs'}")
        
        return len(jobs) > 0
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_conversion() 