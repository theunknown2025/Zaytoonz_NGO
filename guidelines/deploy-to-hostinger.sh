#!/bin/bash

# ================================================================
# Deploy Next.js App to Hostinger VPS
# This script uses Hostinger API (via MCP) and SSH for deployment
# ================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_IP="168.231.87.171"  # From your Hostinger VPS API response
VPS_USER="root"  # Change if you use a different user
APP_DIR="/var/www/zaytoonz-ngo"
SSH_KEY=""  # Path to your SSH key (optional, will use password if not set)

echo "================================================"
echo "🚀 Deploying Zaytoonz NGO to Hostinger VPS"
echo "================================================"
echo ""

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Build the application locally first
echo -e "${BLUE}📦 Building application locally...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Create deployment archive (excluding node_modules and .next)
echo -e "${BLUE}📦 Creating deployment archive...${NC}"
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.env.local' \
    --exclude='.env' \
    -czf deploy.tar.gz .
echo -e "${GREEN}✓ Archive created${NC}"
echo ""

# Deploy to VPS
echo -e "${BLUE}🚀 Deploying to Hostinger VPS (${VPS_IP})...${NC}"
echo ""

if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
    SCP_CMD="scp -i $SSH_KEY"
else
    SSH_CMD="ssh $VPS_USER@$VPS_IP"
    SCP_CMD="scp"
fi

# Copy archive to VPS
echo -e "${YELLOW}📤 Uploading files to VPS...${NC}"
$SCP_CMD deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/
echo -e "${GREEN}✓ Files uploaded${NC}"

# Extract and deploy on VPS
echo -e "${YELLOW}📥 Extracting files on VPS...${NC}"
$SSH_CMD << 'ENDSSH'
    # Create app directory if it doesn't exist
    mkdir -p /var/www/zaytoonz-ngo
    cd /var/www/zaytoonz-ngo
    
    # Backup current version
    if [ -d ".next" ]; then
        echo "📦 Backing up current version..."
        tar -czf /tmp/zaytoonz-backup-$(date +%Y%m%d-%H%M%S).tar.gz .
    fi
    
    # Extract new version
    echo "📥 Extracting new version..."
    tar -xzf /tmp/deploy.tar.gz -C /var/www/zaytoonz-ngo
    
    # Install/update dependencies
    echo "📦 Installing dependencies..."
    npm install --production
    
    # Build the application
    echo "🔨 Building application..."
    npm run build
    
    # Restart with PM2
    echo "🔄 Restarting application..."
    pm2 restart zaytoonz-ngo || pm2 start npm --name "zaytoonz-ngo" -- start
    pm2 save
    
    echo "✅ Deployment complete!"
    pm2 status
ENDSSH

# Clean up local archive
rm deploy.tar.gz
echo -e "${GREEN}✓ Local archive cleaned up${NC}"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "Your application is now live at:"
echo "  http://${VPS_IP}:3000"
echo ""
echo "To view logs:"
echo "  ssh ${VPS_USER}@${VPS_IP} 'pm2 logs zaytoonz-ngo'"
echo ""

