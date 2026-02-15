#!/bin/bash

set -e

DOMAIN="zaytoonz.com"
NGINX_AVAILABLE="/etc/nginx/sites-available/zaytoonz"
NGINX_ENABLED="/etc/nginx/sites-enabled/zaytoonz"
BACKUP_DIR="/etc/nginx/backup"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

echo "🔧 Applying Nginx configuration for $DOMAIN"

# --------------------------------------------------
# 1. Create backup
# --------------------------------------------------
echo "📦 Backing up existing configuration..."
mkdir -p $BACKUP_DIR

if [ -f "$NGINX_AVAILABLE" ]; then
    cp $NGINX_AVAILABLE $BACKUP_DIR/zaytoonz.$TIMESTAMP.bak
    echo "✅ Backup saved to $BACKUP_DIR/zaytoonz.$TIMESTAMP.bak"
else
    echo "⚠️ No existing config found, continuing..."
fi

# --------------------------------------------------
# 2. Write new configuration
# --------------------------------------------------
echo "✍️ Writing new Nginx configuration..."

cat << 'EOF' > $NGINX_AVAILABLE
# =========================================================
# HTTP → HTTPS REDIRECT
# =========================================================
server {
    listen 80;
    listen [::]:80;

    server_name zaytoonz.com www.zaytoonz.com srv1182909.hstgr.cloud 168.231.87.171;

    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# =========================================================
# HTTPS SERVER
# =========================================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name zaytoonz.com www.zaytoonz.com srv1182909.hstgr.cloud 168.231.87.171;

    ssl_certificate /etc/letsencrypt/live/zaytoonz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zaytoonz.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/zaytoonz;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # -----------------------------------------------------
    # NEXT.JS STATIC ASSETS
    # -----------------------------------------------------
    location ^~ /app/_next/ {
        proxy_pass http://127.0.0.1:3000/_next/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        access_log off;
    }

    # -----------------------------------------------------
    # NEXT.JS APP
    # -----------------------------------------------------
    location ^~ /app/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # -----------------------------------------------------
    # STATIC ASSETS (LANDING PAGE ONLY)
    # -----------------------------------------------------
    location ~* ^/(?!app/).*\.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/javascript
        application/json
        image/svg+xml;

    location ~ /\. {
        deny all;
    }
}
EOF

# --------------------------------------------------
# 3. Ensure site is enabled
# --------------------------------------------------
echo "🔗 Ensuring site is enabled..."
ln -sf $NGINX_AVAILABLE $NGINX_ENABLED

# --------------------------------------------------
# 4. Test Nginx configuration
# --------------------------------------------------
echo "🧪 Testing Nginx configuration..."
nginx -t

# --------------------------------------------------
# 5. Reload Nginx
# --------------------------------------------------
echo "🚀 Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx configuration applied successfully!"
