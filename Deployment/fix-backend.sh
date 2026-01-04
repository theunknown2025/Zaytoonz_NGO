#!/bin/bash

# Fix Backend/API Issues
# Automatically fixes common backend problems

set -e

echo "================================================================"
echo "  Fix Backend/API Issues"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
APP_NAME="${APP_NAME:-zaytoonz-test}"
APP_PORT="${APP_PORT:-3001}"
BASE_PATH="${BASE_PATH:-/test}"

cd "$APP_DIR"

# Step 1: Check and fix .env.local
echo "[*] Step 1: Checking .env.local..."
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗${NC} .env.local not found. Creating..."
    bash Deployment/04-configure-environment.sh
else
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check for placeholder values
    if grep -q "your_supabase_url_here\|your_supabase_anon_key_here" .env.local; then
        echo -e "${RED}✗${NC} Found placeholder values!"
        echo "  Please run: bash Deployment/fix-env-file.sh"
        exit 1
    fi
fi
echo ""

# Step 2: Ensure app is built
echo "[*] Step 2: Checking build..."
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}!${NC} App not built. Building now..."
    rm -rf .next node_modules/.cache
    export NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
    npm run build
    echo -e "${GREEN}✓${NC} Build complete"
else
    echo -e "${GREEN}✓${NC} App is built"
fi
echo ""

# Step 3: Stop existing PM2 instance
echo "[*] Step 3: Managing PM2..."
pm2 delete "$APP_NAME" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Cleared old PM2 instance"
echo ""

# Step 4: Start with PM2
echo "[*] Step 4: Starting application with PM2..."
if [ -f "ecosystem.test.config.js" ]; then
    pm2 start ecosystem.test.config.js
    echo -e "${GREEN}✓${NC} Started with ecosystem.test.config.js"
else
    pm2 start server.js \
        --name "$APP_NAME" \
        --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT="$APP_PORT" \
        NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
    echo -e "${GREEN}✓${NC} Started with server.js"
fi

pm2 save
echo ""

# Step 5: Wait a moment for app to start
echo "[*] Step 5: Waiting for app to start..."
sleep 3

# Step 6: Verify it's running
echo "[*] Step 6: Verifying backend..."
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}✓${NC} PM2 shows app is online"
else
    echo -e "${RED}✗${NC} App is not showing as online"
    echo "  Check logs: pm2 logs $APP_NAME"
    exit 1
fi

# Step 7: Test API endpoint
echo "[*] Step 7: Testing API endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT$BASE_PATH/api/opportunities" --max-time 10 || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✓${NC} API is responding (HTTP $HTTP_CODE)"
else
    echo -e "${YELLOW}!${NC} API returned HTTP $HTTP_CODE"
    echo "  This might be normal if the endpoint requires authentication"
    echo "  Check logs: pm2 logs $APP_NAME"
fi
echo ""

# Step 8: Check Nginx
echo "[*] Step 8: Checking Nginx..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx is running"
    
    # Reload Nginx to ensure latest config
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✓${NC} Nginx reloaded"
else
    echo -e "${YELLOW}!${NC} Nginx is not running"
    echo "  Start with: systemctl start nginx"
fi
echo ""

echo "================================================================"
echo -e "${GREEN}  Backend Fix Complete${NC}"
echo "================================================================"
echo ""
echo "Backend Status:"
pm2 status "$APP_NAME"
echo ""
echo "Test the API:"
echo "  Local:  curl http://localhost:$APP_PORT$BASE_PATH/api/opportunities"
echo "  External: curl http://72.62.176.80$BASE_PATH/api/opportunities"
echo ""
echo "View logs:"
echo "  pm2 logs $APP_NAME"
echo ""






