#!/bin/bash

# Comprehensive 404 Fix Script
# Diagnoses and fixes 404 errors on /beta path

set -e

echo "================================================================"
echo "  Diagnose and Fix 404 Error - /beta Path"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
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

echo "[*] Domain: $DOMAIN"
echo "[*] App Port: $APP_PORT"
echo "[*] App Name: $APP_NAME"
echo "[*] Nginx Config: $NGINX_CONFIG"
echo ""

# Step 1: Check if PM2 app is running
echo "=== Step 1: Checking PM2 App ==="
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}[OK] PM2 app '$APP_NAME' is running${NC}"
    pm2 status "$APP_NAME" | grep "$APP_NAME"
else
    echo -e "${RED}[ERROR] PM2 app '$APP_NAME' is NOT running!${NC}"
    echo "[*] Starting app..."
    cd "$APP_DIR"
    if [ -f "ecosystem.production.config.js" ]; then
        pm2 start ecosystem.production.config.js --update-env
    elif [ -f "ecosystem.test.config.js" ]; then
        pm2 start ecosystem.test.config.js --update-env
    else
        pm2 start server.js --name "$APP_NAME" --update-env --env production -- \
            NODE_ENV=production PORT="$APP_PORT" NEXT_PUBLIC_BASE_PATH=/beta
    fi
    pm2 save
    sleep 3
fi
echo ""

# Step 2: Test local app connection
echo "=== Step 2: Testing Local App Connection ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT/beta" --max-time 5 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}[OK] App responds on localhost:$APP_PORT/beta (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}[ERROR] App NOT responding on localhost:$APP_PORT/beta (HTTP $HTTP_CODE)${NC}"
    echo "[*] This is the root cause!"
    echo "[*] Checking PM2 logs..."
    pm2 logs "$APP_NAME" --lines 20 --nostream
    echo ""
    echo "Try:"
    echo "  1. Check .env.local has NEXT_PUBLIC_BASE_PATH=/beta"
    echo "  2. Rebuild: cd $APP_DIR && export NEXT_PUBLIC_BASE_PATH=/beta && npm run build"
    echo "  3. Restart: pm2 restart $APP_NAME --update-env"
    exit 1
fi
echo ""

# Step 3: Check Nginx config exists
echo "=== Step 3: Checking Nginx Configuration ==="
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}[ERROR] Nginx config not found: $NGINX_CONFIG${NC}"
    echo "[*] Creating new configuration..."
else
    echo -e "${GREEN}[OK] Nginx config exists${NC}"
    echo "[*] Backing up existing config..."
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
fi
echo ""

# Step 4: Create/Update Nginx config
echo "=== Step 4: Creating Nginx Configuration ==="
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

    # /beta - Next.js application (EXACT MATCH FIRST)
    location = /beta {
        return 301 /beta/;
    }

    # /beta/ - Next.js application
    location /beta/ {
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
    }

    # /beta - Next.js application (fallback for paths without trailing slash)
    location /beta {
        proxy_pass http://localhost:$APP_PORT/beta;
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

echo -e "${GREEN}[OK] Nginx configuration created${NC}"
echo ""

# Step 5: Enable site
echo "=== Step 5: Enabling Nginx Site ==="
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
echo -e "${GREEN}[OK] Site enabled${NC}"
echo ""

# Step 6: Test Nginx config
echo "=== Step 6: Testing Nginx Configuration ==="
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}[OK] Nginx configuration is valid${NC}"
else
    echo -e "${RED}[ERROR] Nginx configuration has errors!${NC}"
    nginx -t
    exit 1
fi
echo ""

# Step 7: Reload Nginx
echo "=== Step 7: Reloading Nginx ==="
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK] Nginx reloaded${NC}"
else
    echo -e "${RED}[ERROR] Failed to reload Nginx${NC}"
    exit 1
fi
echo ""

# Step 8: Test external connection
echo "=== Step 8: Testing External Connection ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/beta" --max-time 10 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}[SUCCESS] Domain responds: http://$DOMAIN/beta (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}[!] Domain returned HTTP $HTTP_CODE${NC}"
    echo "[*] Testing with verbose output..."
    curl -v "http://$DOMAIN/beta" 2>&1 | head -30
    echo ""
    echo "If still 404, check:"
    echo "  1. PM2 logs: pm2 logs $APP_NAME"
    echo "  2. Nginx logs: tail -f /var/log/nginx/error.log"
    echo "  3. Local test: curl http://localhost:$APP_PORT/beta"
fi
echo ""

# Summary
echo "================================================================"
echo -e "${GREEN}  Diagnosis and Fix Complete!${NC}"
echo "================================================================"
echo ""
echo "Configuration:"
echo "  Nginx Config: $NGINX_CONFIG"
echo "  App Port: $APP_PORT"
echo "  App Name: $APP_NAME"
echo ""
echo "Test URLs:"
echo "  http://$DOMAIN/beta"
echo "  https://$DOMAIN/beta (if SSL configured)"
echo ""
echo "If still having issues:"
echo "  1. Check PM2: pm2 status && pm2 logs $APP_NAME"
echo "  2. Check Nginx: nginx -t && tail -f /var/log/nginx/error.log"
echo "  3. Test locally: curl http://localhost:$APP_PORT/beta"
echo ""
