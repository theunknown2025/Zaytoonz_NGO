#!/bin/bash

echo "🚀 Starting Enhanced Morchid AI Service with Database Integration..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if we're in the right directory
if [ ! -f "enhanced_app.py" ]; then
    echo "❌ enhanced_app.py not found. Please run this script from the morchid-ai-service directory."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if Supabase configuration is set
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "⚠️  Warning: SUPABASE_SERVICE_KEY environment variable not set."
    echo "   The service will work with limited functionality."
    echo "   To enable full database integration, set SUPABASE_SERVICE_KEY"
fi

# Test configuration
echo "🔍 Testing configuration..."
python3 -c "
import os
import sys
sys.path.append('.')
from config import Config

status = Config.validate_config()
print('Configuration Status:')
for key, value in status.items():
    print(f'  {key}: {value}')

if not status['service_ready']:
    print('❌ Service not ready:', status.get('error', 'Unknown error'))
    exit(1)
else:
    print('✅ Service ready to start')
"

if [ $? -ne 0 ]; then
    echo "❌ Configuration test failed. Please check your settings."
    exit 1
fi

echo "🌟 Starting Enhanced Morchid AI Service on http://localhost:8001"
echo "📊 Database Integration: Enabled"
echo "🤖 NLWeb Integration: Available"
echo "💬 Chat Interface: Ready"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the enhanced service
python3 enhanced_app.py
