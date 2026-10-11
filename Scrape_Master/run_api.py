#!/usr/bin/env python3
"""
Simple script to run the FastAPI server with event loop fixes
"""

import sys
import asyncio

# Apply event loop fixes for Windows and nested loops
# nest_asyncio must not be applied here: it replaces asyncio.run without the
# loop_factory argument that uvicorn needs. api_wrapper applies it after startup.
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Scrape Master API...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/health")
    print("Press Ctrl+C to stop the server")
    
    # Use import string to enable proper reload functionality and avoid import issues
    uvicorn.run("api_wrapper:app", host="0.0.0.0", port=8000, reload=True) 