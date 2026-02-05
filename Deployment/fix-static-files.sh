#!/bin/bash

# Fix Static Files 404 Errors
# Fixes favicon and other static file issues

set -e

echo "================================================================"
echo "  Fix Static Files 404 Errors"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="${DOMAIN:-zaytoonz.com}"
APP_PORT="${APP_PORT:-3001}"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"

# Determine nginx config file
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NGINX_CONFIG="/etc/nginx/sites-available/zaytoonz-ip"
else
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
fi

echo "[*] Updating Nginx config: $NGINX_CONFIG"
echo ""

# Backup existing config
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "[*] Backup created"

# Read current config and update it
cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 100M;

    # SSL configuration (if certificates exist)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Only use SSL if certificates exist
    if (!-f /etc/letsencrypt/live/$DOMAIN/fullchain.pem) {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        return 301 http://\$host\$request_uri;
    }

    # Root - Serve "Coming Soon" page (static files)
    location = / {
        root $COMING_SOON_PATH;
        index index.html;
        try_files \$uri /index.html;
    }

    # Handle favicon and common static files - try landing page first, then app
    location ~ ^/(favicon\.ico|apple-touch-icon.*|robots\.txt|sitemap\.xml)$ {
        root $COMING_SOON_PATH;
        try_files \$uri @beta_static;
        access_log off;
        log_not_found off;
    }

    # Fallback for static files to app
    location @beta_static {
        proxy_pass http://localhost:$APP_PORT/beta\$uri;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
        log_not_found off;
    }

    # Serve other static files from Coming Soon directory (except /beta)
    location ~ ^/(?!beta)(.*)\$ {
        root $COMING_SOON_PATH;
        try_files \$uri =404;
    }

    # /beta - Next.js application
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

# Test and reload
echo "[*] Testing Nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}[OK] Nginx configuration is valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}[SUCCESS] Nginx reloaded${NC}"
else
    echo -e "${RED}[ERROR] Nginx configuration test failed${NC}"
    echo "[*] Restoring backup..."
    mv "$NGINX_CONFIG.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi

echo ""
echo "================================================================"
echo -e "${GREEN}  Static Files Fix Complete!${NC}"
echo "================================================================"
echo ""
echo "The favicon errors should be reduced now."
echo "These errors are mostly cosmetic and don't affect functionality."
echo ""
