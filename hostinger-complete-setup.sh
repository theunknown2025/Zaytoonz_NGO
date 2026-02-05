#!/bin/bash

# Complete Hostinger VPS Setup Script for Zaytoonz NGO
# This script automates the setup of Frontend, Backend, Python Scraper, and Morchid AI Service
# Run this script on your VPS: bash hostinger-complete-setup.sh

set -e

echo "================================================================"
echo "  Zaytoonz NGO - Complete Hostinger VPS Setup"
echo "  Frontend + Backend + Python Scraper + Morchid AI Service"
echo "================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

APP_DIR="/var/www/zaytoonz-ngo"
REPO_URL="https://github.com/theunknown2025/Zaytoonz_NGO.git"

# Step 1: Update system
echo -e "${YELLOW}[*] Step 1/10: Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js
echo -e "${YELLOW}[*] Step 2/10: Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}[OK] Node.js already installed${NC}"
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}[OK] Node.js version: $NODE_VERSION${NC}"
echo -e "${GREEN}[OK] npm version: $NPM_VERSION${NC}"

# Step 3: Install Python
echo -e "${YELLOW}[*] Step 3/10: Installing Python...${NC}"
if ! command -v python3 &> /dev/null; then
    apt install -y python3 python3-pip python3-venv python3-dev build-essential libssl-dev libffi-dev libpq-dev
else
    echo -e "${GREEN}[OK] Python already installed${NC}"
fi

PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}[OK] $PYTHON_VERSION${NC}"

# Step 4: Install PM2
echo -e "${YELLOW}[*] Step 4/10: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo -e "${GREEN}[OK] PM2 already installed${NC}"
fi

# Step 5: Install Nginx
echo -e "${YELLOW}[*] Step 5/10: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${GREEN}[OK] Nginx already installed${NC}"
fi

# Step 6: Install Git
echo -e "${YELLOW}[*] Step 6/10: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
else
    echo -e "${GREEN}[OK] Git already installed${NC}"
fi

# Step 7: Clone repository
echo -e "${YELLOW}[*] Step 7/10: Setting up project directory...${NC}"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}[*] Cloning repository...${NC}"
    cd /var/www
    git clone "$REPO_URL" zaytoonz-ngo
    echo -e "${GREEN}[OK] Repository cloned${NC}"
else
    echo -e "${GREEN}[OK] Project directory already exists${NC}"
    echo -e "${YELLOW}[*] Pulling latest changes...${NC}"
    cd "$APP_DIR"
    git pull origin main || echo -e "${YELLOW}[WARN] Could not pull latest changes${NC}"
fi

# Step 8: Setup environment variables
echo -e "${YELLOW}[*] Step 8/10: Setting up environment variables...${NC}"
cd "$APP_DIR"

# Create .env.local for Next.js if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[*] Creating .env.local template...${NC}"
    cat > .env.local << 'EOF'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/beta

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# Python Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# NLWeb Configuration
NLWEB_URL=http://localhost:8001
EOF
    echo -e "${GREEN}[OK] .env.local created${NC}"
    echo -e "${YELLOW}[!] Please edit $APP_DIR/.env.local with your actual values${NC}"
else
    echo -e "${GREEN}[OK] .env.local already exists${NC}"
fi

# Create .env for Python scraper if it doesn't exist
if [ ! -f "python_scraper/.env" ]; then
    echo -e "${YELLOW}[*] Creating python_scraper/.env template...${NC}"
    cat > python_scraper/.env << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
EOF
    echo -e "${GREEN}[OK] python_scraper/.env created${NC}"
    echo -e "${YELLOW}[!] Please edit $APP_DIR/python_scraper/.env with your actual values${NC}"
else
    echo -e "${GREEN}[OK] python_scraper/.env already exists${NC}"
fi

# Create .env for Morchid AI service if it doesn't exist
if [ ! -f "morchid-ai-service/.env" ]; then
    echo -e "${YELLOW}[*] Creating morchid-ai-service/.env template...${NC}"
    cat > morchid-ai-service/.env << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Service Configuration
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8001

# NLWeb Configuration
NLWEB_PATH=../NLWeb-main/code/python

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo -e "${GREEN}[OK] morchid-ai-service/.env created${NC}"
    echo -e "${YELLOW}[!] Please edit $APP_DIR/morchid-ai-service/.env with your actual values${NC}"
else
    echo -e "${GREEN}[OK] morchid-ai-service/.env already exists${NC}"
fi

# Step 9: Setup Python Scraper
echo -e "${YELLOW}[*] Step 9/10: Setting up Python Scraper...${NC}"
cd "$APP_DIR/python_scraper"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[*] Creating Python virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}[OK] Virtual environment created${NC}"
fi

