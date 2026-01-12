"""
API Wrapper for Scrape_Master - Converts the existing scraper into REST API endpoints
that can be called by the Next.js frontend
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import asyncio
import json
import os
import sys
from datetime import datetime

# Fix event loop policy for Windows and nested async
# Only apply nest_asyncio on Windows - it conflicts with uvloop on Linux
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    # Allow nested event loops (Windows only - conflicts with uvloop on Linux)
    import nest_asyncio
    nest_asyncio.apply()

# Import your existing scraper modules
from scraper import scrape_urls
from pagination import paginate_urls  
from markdown import fetch_and_store_markdowns
from assets import MODELS_USED, OPENAI_MODEL_FULLNAME
from api_management import get_supabase_client

# Initialize FastAPI app
app = FastAPI(title="Scrape Master API", version="1.0.0")

# Configure CORS to allow your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local Next.js development
        "https://*.netlify.app",  # Netlify deployments
        "https://*.vercel.app",   # Vercel deployments (if needed)
        # Add your specific frontend domain here
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Request/Response Models
class ScrapeRequest(BaseModel):
    url: str
    fields: Optional[List[str]] = ["title", "company", "location", "description", "url", "deadline", "job_type", "salary_range"]
    model: Optional[str] = OPENAI_MODEL_FULLNAME
    use_pagination: Optional[bool] = False
    pagination_details: Optional[str] = ""

class JobData(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_range: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None  # Direct link to the specific opportunity
    link: Optional[str] = None  # Alternative field name for URL
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    application_deadline: Optional[str] = None
    deadline: Optional[str] = None  # Alternative field name for deadline
    tags: Optional[List[str]] = None
    experience_level: Optional[str] = None
    remote_work: Optional[bool] = False

class JobListResult(BaseModel):
    jobs: List[JobData]
    summary: Dict[str, Any]

class ScrapeResponse(BaseModel):
    success: bool
    data: Optional[JobData | JobListResult] = None
    jobs: Optional[List[JobData]] = None  # Alternative format for multiple jobs
    error: Optional[str] = None
    message: Optional[str] = None
    pagination_urls: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

def convert_scraped_data_to_job_format(scraped_data: List[Dict], fields: List[str], source_url: str = "") -> List[JobData]:
    """Convert the scraped data format to JobData format expected by Next.js frontend"""
    jobs = []
    
    # Extract base URL for relative links
    base_url = ""
    if source_url:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(source_url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
        except:
            base_url = ""
    
    for data_item in scraped_data:
        if not isinstance(data_item, dict):
            continue
            
        parsed_data = data_item.get("parsed_data", {})
        
        # Handle different data structures
        if isinstance(parsed_data, str):
            try:
                parsed_data = json.loads(parsed_data)
            except json.JSONDecodeError:
                continue
                
        if hasattr(parsed_data, "dict"):
            parsed_data = parsed_data.dict()
            
        # Extract listings if they exist
        listings = []
        if isinstance(parsed_data, dict) and "listings" in parsed_data:
            listings = parsed_data["listings"]
        elif isinstance(parsed_data, list):
            listings = parsed_data
        else:
            listings = [parsed_data]
            
        # Convert each listing to JobData format - NO LIMIT on number of listings
        for listing in listings:
            if not isinstance(listing, dict):
                continue
                
            # Map the dynamic fields to JobData fields
            job_data = JobData()
            
            # Direct mapping for known fields
            job_data.title = listing.get("title") or listing.get("job_title") or listing.get("position")
            job_data.company = listing.get("company") or listing.get("employer") or listing.get("organization")
            job_data.location = listing.get("location") or listing.get("place") or listing.get("address")
            job_data.description = listing.get("description") or listing.get("job_description") or listing.get("details") or listing.get("summary")
            job_data.job_type = listing.get("job_type") or listing.get("type") or listing.get("employment_type")
            job_data.salary_range = listing.get("salary_range") or listing.get("salary") or listing.get("compensation")
            job_data.requirements = listing.get("requirements") or listing.get("qualifications")
            job_data.benefits = listing.get("benefits") or listing.get("perks")
            job_data.experience_level = listing.get("experience_level") or listing.get("experience") or listing.get("level")
            
            # Extract URL/Link - IMPORTANT for each opportunity
            opportunity_url = listing.get("url") or listing.get("link") or listing.get("href") or listing.get("apply_url") or listing.get("detail_url") or listing.get("opportunity_url")
            if opportunity_url:
                # Handle relative URLs
                if opportunity_url.startswith("/"):
                    opportunity_url = base_url + opportunity_url
                elif not opportunity_url.startswith("http"):
                    opportunity_url = base_url + "/" + opportunity_url
                job_data.url = opportunity_url
                job_data.link = opportunity_url
            
            # Extract deadline
            job_data.deadline = listing.get("deadline") or listing.get("application_deadline") or listing.get("closing_date") or listing.get("due_date")
            job_data.application_deadline = job_data.deadline
            
            # Handle remote work detection
            remote_indicators = listing.get("remote_work") or listing.get("remote") or listing.get("work_type", "")
            if isinstance(remote_indicators, str):
                job_data.remote_work = "remote" in remote_indicators.lower() or "télétravail" in remote_indicators.lower()
            else:
                job_data.remote_work = bool(remote_indicators)
                
            # Extract tags from available fields
            tags = []
            for field in ["tags", "skills", "technologies", "keywords", "categories"]:
                if field in listing and listing[field]:
                    if isinstance(listing[field], list):
                        tags.extend(listing[field])
                    elif isinstance(listing[field], str):
                        tags.append(listing[field])
            job_data.tags = tags[:15] if tags else None  # Increased limit to 15 tags
            
            # Only add if we have at least a title
            if job_data.title:
                jobs.append(job_data)
    
    print(f"📊 Total opportunities extracted: {len(jobs)}")
    return jobs

@app.post("/api/scrape", response_model=ScrapeResponse)
async def scrape_job(request: ScrapeRequest):
    """
    Main scraping endpoint that processes a URL and returns structured job data
    """
    try:
        # Validate Supabase connection
        supabase = get_supabase_client()
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured")
            
        # Validate URL
        if not request.url:
            raise HTTPException(status_code=400, detail="URL is required")
            
        # Validate model
        if request.model not in MODELS_USED:
            raise HTTPException(status_code=400, detail=f"Model {request.model} not supported")
            
        # Step 1: Fetch and store markdown data
        print(f"🌐 Fetching markdown for: {request.url}")
        from markdown import get_fit_markdown_async, save_raw_data
        from utils import generate_unique_name
        
        # Fetch markdown content asynchronously
        unique_name = generate_unique_name(request.url)
        markdown_content = await get_fit_markdown_async(request.url)
        
        if not markdown_content:
            raise HTTPException(status_code=422, detail="Failed to fetch content from URL")
            
        # Save to database
        save_raw_data(unique_name, request.url, markdown_content)
        unique_names = [unique_name]
            
        # Step 2: Scrape data using AI
        scraped_data = []
        pagination_urls = []
        total_cost = 0
        
        if request.fields:
            print(f"🤖 Extracting fields: {request.fields}")
            # Pass markdown content directly to avoid Supabase dependency
            raw_data_dict = {unique_name: markdown_content}
            print(f"📦 Created raw_data_dict with unique_name: {unique_name}, content length: {len(markdown_content)}")
            print(f"📦 raw_data_dict keys: {list(raw_data_dict.keys())}")
            print(f"📦 About to call scrape_urls with raw_data_dict parameter...")
            in_tokens, out_tokens, cost, parsed_results = scrape_urls(
                unique_names, 
                request.fields, 
                request.model,
                raw_data_dict=raw_data_dict
            )
            print(f"📦 scrape_urls returned {len(parsed_results)} parsed results")
            scraped_data = parsed_results
            total_cost += cost
            
        # Step 3: Handle pagination if requested
        if request.use_pagination:
            print(f"📄 Detecting pagination...")
            in_tokens_p, out_tokens_p, cost_p, page_results = paginate_urls(
                unique_names,
                request.model, 
                request.pagination_details,
                [request.url]
            )
            total_cost += cost_p
            
            # Extract pagination URLs
            for page_result in page_results:
                if isinstance(page_result, dict) and "pagination_data" in page_result:
                    pag_data = page_result["pagination_data"]
                    if hasattr(pag_data, "dict"):
                        pag_data = pag_data.dict()
                    elif isinstance(pag_data, str):
                        try:
                            pag_data = json.loads(pag_data)
                        except json.JSONDecodeError:
                            continue
                            
                    if isinstance(pag_data, dict) and "page_urls" in pag_data:
                        pagination_urls.extend(pag_data["page_urls"])
        
        # Step 4: Convert to JobData format expected by Next.js
        print(f"🔄 Converting {len(scraped_data)} scraped data items to job format...")
        jobs = convert_scraped_data_to_job_format(scraped_data, request.fields, request.url)
        print(f"📊 Total opportunities extracted: {len(jobs)}")
        print(f"✅ Conversion complete: {len(jobs)} opportunities found")
        
        # Determine response format
        if len(jobs) == 1:
            # Single job
            return ScrapeResponse(
                success=True,
                data=jobs[0],
                message=f"Successfully extracted job data from {request.url}",
                pagination_urls=pagination_urls if pagination_urls else None,
                metadata={
                    "total_cost": total_cost,
                    "unique_name": unique_names[0] if unique_names else None,
                    "extracted_fields": request.fields,
                    "model_used": request.model
                }
            )
        else:
            # Multiple jobs
            return ScrapeResponse(
                success=True,
                jobs=jobs,
                data=JobListResult(
                    jobs=jobs,
                    summary={
                        "totalFound": len(jobs),
                        "source": request.url,
                        "pageTitle": "Scraped Jobs"
                    }
                ),
                message=f"Successfully extracted {len(jobs)} jobs from {request.url}",
                pagination_urls=pagination_urls if pagination_urls else None,
                metadata={
                    "total_cost": total_cost,
                    "unique_name": unique_names[0] if unique_names else None,
                    "extracted_fields": request.fields,
                    "model_used": request.model
                }
            )
            
    except Exception as e:
        print(f"❌ Error in scraping: {str(e)}")
        return ScrapeResponse(
            success=False,
            error=str(e),
            message="Failed to scrape job data"
        )

@app.post("/api/raw-content")
async def get_raw_content(request: ScrapeRequest):
    """
    Fetch and return the FULL raw markdown content from a URL without AI processing.
    This returns the complete page content as-is, not summarized.
    """
    try:
        # Validate Supabase connection
        supabase = get_supabase_client()
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured")
            
        # Validate URL
        if not request.url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        # Fetch markdown content directly without AI processing
        print(f"🌐 Fetching FULL raw content for: {request.url}")
        from markdown import get_fit_markdown_async, save_raw_data
        from utils import generate_unique_name
        
        # Fetch markdown content asynchronously
        unique_name = generate_unique_name(request.url)
        markdown_content = await get_fit_markdown_async(request.url)
        
        if not markdown_content:
            return {
                "success": False,
                "error": "Failed to fetch content from URL",
                "url": request.url
            }
            
        # Save to database for caching
        save_raw_data(unique_name, request.url, markdown_content)
        
        print(f"📄 Raw content fetched: {len(markdown_content)} characters")
        
        return {
            "success": True,
            "url": request.url,
            "raw_content": markdown_content,
            "content_length": len(markdown_content),
            "unique_name": unique_name
        }
        
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"❌ Error fetching raw content: {error_msg}")
        print(traceback.format_exc())
        return {
            "success": False,
            "error": error_msg,
            "url": request.url
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    supabase = get_supabase_client()
    return {
        "status": "healthy",
        "service": "scrape-master-api",
        "timestamp": datetime.now().isoformat(),
        "supabase_connected": supabase is not None,
        "supported_models": list(MODELS_USED.keys())
    }

@app.get("/models")
async def get_supported_models():
    """Get list of supported AI models"""
    return {
        "models": list(MODELS_USED.keys()),
        "default": OPENAI_MODEL_FULLNAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 