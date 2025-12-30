#!/bin/bash

# Script to switch application from /test to root path
# Run this on your VPS: bash switch-to-root-path.sh

set -e

VPS_IP="72.62.176.80"
APP_DIR="/var/www/zaytoonz-ngo"
NGINX_CONFIG="/etc/nginx/sites-available/zaytoonz-ip"

echo "🔄 Switching application from /test to root path..."

# Step 1: Update .env.local
echo "[1/5] Updating .env.local..."
cd "$APP_DIR"

# Remove or update NEXT_PUBLIC_BASE_PATH
if grep -q "^NEXT_PUBLIC_BASE_PATH=" .env.local; then
    sed -i 's/^NEXT_PUBLIC_BASE_PATH=.*/NEXT_PUBLIC_BASE_PATH=/' .env.local
else
    echo "NEXT_PUBLIC_BASE_PATH=" >> .env.local
fi

# Update NEXTAUTH_URL
if grep -q "^NEXTAUTH_URL=" .env.local; then
    sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$VPS_IP|" .env.local
else
    echo "NEXTAUTH_URL=http://$VPS_IP" >> .env.local
fi

echo "✅ Environment variables updated"

# Step 2: Update Nginx configuration
echo "[2/5] Updating Nginx configuration..."
cat > "$NGINX_CONFIG" << NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name $VPS_IP _;

    client_max_body_size 100M;

    # Root - Next.js application
    location / {
        proxy_pass http://localhost:3001;
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
    }

    # Handle Next.js static files
    location /_next/static/ {
        proxy_pass http://localhost:3001/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle Next.js API routes
    location /api/ {
        proxy_pass http://localhost:3001/api/;
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
NGINX_EOF

# Enable site and test
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
echo "✅ Nginx configuration updated and reloaded"

# Step 3: Update PM2 config (if ecosystem.test.config.js exists)
if [ -f "$APP_DIR/ecosystem.test.config.js" ]; then
    echo "[3/5] Updating PM2 configuration..."
    sed -i "s|NEXT_PUBLIC_BASE_PATH: '/test'|NEXT_PUBLIC_BASE_PATH: ''|g" "$APP_DIR/ecosystem.test.config.js"
    sed -i "s|NEXT_PUBLIC_BASE_PATH: \"/test\"|NEXT_PUBLIC_BASE_PATH: ''|g" "$APP_DIR/ecosystem.test.config.js"
    echo "✅ PM2 configuration updated"
else
    echo "[3/5] Skipping PM2 config update (file not found)"
fi

# Step 4: Rebuild application
echo "[4/5] Rebuilding application without basePath..."
cd "$APP_DIR"
unset NEXT_PUBLIC_BASE_PATH
export NEXT_PUBLIC_BASE_PATH=
npm run build
echo "✅ Application rebuilt"

# Step 5: Restart PM2
echo "[5/5] Restarting application..."
pm2 restart zaytoonz-test || pm2 restart all
pm2 save
echo "✅ Application restarted"

echo ""
echo "✅✅✅ Setup complete! ✅✅✅"
echo "Your application is now accessible at: http://$VPS_IP"
echo ""
echo "Note: If you see any issues, check:"
echo "  - PM2 logs: pm2 logs zaytoonz-test"
echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
echo "  - Application status: pm2 status"

