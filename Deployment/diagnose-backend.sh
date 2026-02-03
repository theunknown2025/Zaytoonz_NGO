#!/bin/bash

# Backend/API Diagnostic Script
# Checks why the backend is not working

set -e

echo "================================================================"
echo "  Backend/API Diagnostic Tool"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
APP_NAME="${APP_NAME:-zaytoonz-test}"
APP_PORT="${APP_PORT:-3001}"
VPS_IP="${VPS_IP:-72.62.176.80}"

cd "$APP_DIR"

echo "[*] Checking backend status..."
echo ""

# 1. Check if PM2 is running
echo "=== 1. PM2 Status ==="
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME.*online"; then
        echo -e "${GREEN}✓${NC} PM2 app '$APP_NAME' is running"
        pm2 status "$APP_NAME"
    else
        echo -e "${RED}✗${NC} PM2 app '$APP_NAME' is NOT running"
        echo ""
        echo "Attempting to start..."
        pm2 start ecosystem.test.config.js 2>/dev/null || pm2 start server.js --name "$APP_NAME" --update-env
        sleep 2
        if pm2 list | grep -q "$APP_NAME.*online"; then
            echo -e "${GREEN}✓${NC} App started successfully"
        else
            echo -e "${RED}✗${NC} Failed to start app"
            echo "Check logs: pm2 logs $APP_NAME"
        fi
    fi
else
    echo -e "${RED}✗${NC} PM2 not installed"
fi
echo ""

# 2. Check if port is listening
echo "=== 2. Port Status ==="
if netstat -tuln 2>/dev/null | grep -q ":$APP_PORT " || ss -tuln 2>/dev/null | grep -q ":$APP_PORT "; then
    echo -e "${GREEN}✓${NC} Port $APP_PORT is listening"
    netstat -tuln 2>/dev/null | grep ":$APP_PORT " || ss -tuln 2>/dev/null | grep ":$APP_PORT "
else
    echo -e "${RED}✗${NC} Port $APP_PORT is NOT listening"
    echo "  The backend server is not running on this port"
fi
echo ""

# 3. Test local API endpoint
echo "=== 3. Local API Test ==="
echo "[*] Testing: http://localhost:$APP_PORT/test/api/opportunities"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT/test/api/opportunities" --max-time 5 || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✓${NC} API responds locally (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗${NC} API not responding (connection refused/timeout)"
    echo "  The backend server is not running or not accessible"
else
    echo -e "${YELLOW}!${NC} API returned HTTP $HTTP_CODE"
    echo "  Testing with verbose output..."
    curl -v "http://localhost:$APP_PORT/test/api/opportunities" --max-time 5 2>&1 | head -20
fi
echo ""

# 4. Check PM2 logs for errors
echo "=== 4. Recent PM2 Logs ==="
if pm2 list | grep -q "$APP_NAME"; then
    echo "[*] Last 10 lines of PM2 logs:"
    pm2 logs "$APP_NAME" --lines 10 --nostream 2>/dev/null || echo "  (No logs available)"
    
    # Check for common errors
    ERROR_COUNT=$(pm2 logs "$APP_NAME" --lines 50 --nostream 2>/dev/null | grep -i "error\|failed\|exception" | wc -l || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}✗${NC} Found $ERROR_COUNT error(s) in logs"
        echo "  View full logs: pm2 logs $APP_NAME"
    else
        echo -e "${GREEN}✓${NC} No obvious errors in recent logs"
    fi
else
    echo -e "${YELLOW}!${NC} Cannot check logs (app not running)"
fi
echo ""

# 5. Check environment variables
echo "=== 5. Environment Variables ==="
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check critical variables
    if grep -q "NEXT_PUBLIC_BASE_PATH=/test" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_BASE_PATH is set"
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_BASE_PATH not set to /test"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && ! grep -q "your_supabase_url_here" .env.local; then
        SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2 | tr -d ' ' | tr -d '"')
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL is set: ${SUPABASE_URL:0:30}..."
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL missing or has placeholder"
    fi
    
    if grep -q "PORT=$APP_PORT" .env.local || grep -q "PORT=3001" .env.local; then
        echo -e "${GREEN}✓${NC} PORT is configured"
    else
        echo -e "${YELLOW}!${NC} PORT may not be set in .env.local"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found!"
