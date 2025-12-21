#!/bin/bash

# ================================================================
# Complete Deployment Script for Zaytoonz NGO to Hostinger VPS
# Includes Next.js App + Python Scraper with Full Configuration
# ================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="168.231.87.171"
VPS_USER="root"
APP_DIR="/var/www/zaytoonz-ngo"
SSH_KEY="${SSH_KEY:-}"  # Set SSH_KEY environment variable if you have one
DEPLOYMENT_ARCHIVE="zaytoonz-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo ""
echo "================================================================"
echo -e "${PURPLE}🚀 Zaytoonz NGO Complete Deployment to Hostinger VPS${NC}"
echo "================================================================"
echo -e "${CYAN}📦 Target: $VPS_IP${NC}"
echo -e "${CYAN}📁 App Directory: $APP_DIR${NC}"
echo -e "${CYAN}🐍 Python Scraper: Included${NC}"
echo "================================================================"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Ask for confirmation
echo -e "${YELLOW}This will deploy your application to production.${NC}"
echo -e "${YELLOW}Make sure you have committed all your changes to git.${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLYATCHES =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled."
    exit 0
fi

# Step 1: Build the application
print_status "Building Next.js application..."
npm run build
print_success "Build complete"
echo ""

# Step 2: Create deployment archive
print_status "Creating deployment archive..."
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='Scrape_Master/venv' \
    --exclude='app/admin/Scrape_Master/venv' \
    --exclude='**/__pycache__' \
    --exclude='**/*.pyc' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    -czf "$DEPLOYMENT_ARCHIVE" \
    --exclude-vcs-ignores \
    .

print_success "Archive created: $DEPLOYMENT_ARCHIVE"
echo ""

# Step 3: Upload to VPS
print_status "Uploading to VPS..."
if [ -n "$SSH_KEY" ]; then
    scp -i "$SSH_KEY" "$DEPLOYMENT_ARCHIVE" "$VPS_USER@$VPS_IP:/tmp/"
else
    scp "$DEPLOYMENT_ARCHIVE" "$VPS_USER@$VPS_IP:/tmp/"
fi
print_success "Upload complete"
echo ""

# Step 4: Deploy on VPS
print_status "Deploying on VPS..."
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
else
    SSH_CMD="ssh"
fi

$SSH_CMD "$VPS_USER@$VPS_IP" bash << ENDSSH
set -e

echo "================================================================"
echo "🔧 VPS Deployment Steps"
echo "================================================================"

# Create app directory if it doesn't exist
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Backup current version
if [ -d ".next" ]; then
    echo "📦 Backing up current version..."
    BACKUP_FILE="/tmp/zaytoonz-backup-\$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "\$BACKUP_FILE" . 2>/dev/null || true
    echo "✓ Backup saved: \$BACKUP_FILE"
fi

# Extract new version
echo "📥 Extracting new version..."
tar -xzf /tmp/$DEPLOYMENT_ARCHIVE -C $APP_DIR
echo "✓ Files extracted"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production
echo "✓ Node.js dependencies installed"

# Build Next.js (just in case)
echo "🔨 Building Next.js application..."
npm run build
echo "✓ Next.js build complete"

# Setup Python environment for Scraper
echo ""
echo "================================================================"
echo "🐍 Setting up Python Scraper"
echo "================================================================"

cd $APP_DIR/Scrape_Master

# Install system dependencies
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv python3-dev build-essential 2>/dev/null || true

# Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "✓ Python dependencies installed"

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
playwright install --with-deps chromium 2>/dev/null || true
echo "✓ Playwright setup complete"

# Create .env file for Python scraper if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating Python scraper .env file..."
    cat > .env << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# Add your AI API keys here
# OPENAI_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here
# DEEPSEEK_API_KEY=your-key-here
EOF
    echo "✓ .env file created (please update with your API keys)"
fi

cd $APP_DIR

# Update main .env.local for Next.js
echo "📝 Updating Next.js environment configuration..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# Python Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# Environment
NODE_ENV=production
PORT=3000

# Add your API keys here
# OPENAI_API_KEY=your-key-here
EOF
    echo "✓ .env.local created"
else
    echo "✓ .env.local already exists"
fi

# Copy ecosystem config
if [ -f "ecosystem.production.config.js" ]; then
    cp ecosystem.production.config.js ecosystem.config.js
    echo "✓ PM2 ecosystem config copied"
fi

echo ""
echo "================================================================"
echo "🔄 Restarting Services with PM2"
echo "================================================================"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing services
pm2 delete zaytoonz-ngo 2>/dev/null || true
pm2 delete python-scraper 2>/dev/null || true

# Start services with ecosystem config
if [ -f "ecosystem.config.js" ]; then
    echo "🚀 Starting services from ecosystem config..."
    pm2 start ecosystem.config.js
else
    echo "🚀 Starting services manually..."
    # Start Next.js
    pm2 start npm --name "zaytoonz-ngo" -- start
    
    # Start Python Scraper
    cd $APP_DIR/Scrape_Master
    pm2 start venv/bin/uvicorn --name "python-scraper" -- api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u $VPS_USER --hp /root 2>/dev/null || true

echo "✓ Services started"
echo ""

# Display service status
echo "================================================================"
echo "📊 Service Status"
echo "================================================================"
pm2 status

echo ""
echo "================================================================"
echo "✅ Deployment Complete!"
echo "================================================================"
echo ""
echo "Your application is now live at:"
echo "  🌐 Next.js App: http://$VPS_IP:3000"
echo "  🐍 Python Scraper: http://$VPS_IP:8000"
echo ""
echo "Useful commands:"
echo "  pm2 status                    # View service status"
echo "  pm2 logs zaytoonz-ngo         # View Next.js logs"
echo "  pm2 logs python-scraper       # View Python scraper logs"
echo "  pm2 restart all               # Restart all services"
echo ""
echo "To test the scraper API:"
echo "  curl http://localhost:8000/health"
echo ""

ENDSSH

print_success "Deployment complete!"
echo ""

# Clean up local archive
rm "$DEPLOYMENT_ARCHIVE"
print_success "Cleaned up local deployment archive"

echo ""
echo "================================================================"
echo -e "${GREEN}✅ Deployment Successful!${NC}"
echo "================================================================"
echo ""
echo -e "${CYAN}🌐 Application URL: http://$VPS_IP:3000${NC}"
echo -e "${CYAN}🐍 Scraper API: http://$VPS_IP:8000${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update API keys in $APP_DIR/.env.local"
echo "2. Update API keys in $APP_DIR/Scrape_Master/.env"
echo "3. Test the admin scraper at: http://$VPS_IP:3000/admin/Scraper"
echo "4. Configure domain and SSL certificate (optional)"
echo ""
echo -e "${YELLOW}📊 To monitor your services:${NC}"
echo "ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo "ssh $VPS_USER@$VPS_IP 'pm2 logs'"
echo ""