echo -e "${YELLOW}[*] Installing Python scraper dependencies...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo -e "${GREEN}[OK] Python scraper dependencies installed${NC}"

# Step 10: Setup Morchid AI Service
echo -e "${YELLOW}[*] Step 10/10: Setting up Morchid AI Service...${NC}"
cd "$APP_DIR/morchid-ai-service"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[*] Creating Python virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}[OK] Virtual environment created${NC}"
fi

echo -e "${YELLOW}[*] Installing Morchid AI dependencies...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo -e "${GREEN}[OK] Morchid AI dependencies installed${NC}"

# Step 11: Install Frontend Dependencies
echo -e "${YELLOW}[*] Installing frontend dependencies...${NC}"
cd "$APP_DIR"
npm install --production
echo -e "${GREEN}[OK] Frontend dependencies installed${NC}"

# Step 12: Build Frontend
echo -e "${YELLOW}[*] Building Next.js application...${NC}"
export NEXT_PUBLIC_BASE_PATH=/beta
npm run build
echo -e "${GREEN}[OK] Frontend built successfully${NC}"

# Step 13: Create PM2 ecosystem config
echo -e "${YELLOW}[*] Creating PM2 ecosystem configuration...${NC}"
cd "$APP_DIR"

cat > ecosystem.production.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'zaytoonz-test',
      script: 'server.js',
      cwd: '/var/www/zaytoonz-ngo',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: 'localhost',
        NEXT_PUBLIC_BASE_PATH: '/beta',
      },
      error_file: '/var/log/pm2/zaytoonz-test-error.log',
      out_file: '/var/log/pm2/zaytoonz-test-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
    {
      name: 'python-scraper',
      script: 'venv/bin/uvicorn',
      args: 'api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2',
      cwd: '/var/www/zaytoonz-ngo/python_scraper',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      },
      error_file: '/var/log/pm2/python-scraper-error.log',
      out_file: '/var/log/pm2/python-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'morchid-ai-service',
      script: 'venv/bin/uvicorn',
      args: 'enhanced_app:app --host 0.0.0.0 --port 8001 --workers 1',
      cwd: '/var/www/zaytoonz-ngo/morchid-ai-service',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      },
      error_file: '/var/log/pm2/morchid-ai-error.log',
      out_file: '/var/log/pm2/morchid-ai-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ]
};
EOF

echo -e "${GREEN}[OK] PM2 ecosystem config created${NC}"

# Step 14: Setup PM2 logs
echo -e "${YELLOW}[*] Setting up PM2 logs...${NC}"
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

# Step 15: Start services with PM2
echo -e "${YELLOW}[*] Starting services with PM2...${NC}"
cd "$APP_DIR"

# Stop existing instances if running
pm2 delete zaytoonz-test 2>/dev/null || true
pm2 delete python-scraper 2>/dev/null || true
pm2 delete morchid-ai-service 2>/dev/null || true

# Start all services
pm2 start ecosystem.production.config.js
pm2 save

# Setup PM2 startup
echo -e "${YELLOW}[*] Configuring PM2 startup...${NC}"
STARTUP_CMD=$(pm2 startup | grep -oP 'sudo.*')
if [ ! -z "$STARTUP_CMD" ]; then
    echo -e "${YELLOW}[!] Run this command to enable PM2 on boot:${NC}"
    echo -e "${GREEN}$STARTUP_CMD${NC}"
fi

# Step 16: Create Nginx configuration
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
echo "1. Edit environment files with your actual API keys:"
echo "   - $APP_DIR/.env.local"
echo "   - $APP_DIR/python_scraper/.env"
echo "   - $APP_DIR/morchid-ai-service/.env"
echo ""
echo "2. Restart PM2 services after updating environment:"
echo "   pm2 restart all"
echo ""
echo "3. Install SSL certificate:"
echo "   apt install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d zaytoonz.com -d www.zaytoonz.com"
echo ""
echo -e "${GREEN}Check Status:${NC}"
echo "  PM2:  pm2 status"
echo "  Nginx: systemctl status nginx"
echo "  Logs:  pm2 logs"
echo ""
echo -e "${GREEN}Service Ports:${NC}"
echo "  Next.js App:     Port 3001"
echo "  Python Scraper:  Port 8000"
echo "  Morchid AI:      Port 8001"
echo ""
echo -e "${GREEN}Access your app at:${NC}"
echo "  Coming Soon: http://zaytoonz.com"
echo "  Your App:    http://zaytoonz.com/test"
echo ""
echo -e "${BLUE}For detailed instructions, see: COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md${NC}"
echo ""

