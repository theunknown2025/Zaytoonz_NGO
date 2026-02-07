# Docker Deployment Quick Guide - Zaytoonz NGO

Quick guide to deploy the web app using Docker on your VPS.

## Prerequisites

- Docker and Docker Compose installed on VPS
- SSH access to VPS
- Domain pointing to VPS IP (optional)

## Quick Deployment Steps

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### 2. Clone Repository

```bash
# Create directory
mkdir -p /var/www/zaytoonz-ngo
cd /var/www/zaytoonz-ngo

# Clone from GitHub
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git .

# Or if directory exists, pull latest
git pull origin main
```

### 3. Create Environment File

```bash
# Create .env file for Docker
cat > .env << EOF
# Base Path
NEXT_PUBLIC_BASE_PATH=/beta

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Node Environment
NODE_ENV=production
PORT=3000

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# Python Environment
PYTHONUNBUFFERED=1
EOF

# Edit with your actual values
nano .env
```

### 4. Update Docker Compose for /beta Path

The `docker-compose.production.yml` needs to be updated to use port 3001 and /beta path. Create or update it:

```bash
cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  nextjs:
    image: node:20-alpine
    container_name: zaytoonz-nextjs
    working_dir: /app
    command: sh -c "npm install && npm run build && npm start"
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_BASE_PATH=/beta
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}
      - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
      - OPENAI_MAX_TOKENS=${OPENAI_MAX_TOKENS:-2000}
      - NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=${NEXT_PUBLIC_USE_EXTERNAL_SCRAPER:-true}
      - NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=${NEXT_PUBLIC_EXTERNAL_SCRAPER_URL:-http://python-scraper:8000}
      - NEXT_PUBLIC_FALLBACK_TO_LOCAL=${NEXT_PUBLIC_FALLBACK_TO_LOCAL:-true}
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.next
    restart: unless-stopped
    depends_on:
      - python-scraper
    networks:
      - zaytoonz-network

  python-scraper:
    image: python:3.11-slim
    container_name: zaytoonz-scraper
    working_dir: /app/Scrape_Master
    command: sh -c "apt-get update && apt-get install -y wget gnupg && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && sh -c 'echo \"deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" >> /etc/apt/sources.list.d/google.list' && apt-get update && apt-get install -y google-chrome-stable && pip install --no-cache-dir -r requirements.txt && playwright install chromium && uvicorn api_wrapper:app --host 0.0.0.0 --port 8000"
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./Scrape_Master:/app/Scrape_Master
    restart: unless-stopped
    networks:
      - zaytoonz-network

  nginx:
    image: nginx:alpine
    container_name: zaytoonz-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - nextjs
    restart: unless-stopped
    networks:
      - zaytoonz-network

networks:
  zaytoonz-network:
    driver: bridge
EOF
```

### 5. Update Nginx Configuration for /beta

```bash
# Create nginx directory if needed
mkdir -p nginx/ssl

# Update nginx.conf for /beta path
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream nextjs_backend {
        server nextjs:3000;
    }

    upstream python_backend {
        server python-scraper:8000;
    }

    server {
        listen 80;
        server_name zaytoonz.com www.zaytoonz.com;

        client_max_body_size 100M;

        # Root - Serve landing page (if exists)
        location = / {
            root /var/www/landing;
            index index.html;
            try_files $uri /index.html;
        }

        # Serve other static files (except /beta)
        location ~ ^/(?!beta)(.*)$ {
            root /var/www/landing;
            try_files $uri =404;
        }

        # /beta - Next.js application
        location /beta {
            proxy_pass http://nextjs_backend/beta;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
            proxy_set_header X-Forwarded-Prefix /beta;
        }

        # Handle Next.js static files
        location /beta/_next/static/ {
            proxy_pass http://nextjs_backend/beta/_next/static/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Handle Next.js API routes
        location /beta/api/ {
            proxy_pass http://nextjs_backend/beta/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Scraper API
        location /scraper-api/ {
            proxy_pass http://python_backend/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 600s;
            proxy_connect_timeout 75s;
        }
    }
}
EOF
```

### 6. Start Docker Containers

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Check status
docker-compose -f docker-compose.production.yml ps
```

### 7. Verify Deployment

```bash
# Check if containers are running
docker ps

# Test local connection
curl http://localhost:3001/beta

# Test via domain (if configured)
curl http://zaytoonz.com/beta
```

## Useful Docker Commands

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f nextjs
docker-compose -f docker-compose.production.yml logs -f nginx

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop services
docker-compose -f docker-compose.production.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.production.yml down -v

# Rebuild after code changes
docker-compose -f docker-compose.production.yml up -d --build

# Execute command in container
docker exec -it zaytoonz-nextjs sh
```

## Update After Code Changes

```bash
cd /var/www/zaytoonz-ngo

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs

# Check container status
docker ps -a
```

### Port already in use
```bash
# Check what's using the port
netstat -tlnp | grep 3001

# Stop existing service or change port in docker-compose.yml
```

### Build fails
```bash
# Check build logs
docker-compose -f docker-compose.production.yml build --no-cache

# Check if node_modules exists
ls -la node_modules
```

## Access Your App

- **Web App**: `http://zaytoonz.com/beta` (or `https://` if SSL configured)
- **Landing Page**: `http://zaytoonz.com/`

## Next Steps

1. Configure SSL/HTTPS (use Certbot or Let's Encrypt)
2. Set up auto-restart on server reboot
3. Configure monitoring and logging
4. Set up backups
