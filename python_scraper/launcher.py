#!/usr/bin/env python3
"""
Launcher script for Scrape_Master applications
Handles event loop setup to prevent conflicts
"""

import sys
import asyncio
import argparse

# Keep event loop setup minimal here.
# Do NOT apply nest_asyncio globally in launcher; it breaks uvicorn startup on recent versions.
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

def launch_streamlit():
    """Launch the Streamlit application"""
    import subprocess
    import os
    if sys.platform.startswith('win'):
        import nest_asyncio
        nest_asyncio.apply()
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    streamlit_app = os.path.join(script_dir, "streamlit_app.py")
    
    # Launch streamlit
    subprocess.run([sys.executable, "-m", "streamlit", "run", streamlit_app])

def launch_api():
    """Launch the FastAPI application"""
    import uvicorn
    from api_wrapper import app
    
    print("Starting Scrape Master API...")
    print("API Documentation: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    
    # When launching programmatically, keep reload disabled (reload needs import-string style app).
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

def main():
    parser = argparse.ArgumentParser(description="Launch Scrape Master Application")
    parser.add_argument(
        "mode", 
        choices=["streamlit", "api", "ui"], 
        help="Mode to run: 'streamlit' for web UI, 'api' for REST API, 'ui' is alias for streamlit"
    )
    
    args = parser.parse_args()
    
    # Handle ui alias
    if args.mode == "ui":
        args.mode = "streamlit"
    
    if args.mode == "streamlit":
        print("Launching Streamlit Web Interface...")
        launch_streamlit()
    elif args.mode == "api":
        print("Launching FastAPI REST API...")
        launch_api()

if __name__ == "__main__":
    main() 