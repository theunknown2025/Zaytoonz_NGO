#!/bin/bash

# Step 7: Configure Nginx
# Sets up Nginx reverse proxy configuration

set -e

echo "================================================================"
echo "  Step 7: Configuring Nginx"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="${DOMAIN:-zaytoonz.com}"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"
APP_PORT="${APP_PORT:-3001}"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"

echo "[*] Domain: $DOMAIN"
echo "[*] Coming Soon path: $COMING_SOON_PATH"
echo "[*] App port: $APP_PORT"
echo ""

# Create Nginx configuration
echo "[*] Creating Nginx configuration..."
cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 100M;

    # Root - Serve "Coming Soon" page (static files)
    location = / {
        root $COMING_SOON_PATH;
        index index.html;
        try_files \$uri /index.html;
    }

    # Serve other static files from Coming Soon directory (except /test)
    location ~ ^/(?!test)(.*)\$ {
        root $COMING_SOON_PATH;
        try_files \$uri =404;
    }

    # /test - Next.js application
    location /test {
        proxy_pass http://localhost:$APP_PORT/test;
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
        proxy_set_header X-Forwarded-Prefix /test;
    }

    # Handle Next.js static files
    location /test/_next/static/ {
        proxy_pass http://localhost:$APP_PORT/test/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle Next.js API routes
    location /test/api/ {
        proxy_pass http://localhost:$APP_PORT/test/api/;
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

# Enable site
echo "[*] Enabling Nginx site..."
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "[*] Testing Nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}[OK] Nginx configuration is valid${NC}"
    
    # Reload Nginx
    echo "[*] Reloading Nginx..."
    systemctl reload nginx
    echo -e "${GREEN}[SUCCESS] Nginx configured and reloaded${NC}"
else
    echo -e "${RED}[ERROR] Nginx configuration test failed${NC}"
    echo "[*] Check the configuration file: $NGINX_CONFIG"
    exit 1
fi

echo ""
echo "[*] Nginx status:"
systemctl status nginx --no-pager -l | head -n 5

