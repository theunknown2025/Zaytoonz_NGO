#!/bin/bash

# Quick configuration script to switch from domain to IP address
# Run this on your VPS to configure everything for IP-based access

set -e

echo "================================================================"
echo "  Configure for IP Address Access"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
VPS_IP="${VPS_IP:-72.62.176.80}"
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"

echo "[*] VPS IP Address: $VPS_IP"
echo "[*] App Directory: $APP_DIR"
echo ""

cd "$APP_DIR"

# Step 1: Update .env.local
echo "[*] Step 1: Updating .env.local..."
if [ -f ".env.local" ]; then
    # Backup existing file
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓${NC} Backup created"
    
    # Update NEXTAUTH_URL if it exists
    if grep -q "NEXTAUTH_URL" .env.local; then
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$VPS_IP/test|g" .env.local
        echo -e "${GREEN}✓${NC} Updated NEXTAUTH_URL to use IP"
    else
        echo "NEXTAUTH_URL=http://$VPS_IP/test" >> .env.local
        echo -e "${GREEN}✓${NC} Added NEXTAUTH_URL"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found. Please create it first."
    exit 1
fi

# Step 2: Configure Nginx for IP
echo ""
echo "[*] Step 2: Configuring Nginx for IP address..."
cat > /etc/nginx/sites-available/zaytoonz-ip << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $VPS_IP _;

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
        proxy_pass http://localhost:3001/test;
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
        proxy_pass http://localhost:3001/test/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle Next.js API routes
    location /test/api/ {
        proxy_pass http://localhost:3001/test/api/;
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
ln -sf /etc/nginx/sites-available/zaytoonz-ip /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/zaytoonz.com 2>/dev/null || true

# Test and reload
if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}✓${NC} Nginx configured and reloaded"
else
    echo -e "${RED}✗${NC} Nginx configuration test failed"
    exit 1
fi

# Step 3: Rebuild application
echo ""
echo "[*] Step 3: Rebuilding application with new configuration..."
export NEXT_PUBLIC_BASE_PATH=/test
rm -rf .next node_modules/.cache
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    exit 1
fi

# Step 4: Restart PM2
echo ""
echo "[*] Step 4: Restarting application..."
pm2 restart zaytoonz-test --update-env
pm2 save
echo -e "${GREEN}✓${NC} Application restarted"

echo ""
echo "================================================================"
echo -e "${GREEN}  Configuration Complete!${NC}"
echo "================================================================"
echo ""
echo "Access your application:"
echo "  Coming Soon: http://$VPS_IP"
echo "  Your App:    http://$VPS_IP/test"
echo ""
echo -e "${YELLOW}Note:${NC} SSL/HTTPS is not available for IP addresses."
echo "      For production, consider using a domain name."

