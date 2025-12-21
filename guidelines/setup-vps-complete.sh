#!/bin/bash

# ================================================================
# Complete VPS Setup Script for Zaytoonz NGO
# Run this ONCE on a fresh VPS to set up all dependencies
# ================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "================================================================"
echo -e "${BLUE}🚀 Zaytoonz NGO VPS Initial Setup${NC}"
echo "================================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Install Node.js 20.x
echo -e "${BLUE}📦 Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}✓ Node.js already installed: $(node --version)${NC}"
fi
echo ""

# Install PM2
echo -e "${BLUE}📦 Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi
echo ""

# Install Python and dependencies
echo -e "${BLUE}🐍 Installing Python 3 and dependencies...${NC}"
apt-get install -y -qq \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    wget \
    curl \
    git \
    unzip

echo -e "${GREEN}✓ Python installed: $(python3 --version)${NC}"
echo ""

# Install system libraries for Playwright
echo -e "${BLUE}🎭 Installing Playwright dependencies...${NC}"
apt-get install -y -qq \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2

echo -e "${GREEN}✓ Playwright dependencies installed${NC}"
echo ""

# Install Nginx (optional, for reverse proxy)
echo -e "${BLUE}🌐 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi
echo ""

# Create application directory
APP_DIR="/var/www/zaytoonz-ngo"
echo -e "${BLUE}📁 Creating application directory...${NC}"
mkdir -p $APP_DIR
echo -e "${GREEN}✓ Directory created: $APP_DIR${NC}"
echo ""

# Create log directory for PM2
echo -e "${BLUE}📄 Creating log directory...${NC}"
mkdir -p /var/log/pm2
echo -e "${GREEN}✓ Log directory created${NC}"
echo ""

# Configure firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 3000/tcp  # Next.js
    ufw allow 8000/tcp  # Python Scraper
    echo "y" | ufw enable
    echo -e "${GREEN}✓ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠ UFW not available, skipping firewall configuration${NC}"
fi
echo ""

# Create Nginx configuration for reverse proxy
echo -e "${BLUE}🌐 Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/zaytoonz-ngo << 'EOF'
server {
    listen 80;
    server_name _;

    # Redirect to HTTPS if configured
    # return 301 https://$server_name$request_uri;

    # Or serve directly (remove if using HTTPS)
    location / {
        proxy_pass http://localhost:3000;
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
    }

    # Python Scraper API (optional - expose if needed)
    location /scraper/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 600s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx configured and started${NC}"
echo ""

# Setup PM2 startup
echo -e "${BLUE}⚙️ Configuring PM2 to start on boot...${NC}"
pm2 startup systemd -u root --hp /root
echo -e "${GREEN}✓ PM2 startup configured${NC}"
echo ""

# Create deployment helper script
echo -e "${BLUE}📝 Creating deployment helper script...${NC}"
cat > /usr/local/bin/zaytoonz-deploy << 'DEPLOY_SCRIPT'
#!/bin/bash
# Quick deployment helper

APP_DIR="/var/www/zaytoonz-ngo"
REPO_URL="https://github.com/theunknown2025/Zaytoonz_NGO.git"

echo "🔄 Deploying Zaytoonz NGO..."

cd $APP_DIR

if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
fi

echo "📦 Installing dependencies..."
npm install --production

echo "🔨 Building application..."
npm run build

echo "🐍 Setting up Python scraper..."
cd $APP_DIR/Scrape_Master
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

echo "🔄 Restarting services..."
cd $APP_DIR
pm2 restart all || pm2 start ecosystem.config.js
pm2 save

echo "✅ Deployment complete!"
pm2 status
DEPLOY_SCRIPT

chmod +x /usr/local/bin/zaytoonz-deploy
echo -e "${GREEN}✓ Deployment helper created: /usr/local/bin/zaytoonz-deploy${NC}"
echo ""

# Display completion message
echo ""
echo "================================================================"
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Clone or deploy your application:"
echo "   cd /var/www/zaytoonz-ngo"
echo "   git clone https://github.com/theunknown2025/Zaytoonz_NGO.git ."
echo ""
echo "2. Or use the deployment script from your local machine:"
echo "   ./deploy-hostinger-complete.sh"
echo ""
echo "3. Or use the helper command on the VPS:"
echo "   zaytoonz-deploy"
echo ""
echo -e "${YELLOW}📊 Installed Software:${NC}"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Python: $(python3 --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo ""
echo -e "${YELLOW}🌐 Network:${NC}"
echo "  - HTTP: Port 80 (Nginx)"
echo "  - Next.js: Port 3000"
echo "  - Python Scraper: Port 8000"
echo ""
echo -e "${YELLOW}📁 Directories:${NC}"
echo "  - App: /var/www/zaytoonz-ngo"
echo "  - Logs: /var/log/pm2/"
echo ""
echo "================================================================"

