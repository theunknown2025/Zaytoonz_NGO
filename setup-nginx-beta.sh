#!/bin/bash

set -e

DOMAIN="beta-zaytoonz.pro"
VPS_IP="76.13.57.178"
NGINX_CONF="nginx-beta.conf"

echo "🔧 Setting up Nginx configuration for ${DOMAIN}"

# Create nginx configuration file
cat > "$NGINX_CONF" << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Upstream for Next.js
    upstream nextjs_backend {
        server nextjs:3000 max_fails=3 fail_timeout=30s;
    }

    # Upstream for Python Scraper
    upstream scraper_backend {
        server python-scraper:8000 max_fails=3 fail_timeout=30s;
    }

    # HTTP Server - Redirect to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name DOMAIN_PLACEHOLDER VPS_IP_PLACEHOLDER;

        client_max_body_size 100M;

        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name DOMAIN_PLACEHOLDER VPS_IP_PLACEHOLDER;

        # SSL Configuration (will be updated after certificate generation)
        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

        # SSL Security Settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_session_tickets off;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        client_max_body_size 100M;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Scraper API endpoint
        location /scraper-api/ {
            proxy_pass http://scraper_backend/;
            proxy_http_version 1.1;
            
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 75s;
            proxy_send_timeout 600s;
            proxy_read_timeout 600s;
            
            proxy_cache_bypass $http_upgrade;
        }

        # Main Next.js app
        location / {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            
            # WebSocket support
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            
            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 75s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
            
            # Buffer settings
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
            
            # Bypass cache for upgrades
            proxy_cache_bypass $http_upgrade;
        }

        # Next.js static files
        location /_next/static/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            
            # Cache static files
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Next.js public files
        location /public/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            
            # Cache public files
            expires 7d;
            add_header Cache-Control "public";
        }

        # Deny access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
EOF

# Replace placeholders
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$NGINX_CONF"
sed -i "s/VPS_IP_PLACEHOLDER/${VPS_IP}/g" "$NGINX_CONF"

echo "✅ Nginx configuration file created: ${NGINX_CONF}"
echo "📝 Note: SSL certificate paths will be configured after running init-ssl-beta.sh"
