#!/bin/bash

# Hostinger VPS Setup Script for Zaytoonz NGO
# This script automates the initial setup on your Hostinger VPS
# Run this script on your VPS: bash hostinger-setup.sh

set -e

echo "================================================================"
echo "  Zaytoonz NGO - Hostinger VPS Setup"
echo "================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}[*] Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js
echo -e "${YELLOW}[*] Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}[OK] Node.js already installed${NC}"
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}[OK] Node.js version: $NODE_VERSION${NC}"
echo -e "${GREEN}[OK] npm version: $NPM_VERSION${NC}"

# Step 3: Install PM2
echo -e "${YELLOW}[*] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo -e "${GREEN}[OK] PM2 already installed${NC}"
fi

# Step 4: Install Nginx
echo -e "${YELLOW}[*] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${GREEN}[OK] Nginx already installed${NC}"
fi

# Step 5: Install Git
echo -e "${YELLOW}[*] Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
else
    echo -e "${GREEN}[OK] Git already installed${NC}"
fi

# Step 6: Clone repository (if not exists)
echo -e "${YELLOW}[*] Setting up project directory...${NC}"
if [ ! -d "/var/www/zaytoonz-ngo" ]; then
    echo -e "${YELLOW}[*] Cloning repository...${NC}"
    cd /var/www
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/Zaytoonz_NGO.git): " REPO_URL
    git clone "$REPO_URL" zaytoonz-ngo
    echo -e "${GREEN}[OK] Repository cloned${NC}"
else
    echo -e "${GREEN}[OK] Project directory already exists${NC}"
fi

# Step 7: Create .env.local if it doesn't exist
echo -e "${YELLOW}[*] Setting up environment variables...${NC}"
cd /var/www/zaytoonz-ngo

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[*] Creating .env.local template...${NC}"
    cat > .env.local << 'EOF'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://zaytoonz.com/test
EOF
    echo -e "${GREEN}[OK] .env.local created${NC}"
    echo -e "${YELLOW}[!] Please edit /var/www/zaytoonz-ngo/.env.local with your actual values${NC}"
else
    echo -e "${GREEN}[OK] .env.local already exists${NC}"
fi

# Step 8: Install dependencies
echo -e "${YELLOW}[*] Installing npm dependencies...${NC}"
npm install --production

# Step 9: Build application
echo -e "${YELLOW}[*] Building Next.js application...${NC}"
export NEXT_PUBLIC_BASE_PATH=/test
npm run build

# Step 10: Create PM2 log directory
echo -e "${YELLOW}[*] Setting up PM2 logs...${NC}"
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

# Step 11: Start application with PM2
echo -e "${YELLOW}[*] Starting application with PM2...${NC}"
cd /var/www/zaytoonz-ngo

# Stop existing instance if running
pm2 delete zaytoonz-test 2>/dev/null || true

# Start with ecosystem config if exists, otherwise use server.js
if [ -f "ecosystem.test.config.js" ]; then
    pm2 start ecosystem.test.config.js
else
    pm2 start server.js --name zaytoonz-test --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT=3001 \
        NEXT_PUBLIC_BASE_PATH=/test
fi

pm2 save

# Setup PM2 startup
echo -e "${YELLOW}[*] Configuring PM2 startup...${NC}"
STARTUP_CMD=$(pm2 startup | grep -oP 'sudo.*')
if [ ! -z "$STARTUP_CMD" ]; then
    echo -e "${YELLOW}[!] Run this command to enable PM2 on boot:${NC}"
    echo -e "${GREEN}$STARTUP_CMD${NC}"
fi

# Step 12: Create Nginx configuration
echo -e "${YELLOW}[*] Setting up Nginx configuration...${NC}"

read -p "Enter the path to your 'Coming Soon' page directory (default: /var/www/zaytoonz): " COMING_SOON_PATH
COMING_SOON_PATH=${COMING_SOON_PATH:-/var/www/zaytoonz}

cat > /etc/nginx/sites-available/zaytoonz << EOF
server {
    listen 80;
    listen [::]:80;
    server_name zaytoonz.com www.zaytoonz.com;

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
ln -sf /etc/nginx/sites-available/zaytoonz /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${YELLOW}[*] Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}[OK] Nginx configuration is valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}[OK] Nginx reloaded${NC}"
else
    echo -e "${RED}[ERROR] Nginx configuration test failed${NC}"
    exit 1
fi

# Final status check
echo ""
echo "================================================================"
echo -e "${GREEN}  Setup Complete!${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Edit /var/www/zaytoonz-ngo/.env.local with your actual values"
echo "2. Restart PM2: pm2 restart zaytoonz-test"
echo "3. Install SSL certificate: certbot --nginx -d zaytoonz.com -d www.zaytoonz.com"
echo ""
echo -e "${GREEN}Check Status:${NC}"
echo "  PM2:  pm2 status"
echo "  Nginx: systemctl status nginx"
echo "  Logs:  pm2 logs zaytoonz-test"
echo ""
echo -e "${GREEN}Access your app at:${NC}"
echo "  Coming Soon: http://zaytoonz.com"
echo "  Your App:    http://zaytoonz.com/test"
echo ""

