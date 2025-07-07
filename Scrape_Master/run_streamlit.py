#!/usr/bin/env python3
"""
Simple script to run the Streamlit app with event loop fixes
"""

import sys
import asyncio

# Apply event loop fixes for Windows and nested loops
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import nest_asyncio
nest_asyncio.apply()

if __name__ == "__main__":
    import subprocess
    import os
    
    print("🎯 Starting Streamlit Web Interface...")
    print("🌐 Opening in browser: http://localhost:8501")
    print("Press Ctrl+C to stop the server")
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    streamlit_app = os.path.join(script_dir, "streamlit_app.py")
    
    # Launch streamlit
    subprocess.run([sys.executable, "-m", "streamlit", "run", streamlit_app]) 