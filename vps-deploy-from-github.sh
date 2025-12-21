#!/bin/bash
# VPS Deployment Script - Pull from GitHub and deploy to /test subdirectory
# Run this script on your VPS: bash vps-deploy-from-github.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Zaytoonz NGO - Deploy from GitHub to /test            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"
REPO_URL="https://github.com/theunknown2025/Zaytoonz_NGO.git"
BRANCH="main"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR] Please run as root${NC}"
    exit 1
fi

# Check if app directory exists, if not clone the repo
if [ ! -d "$APP_DIR" ]; then
    echo -e "${BLUE}[*] App directory not found. Cloning repository...${NC}"
    mkdir -p $(dirname $APP_DIR)
    git clone $REPO_URL $APP_DIR
    echo -e "${GREEN}[OK] Repository cloned${NC}"
else
    echo -e "${BLUE}[*] Updating code from GitHub...${NC}"
    cd $APP_DIR
    
    # Check if it's a git repository
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}[WARN] Not a git repository. Initializing...${NC}"
        git init
        git remote add origin $REPO_URL
        git fetch
        git checkout -b main origin/main
    else
        # Pull latest changes
        git fetch origin
        git reset --hard origin/$BRANCH
        echo -e "${GREEN}[OK] Code updated from GitHub${NC}"
    fi
fi

cd $APP_DIR

# Backup existing .env.local if it exists
if [ -f ".env.local" ]; then
    echo -e "${BLUE}[*] Backing up existing .env.local...${NC}"
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}[OK] Backup created${NC}"
fi

# Set up environment variables
echo -e "${BLUE}[*] Setting up environment variables...${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[WARN] .env.local not found. Creating template...${NC}"
    cat > .env.local << 'ENVEOF'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here

# Environment
NODE_ENV=production
PORT=3001

# Add your other environment variables here
ENVEOF
    echo -e "${YELLOW}[WARN] Please edit $APP_DIR/.env.local with your actual values${NC}"
    echo -e "${YELLOW}[WARN] Then run this script again${NC}"
    exit 0
else
    # Ensure NEXT_PUBLIC_BASE_PATH is set
    if ! grep -q "NEXT_PUBLIC_BASE_PATH" .env.local; then
        echo "NEXT_PUBLIC_BASE_PATH=/test" >> .env.local
        echo -e "${GREEN}[OK] Added NEXT_PUBLIC_BASE_PATH to .env.local${NC}"
    fi
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Install/update dependencies
echo -e "${BLUE}[*] Installing/updating dependencies...${NC}"
npm install --production

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] npm install failed${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Dependencies installed${NC}"

# Build the application
echo -e "${BLUE}[*] Building Next.js application with basePath=/test...${NC}"
export NEXT_PUBLIC_BASE_PATH=/test
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Build completed successfully${NC}"

# Configure PM2
echo -e "${BLUE}[*] Configuring PM2...${NC}"

# Stop existing instance if running
pm2 delete zaytoonz-test 2>/dev/null || true

# Check if ecosystem.test.config.js exists
if [ -f "ecosystem.test.config.js" ]; then
    # Update the cwd in the config if needed
    sed -i "s|cwd: '/var/www/zaytoonz-ngo'|cwd: '$APP_DIR'|g" ecosystem.test.config.js
    
    # Start with ecosystem config
    pm2 start ecosystem.test.config.js
    pm2 save
    echo -e "${GREEN}[OK] PM2 configured and started${NC}"
else
    echo -e "${YELLOW}[WARN] ecosystem.test.config.js not found. Starting manually...${NC}"
    export NEXT_PUBLIC_BASE_PATH=/test
    PORT=3001 pm2 start server.js --name zaytoonz-test --update-env --cwd $APP_DIR
    pm2 save
fi

# Show PM2 status
echo ""
echo -e "${BLUE}[*] PM2 Status:${NC}"
pm2 status zaytoonz-test

# Configure Nginx
echo ""
echo -e "${BLUE}[*] Configuring Nginx...${NC}"

if [ -f "guidelines/nginx-test-subdirectory.conf" ]; then
    echo -e "${BLUE}[*] Nginx config template found${NC}"
    
    # Copy nginx config
    cp guidelines/nginx-test-subdirectory.conf /etc/nginx/sites-available/zaytoonz-ngo
    
    echo -e "${YELLOW}[WARN] IMPORTANT: Edit /etc/nginx/sites-available/zaytoonz-ngo${NC}"
    echo -e "${YELLOW}[WARN] Update the path to your 'Coming Soon' page directory${NC}"
    echo ""
    
    # Ask if user wants to test and reload nginx
    read -p "Test and reload Nginx now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if nginx -t; then
            systemctl reload nginx
            echo -e "${GREEN}[OK] Nginx configured and reloaded${NC}"
        else
            echo -e "${RED}[ERROR] Nginx configuration test failed${NC}"
            echo -e "${YELLOW}[WARN] Please fix the configuration manually${NC}"
        fi
    else
        echo -e "${YELLOW}[WARN] Please configure Nginx manually:${NC}"
        echo "  1. Edit: /etc/nginx/sites-available/zaytoonz-ngo"
        echo "  2. Update path to your 'Coming Soon' page"
        echo "  3. Test: nginx -t"
        echo "  4. Reload: systemctl reload nginx"
    fi
else
    echo -e "${YELLOW}[WARN] Nginx config template not found${NC}"
    echo -e "${YELLOW}[WARN] You'll need to configure Nginx manually${NC}"
    echo "  See: guidelines/VPS_DEPLOY_TEST_SUBDIRECTORY.md"
fi

# Final status
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  [SUCCESS] Deployment Complete!                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}[*] Next Steps:${NC}"
echo "  1. Verify PM2 status: pm2 status zaytoonz-test"
echo "  2. Check logs: pm2 logs zaytoonz-test"
echo "  3. Test locally: curl http://localhost:3001/test"
echo "  4. Configure Nginx (if not done):"
echo "     - Edit: /etc/nginx/sites-available/zaytoonz-ngo"
echo "     - Update path to your 'Coming Soon' page"
echo "     - Test: nginx -t"
echo "     - Reload: systemctl reload nginx"
echo "  5. Access your app at: https://zaytoonz.com/test"
echo ""
echo -e "${BLUE}[*] Useful Commands:${NC}"
echo "  - View logs: pm2 logs zaytoonz-test"
echo "  - Restart: pm2 restart zaytoonz-test"
echo "  - Stop: pm2 stop zaytoonz-test"
echo "  - Monitor: pm2 monit"
echo ""

