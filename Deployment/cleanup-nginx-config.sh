#!/bin/bash

# Cleanup Corrupted Nginx Config Files
# Removes malformed config files and ensures correct configuration

set -e

echo "================================================================"
echo "  Cleanup Corrupted Nginx Config Files"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="${DOMAIN:-zaytoonz.com}"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"
APP_PORT="${APP_PORT:-3001}"

# Determine nginx config file
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NGINX_CONFIG="/etc/nginx/sites-available/zaytoonz-ip"
    SERVER_NAME="$DOMAIN _"
else
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
    SERVER_NAME="$DOMAIN www.$DOMAIN"
fi

echo "[*] Domain: $DOMAIN"
echo "[*] Correct Config File: $NGINX_CONFIG"
echo ""

# Step 1: List current files
echo "=== Step 1: Current Nginx Config Files ==="
echo "[*] Files in /etc/nginx/sites-available/:"
ls -la /etc/nginx/sites-available/ | grep -E "zaytoonz|default" || echo "  (none found)"
echo ""

echo "[*] Files in /etc/nginx/sites-enabled/:"
ls -la /etc/nginx/sites-enabled/ | grep -E "zaytoonz|default" || echo "  (none found)"
echo ""

# Step 2: Remove corrupted files
echo "=== Step 2: Removing Corrupted Files ==="
cd /etc/nginx/sites-available/

# Remove files with encoding issues
for file in *; do
    if [[ "$file" == *"$'\303"* ]] || [[ "$file" == *"$'\303\303"* ]]; then
        echo "[*] Removing corrupted file: $file"
        rm -f "$file"
    fi
done

# Remove any files that don't match our expected names
for file in zaytoonz*; do
    if [ -f "$file" ] && [ "$file" != "zaytoonz.com" ] && [ "$file" != "zaytoonz-ip" ] && [ "$file" != "zaytoonz" ]; then
        echo "[*] Removing unexpected file: $file"
        rm -f "$file"
    fi
done

echo -e "${GREEN}[OK] Corrupted files removed${NC}"
echo ""

# Step 3: Clean up sites-enabled
echo "=== Step 3: Cleaning Up sites-enabled ==="
cd /etc/nginx/sites-enabled/

# Remove all zaytoonz links
rm -f zaytoonz*
rm -f default

# Remove any corrupted symlinks
for link in *; do
    if [[ "$link" == *"$'\303"* ]] || [[ "$link" == *"$'\303\303"* ]]; then
        echo "[*] Removing corrupted symlink: $link"
        rm -f "$link"
    fi
done

echo -e "${GREEN}[OK] sites-enabled cleaned${NC}"
echo ""

# Step 4: Create correct nginx config
echo "=== Step 4: Creating Correct Nginx Configuration ==="
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
        # Always proxy to /beta/ (with trailing slash) to match Next.js trailingSlash config
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

echo -e "${GREEN}[OK] Nginx configuration created${NC}"
echo ""

# Step 5: Enable the correct site
echo "=== Step 5: Enabling Correct Site ==="
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
echo -e "${GREEN}[OK] Site enabled${NC}"
echo ""

# Step 6: Verify enabled sites
echo "=== Step 6: Verifying Enabled Sites ==="
echo "[*] Currently enabled sites:"
ls -la /etc/nginx/sites-enabled/
echo ""

# Step 7: Test Nginx config
echo "=== Step 7: Testing Nginx Configuration ==="
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}[OK] Nginx configuration is valid${NC}"
else
    echo -e "${RED}[ERROR] Nginx configuration has errors!${NC}"
    nginx -t
    exit 1
fi
echo ""

# Step 8: Reload Nginx
echo "=== Step 8: Reloading Nginx ==="
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK] Nginx reloaded${NC}"
else
    echo -e "${RED}[ERROR] Failed to reload Nginx${NC}"
    exit 1
fi
echo ""

# Step 9: Test connection
echo "=== Step 9: Testing Connection ==="
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
echo -e "${GREEN}  Cleanup Complete!${NC}"
echo "================================================================"
echo ""
echo "Corrupted files have been removed and correct config created."
echo "Test your app: https://$DOMAIN/beta"
echo ""
