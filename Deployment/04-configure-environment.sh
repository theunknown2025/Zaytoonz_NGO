#!/bin/bash

# Step 4: Configure Environment Variables
# Sets up .env.local file with required variables

set -e

echo "================================================================"
echo "  Step 4: Configuring Environment Variables"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
ENV_FILE="$APP_DIR/.env.local"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"

cd "$APP_DIR"

echo "[*] Environment file: $ENV_FILE"
echo ""

# Check if .env.local exists
if [ -f "$ENV_FILE" ]; then
    echo "[*] .env.local already exists"
    
    # Check if NEXT_PUBLIC_BASE_PATH is set
    if grep -q "NEXT_PUBLIC_BASE_PATH" "$ENV_FILE"; then
        echo -e "${GREEN}  ✓${NC} NEXT_PUBLIC_BASE_PATH is configured"
    else
        echo -e "${YELLOW}  !${NC} Adding NEXT_PUBLIC_BASE_PATH..."
        echo "" >> "$ENV_FILE"
        echo "# Base path for subdirectory deployment" >> "$ENV_FILE"
        echo "NEXT_PUBLIC_BASE_PATH=/beta" >> "$ENV_FILE"
    fi
else
    echo "[*] Creating .env.local file..."
    cat > "$ENV_FILE" << EOF
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/beta

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://zaytoonz.com/beta

# External Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
EOF
    echo -e "${YELLOW}[WARNING] Created .env.local template. Please update with your actual values!${NC}"
fi

echo ""
echo "[*] Current environment variables:"
echo "  NEXT_PUBLIC_BASE_PATH: $(grep NEXT_PUBLIC_BASE_PATH "$ENV_FILE" | cut -d'=' -f2 || echo 'not set')"
echo "  NODE_ENV: $(grep NODE_ENV "$ENV_FILE" | cut -d'=' -f2 || echo 'not set')"
echo "  PORT: $(grep PORT "$ENV_FILE" | cut -d'=' -f2 || echo 'not set')"

echo ""
echo -e "${YELLOW}[IMPORTANT] Please verify and update .env.local with your actual values:${NC}"
echo "  nano $ENV_FILE"