fi
echo ""

# 6. Check Nginx configuration
echo "=== 6. Nginx Configuration ==="
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx is running"
    
    # Check if API route is configured
    if grep -q "/test/api/" /etc/nginx/sites-enabled/* 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Nginx has /test/api/ route configured"
    else
        echo -e "${RED}✗${NC} Nginx missing /test/api/ route configuration"
    fi
    
    # Test external access
    echo "[*] Testing external API access..."
    EXTERNAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$VPS_IP/test/api/opportunities" --max-time 5 || echo "000")
    if [ "$EXTERNAL_CODE" = "200" ] || [ "$EXTERNAL_CODE" = "301" ] || [ "$EXTERNAL_CODE" = "302" ]; then
        echo -e "${GREEN}✓${NC} API accessible externally (HTTP $EXTERNAL_CODE)"
    else
        echo -e "${RED}✗${NC} API not accessible externally (HTTP $EXTERNAL_CODE)"
        echo "  Check Nginx configuration and firewall"
    fi
else
    echo -e "${RED}✗${NC} Nginx is not running"
    echo "  Start with: systemctl start nginx"
fi
echo ""

# 7. Check if .next directory exists
echo "=== 7. Build Status ==="
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} .next directory exists (app has been built)"
    BUILD_SIZE=$(du -sh .next | cut -f1)
    echo "  Build size: $BUILD_SIZE"
else
    echo -e "${RED}✗${NC} .next directory not found!"
    echo "  The app has not been built. Run: npm run build"
fi
echo ""

# 8. Check server.js exists
echo "=== 8. Server Files ==="
if [ -f "server.js" ]; then
    echo -e "${GREEN}✓${NC} server.js exists"
else
    echo -e "${RED}✗${NC} server.js not found!"
fi

if [ -f "ecosystem.test.config.js" ]; then
    echo -e "${GREEN}✓${NC} ecosystem.test.config.js exists"
else
    echo -e "${YELLOW}!${NC} ecosystem.test.config.js not found (using server.js directly)"
fi
echo ""

# Summary and recommendations
echo "================================================================"
echo "  Diagnostic Summary"
echo "================================================================"
echo ""

# Provide fix recommendations
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${RED}[ISSUE]${NC} PM2 app is not running"
    echo "  Fix: pm2 start ecosystem.test.config.js"
    echo "  Or: pm2 start server.js --name $APP_NAME --update-env"
    echo ""
fi

if ! netstat -tuln 2>/dev/null | grep -q ":$APP_PORT " && ! ss -tuln 2>/dev/null | grep -q ":$APP_PORT "; then
    echo -e "${RED}[ISSUE]${NC} Port $APP_PORT is not listening"
    echo "  Fix: Start the app with PM2"
    echo ""
fi

if [ ! -d ".next" ]; then
    echo -e "${RED}[ISSUE]${NC} Application not built"
    echo "  Fix: export NEXT_PUBLIC_BASE_PATH=/test && npm run build"
    echo ""
fi

if [ ! -f ".env.local" ]; then
    echo -e "${RED}[ISSUE]${NC} .env.local missing"
    echo "  Fix: Create .env.local with required variables"
    echo ""
fi

echo "Useful commands:"
echo "  pm2 logs $APP_NAME              # View application logs"
echo "  pm2 restart $APP_NAME           # Restart the app"
echo "  pm2 status                      # Check PM2 status"
echo "  curl http://localhost:$APP_PORT/test/api/opportunities  # Test API locally"
echo "  systemctl status nginx          # Check Nginx status"
echo "  tail -f /var/log/nginx/error.log  # View Nginx errors"
echo ""













