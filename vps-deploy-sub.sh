#!/bin/bash
# VPS Deployment Script for /test subdirectory
# Upload this script to /tmp/ on your VPS and run: bash /tmp/vps-deploy-sub.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Zaytoonz NGO - /test Subdirectory Deployment        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"
ARCHIVE_NAME="sub-deploy-vps.tar.gz"
TEMP_DIR="/tmp/zaytoonz-deploy-$$"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root${NC}"
    exit 1
fi

# Check if archive exists
if [ ! -f "/tmp/$ARCHIVE_NAME" ]; then
    echo -e "${RED}❌ Archive not found: /tmp/$ARCHIVE_NAME${NC}"
    echo "Please upload sub-deploy-vps.tar.gz to /tmp/ first"
    exit 1
fi

# Create temporary directory
echo -e "${BLUE}📦 Extracting deployment archive...${NC}"
mkdir -p $TEMP_DIR
cd $TEMP_DIR
tar -xzf /tmp/$ARCHIVE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to extract archive${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Archive extracted${NC}"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠️  App directory not found: $APP_DIR${NC}"
    echo "Creating directory..."
    mkdir -p $APP_DIR
fi

# Backup existing deployment if it exists
if [ -d "$APP_DIR/.next" ]; then
    echo -e "${BLUE}💾 Backing up existing deployment...${NC}"
    BACKUP_DIR="/var/backups/zaytoonz-$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r $APP_DIR/.next $BACKUP_DIR/ 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"
fi

# Copy files to app directory
echo -e "${BLUE}📋 Copying files to $APP_DIR...${NC}"

# Copy application files
if [ -d "$TEMP_DIR/.next" ]; then
    echo "  → Copying .next build directory..."
    rm -rf $APP_DIR/.next
    cp -r $TEMP_DIR/.next $APP_DIR/
fi

if [ -d "$TEMP_DIR/public" ]; then
    echo "  → Copying public directory..."
    cp -r $TEMP_DIR/public $APP_DIR/
fi

# Copy configuration files
echo "  → Copying configuration files..."
cp -f $TEMP_DIR/server.js $APP_DIR/ 2>/dev/null || true
cp -f $TEMP_DIR/next.config.js $APP_DIR/ 2>/dev/null || true
cp -f $TEMP_DIR/package.json $APP_DIR/ 2>/dev/null || true
cp -f $TEMP_DIR/package-lock.json $APP_DIR/ 2>/dev/null || true
cp -f $TEMP_DIR/ecosystem.test.config.js $APP_DIR/ 2>/dev/null || true

# Copy nginx config template
if [ -f "$TEMP_DIR/nginx-test-subdirectory.conf" ]; then
    echo "  → Nginx config template found"
    cp -f $TEMP_DIR/nginx-test-subdirectory.conf $APP_DIR/
fi

echo -e "${GREEN}✓ Files copied${NC}"

# Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd $APP_DIR

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "  → Installing npm packages..."
    npm install --production
else
    echo "  → Updating npm packages..."
    npm install --production
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Set up environment variables
echo -e "${BLUE}⚙️  Setting up environment...${NC}"

# Check if .env.local exists
if [ ! -f "$APP_DIR/.env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating template...${NC}"
    cat > $APP_DIR/.env.local << 'ENVEOF'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/Test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here

# Environment
NODE_ENV=production
PORT=3001

# Add your other environment variables here
ENVEOF
    echo -e "${YELLOW}⚠️  Please edit $APP_DIR/.env.local with your actual values${NC}"
else
    # Ensure NEXT_PUBLIC_BASE_PATH is set
    if ! grep -q "NEXT_PUBLIC_BASE_PATH" $APP_DIR/.env.local; then
        echo "NEXT_PUBLIC_BASE_PATH=/test" >> $APP_DIR/.env.local
    fi
fi

# Update ecosystem.test.config.js with environment variables from .env.local
if [ -f "$APP_DIR/.env.local" ]; then
    echo "  → Loading environment variables from .env.local..."
    export $(grep -v '^#' $APP_DIR/.env.local | xargs)
fi

echo -e "${GREEN}✓ Environment configured${NC}"

# Configure PM2
echo -e "${BLUE}🚀 Configuring PM2...${NC}"

# Stop existing instance if running
pm2 delete zaytoonz-test 2>/dev/null || true

# Start with ecosystem config
if [ -f "$APP_DIR/ecosystem.test.config.js" ]; then
    cd $APP_DIR
    pm2 start ecosystem.test.config.js
    pm2 save
    echo -e "${GREEN}✓ PM2 configured and started${NC}"
else
    echo -e "${YELLOW}⚠️  ecosystem.test.config.js not found. Starting manually...${NC}"
    cd $APP_DIR
    export NEXT_PUBLIC_BASE_PATH=/test
    PORT=3001 pm2 start server.js --name zaytoonz-test --update-env
    pm2 save
fi

# Show PM2 status
echo ""
echo -e "${BLUE}📊 PM2 Status:${NC}"
pm2 status zaytoonz-test

# Configure Nginx
echo ""
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"

if [ -f "$APP_DIR/nginx-test-subdirectory.conf" ]; then
    echo "  → Nginx config template found"
    echo -e "${YELLOW}⚠️  Please review and update the Nginx configuration:${NC}"
    echo "    1. Edit: $APP_DIR/nginx-test-subdirectory.conf"
    echo "    2. Copy to: /etc/nginx/sites-available/zaytoonz-ngo"
    echo "    3. Update the path to your 'Coming Soon' page directory"
    echo "    4. Test: nginx -t"
    echo "    5. Reload: systemctl reload nginx"
    echo ""
    
    # Ask if user wants to apply nginx config automatically
    read -p "Apply Nginx config automatically? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp $APP_DIR/nginx-test-subdirectory.conf /etc/nginx/sites-available/zaytoonz-ngo
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit /etc/nginx/sites-available/zaytoonz-ngo${NC}"
        echo "    Update the path to your 'Coming Soon' page directory"
        echo ""
        read -p "Press Enter after editing the file to test and reload Nginx..."
        
        if nginx -t; then
            systemctl reload nginx
            echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
        else
            echo -e "${RED}❌ Nginx configuration test failed. Please fix manually.${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Nginx config template not found${NC}"
    echo "    You'll need to configure Nginx manually"
    echo "    See: guidelines/VPS_DEPLOY_TEST_SUBDIRECTORY.md"
fi

# Cleanup
echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -rf $TEMP_DIR
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Final status
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deployment Complete!                               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "  1. Verify PM2 status: pm2 status zaytoonz-test"
echo "  2. Check logs: pm2 logs zaytoonz-test"
echo "  3. Test locally: curl http://localhost:3001/Test"
echo "  4. Configure Nginx (if not done):"
echo "     - Edit: /etc/nginx/sites-available/zaytoonz-ngo"
echo "     - Test: nginx -t"
echo "     - Reload: systemctl reload nginx"
echo "  5. Access your app at: https://zaytoonz.com/test"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "  - View logs: pm2 logs zaytoonz-test"
echo "  - Restart: pm2 restart zaytoonz-test"
echo "  - Stop: pm2 stop zaytoonz-test"
echo "  - Monitor: pm2 monit"
echo ""

