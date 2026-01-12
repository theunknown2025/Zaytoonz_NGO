# markdown.py

import asyncio
import sys
from typing import List
from api_management import get_supabase_client
from utils import generate_unique_name
from crawl4ai import AsyncWebCrawler

# Apply nest_asyncio only on Windows - it conflicts with uvloop on Linux
if sys.platform.startswith('win'):
    import nest_asyncio
    nest_asyncio.apply()

supabase = get_supabase_client()

async def get_fit_markdown_async(url: str) -> str:
    """
    Async function using crawl4ai's AsyncWebCrawler to produce the regular raw markdown.
    (Reverting from the 'fit' approach back to normal.)
    """

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        if result.success:
            return result.markdown
        else:
            return ""


def fetch_fit_markdown(url: str) -> str:
    """
    Synchronous wrapper around get_fit_markdown_async().
    """
    import asyncio
    import concurrent.futures
    
    try:
        # Check if we're already in an async context
        loop = asyncio.get_running_loop()
        # We're in an async context, run in a separate thread
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(asyncio.run, get_fit_markdown_async(url))
            return future.result()
    except RuntimeError:
        # No running loop, safe to create new one
        return asyncio.run(get_fit_markdown_async(url))

def read_raw_data(unique_name: str) -> str:
    """
    Query the 'scraped_data' table for the row with this unique_name,
    and return the 'raw_data' field.
    If Supabase connection fails, returns empty string.
    """
    try:
        response = supabase.table("scraped_data").select("raw_data").eq("unique_name", unique_name).execute()
        data = response.data
        if data and len(data) > 0:
            return data[0]["raw_data"]
    except Exception as e:
        YELLOW = "\033[33m"
        RESET = "\033[0m"
        print(f"{YELLOW}WARN: Supabase lookup failed for {unique_name}: {e}{RESET}")
    return ""

def save_raw_data(unique_name: str, url: str, raw_data: str) -> None:
    """
    Save or update the row in supabase with unique_name, url, and raw_data.
    If a row with unique_name doesn't exist, it inserts; otherwise it might upsert.
    If Supabase connection fails, it logs a warning but doesn't raise an error.
    """
    try:
        supabase.table("scraped_data").upsert({
            "unique_name": unique_name,
            "url": url,
            "raw_data": raw_data
        }, on_conflict="id").execute()
        BLUE = "\033[34m"
        RESET = "\033[0m"
        print(f"{BLUE}INFO:Raw data stored for {unique_name}{RESET}")
    except Exception as e:
        YELLOW = "\033[33m"
        RESET = "\033[0m"
        print(f"{YELLOW}WARN: Supabase save failed for {unique_name}: {e}{RESET}")
        # Don't raise - allow processing to continue without Supabase

def fetch_and_store_markdowns(urls: List[str]) -> List[str]:
    """
    For each URL:
      1) Generate unique_name
      2) Check if there's already a row in supabase with that unique_name
      3) If not found or if raw_data is empty, fetch fit_markdown
      4) Save to supabase
    Return a list of unique_names (one per URL).
    """
    unique_names = []

    for url in urls:
        unique_name = generate_unique_name(url)
        MAGENTA = "\033[35m"
        RESET = "\033[0m"
        # check if we already have raw_data in supabase
        raw_data = read_raw_data(unique_name)
        if raw_data:
            print(f"{MAGENTA}Found existing data in supabase for {url} => {unique_name}{RESET}")
        else:
            # fetch fit markdown
            fit_md = fetch_fit_markdown(url)
            print(fit_md)
            save_raw_data(unique_name, url, fit_md)
        unique_names.append(unique_name)

    return unique_names
