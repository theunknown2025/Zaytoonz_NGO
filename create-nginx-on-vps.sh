#!/bin/bash
# Create nginx-beta.conf directly on VPS
# Run this ON THE VPS

cd /opt/zaytoonz-ngo || exit 1

# Backup old file
if [ -f nginx-beta.conf ]; then
    cp nginx-beta.conf nginx-beta.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backup created"
fi

# Create new file
cat > nginx-beta.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    upstream nextjs_backend {
        server nextjs:3000 max_fails=3 fail_timeout=30s;
    }

    upstream scraper_backend {
        server python-scraper:8000 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 80;
        listen [::]:80;
        server_name beta-zaytoonz.pro 76.13.57.178;

        client_max_body_size 100M;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        http2 on;
        server_name beta-zaytoonz.pro 76.13.57.178;

        ssl_certificate /etc/letsencrypt/live/beta-zaytoonz.pro/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/beta-zaytoonz.pro/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_session_tickets off;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        client_max_body_size 100M;

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

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

        location / {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 75s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
            proxy_cache_bypass $http_upgrade;
        }

        location /_next/static/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /public/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            expires 7d;
            add_header Cache-Control "public";
        }

        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
EOF

echo "File created. Verifying..."
grep -n "DOMAIN_PLACEHOLDER\|listen.*ssl http2" nginx-beta.conf && echo "ERROR: Issues found!" || echo "✓ File looks good"

echo ""
echo "Now restart nginx:"
echo "  docker compose -f docker-compose-beta.yml stop nginx"
echo "  docker compose -f docker-compose-beta.yml rm -f nginx"
echo "  docker compose -f docker-compose-beta.yml up -d nginx"
echo "  docker compose -f docker-compose-beta.yml exec nginx nginx -t"
