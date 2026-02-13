# Nginx + PM2 Deployment Guide - Zaytoonz NGO

Complete step-by-step guide for deploying the Zaytoonz NGO application to Hostinger VPS using Nginx as reverse proxy and PM2 for process management.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Application Setup](#application-setup)
4. [PM2 Configuration](#pm2-configuration)
5. [Nginx Configuration](#nginx-configuration)
6. [Deployment Process](#deployment-process)
7. [Maintenance & Monitoring](#maintenance--monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Information

- **VPS IP**: `168.231.87.171` (or your Hostinger VPS IP)
- **VPS Username**: Usually `root`
- **GitHub Repository**: `https://github.com/theunknown2025/Zaytoonz_NGO.git`
- **Domain Name** (optional): Your domain pointing to VPS IP

### VPS Requirements

- **OS**: Ubuntu 20.04+ or Debian 10+
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Public IP with ports 80, 443, 22 open

---

## VPS Initial Setup

### Step 1: Connect to VPS

```bash
ssh root@168.231.87.171
```

### Step 2: Update System

```bash
apt-get update && apt-get upgrade -y
```

### Step 3: Install Node.js 20

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Step 4: Install PM2

```bash
npm install -g pm2

# Verify installation
pm2 --version
```

### Step 5: Install Python 3.11+ and Dependencies

```bash
# Install Python and build tools
apt-get install -y python3.11 python3.11-venv python3-pip python3-dev \
    build-essential wget curl git

# Install Chrome dependencies for scraper
apt-get install -y \
    wget gnupg ca-certificates \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

# Install Google Chrome
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get update
apt-get install -y google-chrome-stable
```

### Step 6: Install Nginx

```bash
apt-get install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Verify Nginx is running
systemctl status nginx
```

### Step 7: Configure Firewall

```bash
# Install UFW if not already installed
apt-get install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### Step 8: Create Application Directory

```bash
mkdir -p /var/www/zaytoonz-ngo
mkdir -p /var/log/pm2
chown -R root:root /var/www/zaytoonz-ngo
```

---

## Application Setup

### Step 1: Clone Repository

```bash
cd /var/www/zaytoonz-ngo

# Clone repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git .

# Or if already cloned, pull latest
git pull origin main
```

### Step 2: Install Node.js Dependencies

```bash
cd /var/www/zaytoonz-ngo

# Install dependencies
npm ci --production=false

# Build the application
npm run build
```

### Step 3: Setup Python Virtual Environments

#### For Python Scraper:

```bash
cd /var/www/zaytoonz-ngo/Scrape_Master

# Create virtual environment
python3.11 -m venv venv

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium --with-deps

deactivate
```

#### For NLWeb (Optional):

```bash
cd /var/www/zaytoonz-ngo/NLWeb-main/code/python

# Create virtual environment
python3.11 -m venv venv

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

deactivate
```

### Step 4: Configure Environment Variables

```bash
cd /var/www/zaytoonz-ngo

# Copy example environment file
cp .env.production.example .env

# Edit environment file
nano .env
```

**Required Environment Variables:**

```bash
NODE_ENV=production
PORT=3000

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# NLWeb Configuration (Optional)
NLWEB_URL=http://localhost:8002
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## PM2 Configuration

### Step 1: Update PM2 Configuration

The `ecosystem.production.config.js` file is already configured. Verify it:

```bash
cat /var/www/zaytoonz-ngo/ecosystem.production.config.js
```

### Step 2: Start Services with PM2

```bash
cd /var/www/zaytoonz-ngo

# Start all services
pm2 start ecosystem.production.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root
# Follow the command it outputs (usually: sudo env PATH=... pm2 startup systemd -u root --hp /root)
```

### Step 3: Verify PM2 Services

```bash
# Check status
pm2 status

# View logs
pm2 logs

# View specific service logs
pm2 logs zaytoonz-ngo
pm2 logs python-scraper
```

---

## Nginx Configuration

### Step 1: Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/zaytoonz-ngo
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name 168.231.87.171;  # Replace with your domain if you have one

    client_max_body_size 100M;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Let's Encrypt challenge (for SSL)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    # Main Next.js application
    location / {
        proxy_pass http://localhost:3000;
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

    # Next.js static files (cache optimization)
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache static files for 1 year
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js public files
    location /public/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache public files for 7 days
        expires 7d;
        add_header Cache-Control "public";
    }

    # Python Scraper API (optional - expose if needed)
    location /scraper-api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### Step 2: Enable Nginx Site

```bash
# Create symbolic link to enable site
ln -sf /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

### Step 3: Verify Nginx

```bash
# Check Nginx status
systemctl status nginx

# Check if it's listening on port 80
netstat -tulpn | grep :80
```

---

## Deployment Process

### Initial Deployment

```bash
cd /var/www/zaytoonz-ngo

# 1. Pull latest code
git pull origin main

# 2. Install/update dependencies
npm ci --production=false

# 3. Build application
npm run build

# 4. Restart PM2 services
pm2 restart ecosystem.production.config.js

# 5. Reload Nginx (if config changed)
nginx -t && systemctl reload nginx
```

### Regular Deployment Script

Create a deployment script:

```bash
nano /var/www/zaytoonz-ngo/deploy-pm2.sh
```

**Paste this:**

```bash
#!/bin/bash
set -e

APP_DIR="/var/www/zaytoonz-ngo"
cd "$APP_DIR"

echo "Starting deployment..."

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build application
echo "Building application..."
npm run build

# Restart PM2 services
echo "Restarting services..."
pm2 restart ecosystem.production.config.js

echo "Deployment complete!"
pm2 status
```

**Make it executable:**

```bash
chmod +x /var/www/zaytoonz-ngo/deploy-pm2.sh
```

**Run deployment:**

```bash
/var/www/zaytoonz-ngo/deploy-pm2.sh
```

---

## Maintenance & Monitoring

### PM2 Commands

```bash
# View all processes
pm2 status

# View logs (all services)
pm2 logs

# View logs for specific service
pm2 logs zaytoonz-ngo
pm2 logs python-scraper

# Restart a service
pm2 restart zaytoonz-ngo
pm2 restart python-scraper

# Restart all services
pm2 restart all

# Stop a service
pm2 stop zaytoonz-ngo

# Delete a service
pm2 delete zaytoonz-ngo

# Monitor resources
pm2 monit

# Save current process list
pm2 save
```

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration (no downtime)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks

```bash
# Check Next.js
curl http://localhost:3000/health || curl http://localhost:3000/

# Check Python Scraper
curl http://localhost:8000/health

# Check through Nginx
curl http://localhost/health
```

### View Logs

```bash
# PM2 logs
pm2 logs --lines 100

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

---

## Troubleshooting

### Next.js Not Starting

```bash
# Check PM2 logs
pm2 logs zaytoonz-ngo --lines 50

# Check if port 3000 is in use
netstat -tulpn | grep :3000

# Try starting manually
cd /var/www/zaytoonz-ngo
npm start

# Check environment variables
cat .env | grep NEXT_PUBLIC
```

### Python Scraper Not Starting

```bash
# Check PM2 logs
pm2 logs python-scraper --lines 50

# Check if port 8000 is in use
netstat -tulpn | grep :8000

# Try starting manually
cd /var/www/zaytoonz-ngo/Scrape_Master
source venv/bin/activate
uvicorn api_wrapper:app --host 0.0.0.0 --port 8000
```

### Nginx Not Serving Content

```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Verify Next.js is running
curl http://localhost:3000/

# Check Nginx can reach backend
curl -H "Host: 168.231.87.171" http://localhost/
```

### Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000
# or
netstat -tulpn | grep :3000

# Check what's using port 80
lsof -i :80
# or
netstat -tulpn | grep :80

# Kill process if needed (replace PID)
kill -9 <PID>
```

### Build Failures

```bash
# Clear Next.js cache
cd /var/www/zaytoonz-ngo
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 20.x.x

# Try building with verbose output
npm run build -- --debug
```

### Memory Issues

```bash
# Check memory usage
free -h

# Check PM2 memory usage
pm2 monit

# Restart services if memory is high
pm2 restart all
```

---

## SSL Certificate Setup (Optional)

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS

# Test automatic renewal
certbot renew --dry-run

# Certbot will auto-renew certificates
```

After SSL setup, update Nginx config to redirect HTTP to HTTPS.

---

## Quick Reference Commands

```bash
# Deploy
cd /var/www/zaytoonz-ngo && git pull && npm ci && npm run build && pm2 restart all

# View PM2 status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Reload Nginx
nginx -t && systemctl reload nginx

# Check services
curl http://localhost:3000/
curl http://localhost:8000/health
curl http://localhost/health
```

---

## Architecture Overview

```
Internet
    │
    ▼
Nginx (Port 80/443)
    │
    ├──► Next.js (PM2) - Port 3000
    │
    ├──► Python Scraper (PM2) - Port 8000
    │
    └──► NLWeb (PM2) - Port 8002 (optional)
```

---

## Next Steps

1. **Set up domain name** (if you have one)
2. **Configure SSL certificate** with Let's Encrypt
3. **Set up automated backups**
4. **Configure monitoring** (PM2 monitoring, uptime checks)
5. **Set up log rotation** for PM2 and Nginx logs

---

**Last Updated**: 2024
**Maintained By**: Zaytoonz NGO Development Team
