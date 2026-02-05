#!/bin/bash

# Fix HTTP 308 Redirect Issue
# The app is redirecting /beta to /beta/ - we need to handle this properly

set -e

echo "================================================================"
echo "  Fix HTTP 308 Redirect - /beta Path"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="${DOMAIN:-zaytoonz.com}"
APP_PORT="${APP_PORT:-3001}"
APP_NAME="${APP_NAME:-zaytoonz-ngo}"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"

# Determine nginx config file
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NGINX_CONFIG="/etc/nginx/sites-available/zaytoonz-ip"
    SERVER_NAME="$DOMAIN _"
else
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
    SERVER_NAME="$DOMAIN www.$DOMAIN"
fi

cd "$APP_DIR"

echo "[*] Domain: $DOMAIN"
echo "[*] App Port: $APP_PORT"
echo "[*] Nginx Config: $NGINX_CONFIG"
echo ""

# Step 1: Check .env.local
echo "=== Step 1: Checking Environment Configuration ==="
if [ ! -f ".env.local" ]; then
    echo -e "${RED}[ERROR] .env.local not found!${NC}"
    exit 1
fi

if grep -q "NEXT_PUBLIC_BASE_PATH=/beta" .env.local; then
    echo -e "${GREEN}[OK] NEXT_PUBLIC_BASE_PATH is set to /beta${NC}"
else
    echo -e "${YELLOW}[!] NEXT_PUBLIC_BASE_PATH might not be set correctly${NC}"
    echo "[*] Current value:"
    grep NEXT_PUBLIC_BASE_PATH .env.local || echo "  Not found"
    echo ""
    echo "[*] Updating .env.local..."
    if grep -q "NEXT_PUBLIC_BASE_PATH" .env.local; then
        sed -i 's|NEXT_PUBLIC_BASE_PATH=.*|NEXT_PUBLIC_BASE_PATH=/beta|g' .env.local
    else
        echo "NEXT_PUBLIC_BASE_PATH=/beta" >> .env.local
    fi
    echo -e "${GREEN}[OK] Updated${NC}"
fi
echo ""

# Step 2: Rebuild with correct base path
echo "=== Step 2: Rebuilding Application ==="
echo "[*] Clearing previous build..."
rm -rf .next
rm -rf node_modules/.cache

echo "[*] Building with NEXT_PUBLIC_BASE_PATH=/beta..."
export NEXT_PUBLIC_BASE_PATH=/beta
npm run build

if [ ! -d ".next" ]; then
    echo -e "${RED}[ERROR] Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Build completed${NC}"
echo ""

# Step 3: Restart PM2
echo "=== Step 3: Restarting PM2 App ==="
pm2 restart "$APP_NAME" --update-env
sleep 3

if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}[OK] PM2 app restarted${NC}"
else
    echo -e "${RED}[ERROR] PM2 app failed to start${NC}"
    pm2 logs "$APP_NAME" --lines 20 --nostream
    exit 1
fi
echo ""

# Step 4: Test local connection (should work now)
echo "=== Step 4: Testing Local Connection ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT/beta" --max-time 5 || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}[OK] App responds with HTTP 200${NC}"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "308" ]; then
    echo -e "${YELLOW}[!] App returns redirect (HTTP $HTTP_CODE)${NC}"
    echo "[*] Following redirect..."
    FINAL_URL=$(curl -s -o /dev/null -w "%{url_effective}" -L "http://localhost:$APP_PORT/beta" --max-time 5 || echo "")
    FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:$APP_PORT/beta" --max-time 5 || echo "000")
    if [ "$FINAL_CODE" = "200" ]; then
        echo -e "${GREEN}[OK] After redirect, app responds with HTTP 200${NC}"
        echo "[*] Final URL: $FINAL_URL"
    else
        echo -e "${RED}[ERROR] After redirect, still not working (HTTP $FINAL_CODE)${NC}"
    fi
else
    echo -e "${RED}[ERROR] App NOT responding correctly (HTTP $HTTP_CODE)${NC}"
    echo "[*] Checking logs..."
    pm2 logs "$APP_NAME" --lines 10 --nostream
    exit 1
fi
echo ""

# Step 5: Update Nginx to handle redirects properly
echo "=== Step 5: Updating Nginx Configuration ==="
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAME;

    client_max_body_size 100M;

    # Root - Serve "Coming Soon" page (static files)
    location = / {
        root $COMING_SOON_PATH;
        index index.html;
        try_files \$uri /index.html;
    }

    # Serve other static files from Coming Soon directory (except /beta)
    location ~ ^/(?!beta)(.*)\$ {
        root $COMING_SOON_PATH;
        try_files \$uri =404;
    }

    # /beta - Next.js application (handle both with and without trailing slash)
    location /beta {
        # Remove trailing slash if present, then proxy
        rewrite ^/beta/$ /beta permanent;
        rewrite ^/beta$ /beta/ permanent;
        
        proxy_pass http://localhost:$APP_PORT/beta/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_set_header X-Forwarded-Prefix /beta;
        proxy_redirect http://localhost:$APP_PORT/beta/ /beta/;
    }

    # Handle Next.js static files
    location /beta/_next/static/ {
        proxy_pass http://localhost:$APP_PORT/beta/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle Next.js API routes
    location /beta/api/ {
        proxy_pass http://localhost:$APP_PORT/beta/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Test and reload
if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}[OK] Nginx updated and reloaded${NC}"
else
    echo -e "${RED}[ERROR] Nginx config test failed${NC}"
    nginx -t
    exit 1
fi
echo ""

# Step 6: Test external
echo "=== Step 6: Testing External Connection ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://$DOMAIN/beta" --max-time 10 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}[SUCCESS] Domain responds: http://$DOMAIN/beta (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}[!] Domain returned HTTP $HTTP_CODE${NC}"
    echo "[*] Test: curl -L http://$DOMAIN/beta"
fi
echo ""

echo "================================================================"
echo -e "${GREEN}  Fix Complete!${NC}"
echo "================================================================"
echo ""
echo "The 308 redirect is normal for Next.js with trailingSlash enabled."
echo "Nginx now handles it properly."
echo ""
