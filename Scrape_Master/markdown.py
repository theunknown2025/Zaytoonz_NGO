# markdown.py

import asyncio
import sys
from collections import OrderedDict
from typing import List
from api_management import get_supabase_client
from utils import generate_unique_name
from robots_guard import check_url_allowed

# nest_asyncio conflicts with uvloop on Linux, so only apply it on Windows
if sys.platform.startswith('win'):
    import nest_asyncio
    nest_asyncio.apply()

# In-process copy of recently fetched pages so scraping still works when Supabase is down
_LOCAL_RAW_CACHE: "OrderedDict[str, str]" = OrderedDict()
_LOCAL_RAW_CACHE_MAX = 50

def _remember_raw_data(unique_name: str, raw_data: str) -> None:
    _LOCAL_RAW_CACHE[unique_name] = raw_data
    _LOCAL_RAW_CACHE.move_to_end(unique_name)
    while len(_LOCAL_RAW_CACHE) > _LOCAL_RAW_CACHE_MAX:
        _LOCAL_RAW_CACHE.popitem(last=False)

def get_supabase():
    """Get supabase client lazily to avoid module-level imports"""
    return get_supabase_client()

async def get_fit_markdown_async(url: str) -> str:
    """
    Async function using crawl4ai's AsyncWebCrawler to produce the regular raw markdown.
    (Reverting from the 'fit' approach back to normal.)
    """
    robots_status = check_url_allowed(url)
    if not robots_status.get("allowed", True):
        print(f"🚫 Blocked by robots.txt: {url} | rule: {robots_status.get('matched_rule')}")
        return ""

    # Import crawl4ai only when needed to avoid Playwright subprocess issues at startup
    from crawl4ai import AsyncWebCrawler

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
    and return the 'raw_data' field. If Supabase is unavailable, fall
    back to the in-process cache, then to an empty string.
    """
    if unique_name in _LOCAL_RAW_CACHE:
        return _LOCAL_RAW_CACHE[unique_name]

    supabase = get_supabase()
    if not supabase:
        print("WARN: Supabase credentials missing; skipping cache lookup.")
        return ""

    try:
        response = (
            supabase.table("scraped_data")
            .select("raw_data")
            .eq("unique_name", unique_name)
            .execute()
        )
        data = response.data
        if data and len(data) > 0:
            return data[0].get("raw_data", "")
    except Exception as exc:
        print(f"WARN: Supabase lookup failed for {unique_name}: {exc}")
    return ""

def save_raw_data(unique_name: str, url: str, raw_data: str) -> None:
    """
    Save or update the row in supabase with unique_name, url, and raw_data.
    If Supabase is unavailable or times out, log and continue without failing
    the scraping flow.
    """
    _remember_raw_data(unique_name, raw_data)

    supabase = get_supabase()
    if not supabase:
        print("WARN: Supabase credentials missing; skipping cache save.")
        return

    try:
        supabase.table("scraped_data").upsert(
            {
                "unique_name": unique_name,
                "url": url,
                "raw_data": raw_data,
            },
            on_conflict="id",
        ).execute()
        BLUE = "\033[34m"
        RESET = "\033[0m"
        print(f"{BLUE}INFO:Raw data stored for {unique_name}{RESET}")
    except Exception as exc:
        print(f"WARN: Supabase save failed for {unique_name}: {exc}")

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

        # Check if we already have raw_data in Supabase; failures fall back to fresh fetch
        raw_data = read_raw_data(unique_name)
        if raw_data:
            print(f"{MAGENTA}Found existing data in supabase for {url} => {unique_name}{RESET}")
        else:
            # fetch fit markdown; let this raise so caller sees crawl issues, but not Supabase
            fit_md = fetch_fit_markdown(url)
            if not fit_md:
                print(f"{MAGENTA}No content fetched for {url}, skipping.{RESET}")
                continue
            print(fit_md)
            save_raw_data(unique_name, url, fit_md)
        unique_names.append(unique_name)

    return unique_names
