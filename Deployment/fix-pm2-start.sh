#!/bin/bash

# Fix PM2 Start Script
# This script ensures the application is properly started with PM2
# Handles the /beta path configuration and correct port settings

set -e

echo "================================================================"
echo "  Fix PM2 Start - Zaytoonz NGO"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
APP_NAME="${APP_NAME:-zaytoonz-ngo}"
PORT="${PORT:-3001}"
BASE_PATH="${BASE_PATH:-/beta}"

cd "$APP_DIR"

echo "[*] App Directory: $APP_DIR"
echo "[*] App Name: $APP_NAME"
echo "[*] Port: $PORT"
echo "[*] Base Path: $BASE_PATH"
echo ""

# Step 1: Check if app is built
echo "=== Step 1: Checking Build Status ==="
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}[!] App not built. Building now...${NC}"
    export NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
    npm run build
    
    if [ ! -d ".next" ]; then
        echo -e "${RED}[ERROR] Build failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK] Build completed${NC}"
else
    echo -e "${GREEN}[OK] App is already built${NC}"
fi
echo ""

# Step 2: Check .env.local
echo "=== Step 2: Checking Environment File ==="
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[!] .env.local not found. Creating template...${NC}"
    cat > .env.local << EOF
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=$BASE_PATH

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Node Environment
NODE_ENV=production
PORT=$PORT
HOSTNAME=localhost

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://zaytoonz.com$BASE_PATH

# External Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
EOF
    echo -e "${YELLOW}[WARNING] Created .env.local template. Please update with your actual values!${NC}"
    echo "  Run: nano $APP_DIR/.env.local"
else
    # Update NEXT_PUBLIC_BASE_PATH if it exists
    if grep -q "NEXT_PUBLIC_BASE_PATH" .env.local; then
        sed -i "s|NEXT_PUBLIC_BASE_PATH=.*|NEXT_PUBLIC_BASE_PATH=$BASE_PATH|g" .env.local
        echo -e "${GREEN}[OK] Updated NEXT_PUBLIC_BASE_PATH in .env.local${NC}"
    else
        echo "NEXT_PUBLIC_BASE_PATH=$BASE_PATH" >> .env.local
        echo -e "${GREEN}[OK] Added NEXT_PUBLIC_BASE_PATH to .env.local${NC}"
    fi
    
    # Update PORT if it exists
    if grep -q "^PORT=" .env.local; then
        sed -i "s|^PORT=.*|PORT=$PORT|g" .env.local
    else
        echo "PORT=$PORT" >> .env.local
    fi
    
    # Update NEXTAUTH_URL if it exists
    if grep -q "NEXTAUTH_URL" .env.local; then
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://zaytoonz.com$BASE_PATH|g" .env.local
    fi
    
    echo -e "${GREEN}[OK] .env.local is configured${NC}"
fi
echo ""

# Step 3: Stop existing PM2 processes
echo "=== Step 3: Stopping Existing Processes ==="
pm2 delete "$APP_NAME" 2>/dev/null || echo "[*] No existing process to stop"
pm2 delete "python-scraper" 2>/dev/null || echo "[*] No existing scraper to stop"
echo ""

# Step 4: Update ecosystem config if needed
echo "=== Step 4: Checking Ecosystem Config ==="
if [ -f "ecosystem.production.config.js" ]; then
    echo "[*] Found ecosystem.production.config.js"
    
    # Check if port needs updating
    if grep -q '"PORT": 3000' ecosystem.production.config.js; then
        echo "[*] Updating port from 3000 to $PORT in ecosystem config..."
        sed -i "s/\"PORT\": 3000/\"PORT\": $PORT/g" ecosystem.production.config.js
        echo -e "${GREEN}[OK] Port updated${NC}"
    fi
    
    # Check if base path is set
    if ! grep -q "NEXT_PUBLIC_BASE_PATH" ecosystem.production.config.js; then
        echo "[*] Adding NEXT_PUBLIC_BASE_PATH to ecosystem config..."
        # This is a bit complex, so we'll handle it via environment variables instead
        echo "[*] Will set via PM2 environment variables"
    fi
    
    echo "[*] Using ecosystem.production.config.js"
    USE_ECOSYSTEM=true
elif [ -f "ecosystem.test.config.js" ]; then
    echo "[*] Found ecosystem.test.config.js"
    USE_ECOSYSTEM=true
else
    echo "[*] No ecosystem config found, will use server.js"
    USE_ECOSYSTEM=false
fi
echo ""

# Step 5: Start with PM2
echo "=== Step 5: Starting Application with PM2 ==="
if [ "$USE_ECOSYSTEM" = true ]; then
    if [ -f "ecosystem.production.config.js" ]; then
        echo "[*] Starting with ecosystem.production.config.js..."
        # Set environment variables and start
        NEXT_PUBLIC_BASE_PATH="$BASE_PATH" PORT="$PORT" pm2 start ecosystem.production.config.js --update-env
    else
        echo "[*] Starting with ecosystem.test.config.js..."
        NEXT_PUBLIC_BASE_PATH="$BASE_PATH" PORT="$PORT" pm2 start ecosystem.test.config.js --update-env
    fi
else
    echo "[*] Starting with server.js..."
    pm2 start server.js \
        --name "$APP_NAME" \
        --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT="$PORT" \
        NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
fi

# Wait a moment for app to start
sleep 2

# Step 6: Verify PM2 status
echo ""
echo "=== Step 6: Verifying PM2 Status ==="
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}[SUCCESS] Application is running!${NC}"
    pm2 status "$APP_NAME"
else
    echo -e "${RED}[ERROR] Application failed to start${NC}"
    echo "[*] Checking logs..."
    pm2 logs "$APP_NAME" --lines 20 --nostream
    exit 1
fi
echo ""

# Step 7: Save PM2 configuration
echo "=== Step 7: Saving PM2 Configuration ==="
pm2 save
echo -e "${GREEN}[OK] PM2 configuration saved${NC}"
echo ""

# Step 8: Test local connection
echo "=== Step 8: Testing Local Connection ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$BASE_PATH" --max-time 5 || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}[OK] Application responds on http://localhost:$PORT$BASE_PATH (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}[!] Application may not be responding correctly (HTTP $HTTP_CODE)${NC}"
    echo "[*] Check logs: pm2 logs $APP_NAME"
fi
echo ""

# Summary
echo "================================================================"
echo -e "${GREEN}  PM2 Start Fix Complete!${NC}"
echo "================================================================"
echo ""
echo "Application Status:"
pm2 status "$APP_NAME" | grep "$APP_NAME" || pm2 status
echo ""
echo "Useful Commands:"
echo "  pm2 logs $APP_NAME              # View application logs"
echo "  pm2 restart $APP_NAME            # Restart the app"
echo "  pm2 status                       # Check PM2 status"
echo "  curl http://localhost:$PORT$BASE_PATH  # Test locally"
echo ""
echo "Next Steps:"
echo "  1. Make sure .env.local has your actual Supabase keys"
echo "  2. If you updated .env.local, restart: pm2 restart $APP_NAME --update-env"
echo "  3. Verify Nginx is configured: bash Deployment/07-configure-nginx.sh"
echo ""
