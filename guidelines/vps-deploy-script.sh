#!/bin/bash
set -e

APP_DIR=/var/www/zaytoonz-ngo
ARCHIVE=$1

echo "=========================================="
echo "🚀 Zaytoonz NGO - Complete VPS Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# ========================================
# PHASE 1: System Initialization
# ========================================
echo "📦 Phase 1: Initializing Fresh VPS..."
echo ""

# Update system
echo "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
echo "✓ System updated"

# Install essential tools
echo "Installing essential tools..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    unzip \
    tar \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release 2>/dev/null || true
echo "✓ Essential tools installed"

# ========================================
# PHASE 2: Install Node.js 20.x
# ========================================
echo ""
echo "📦 Phase 2: Installing Node.js..."
echo ""

if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "✓ Node.js $(node --version) installed"
else
    echo "✓ Node.js $(node --version) already installed"
fi

# ========================================
# PHASE 3: Install Python & Dependencies
# ========================================
echo ""
echo "🐍 Phase 3: Installing Python..."
echo ""

echo "Installing Python and system dependencies..."
apt-get install -y -qq \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    python3-setuptools \
    build-essential \
    libssl-dev \
    libffi-dev \
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
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    fonts-liberation \
    xdg-utils 2>/dev/null || true

echo "✓ Python $(python3 --version) installed"

# ========================================
# PHASE 4: Install PM2
# ========================================
echo ""
echo "🔄 Phase 4: Installing PM2..."
echo ""

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
    echo "✓ PM2 $(pm2 --version) installed"
else
    echo "✓ PM2 already installed"
fi

# ========================================
# PHASE 5: Install Nginx
# ========================================
echo ""
echo "🌐 Phase 5: Installing Nginx..."
echo ""

if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
    echo "✓ Nginx installed"
else
    echo "✓ Nginx already installed"
fi

# ========================================
# PHASE 6: Configure Firewall
# ========================================
echo ""
echo "🔥 Phase 6: Configuring Firewall..."
echo ""

if command -v ufw &> /dev/null; then
    echo "Configuring UFW firewall..."
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw allow 3000/tcp # Next.js
    ufw allow 8000/tcp # Python Scraper
    echo "y" | ufw enable 2>/dev/null || true
    echo "✓ Firewall configured"
else
    echo "⚠ UFW not available, skipping firewall configuration"
fi

# ========================================
# PHASE 7: Create Application Directory
# ========================================
echo ""
echo "📁 Phase 7: Setting up Application Directory..."
echo ""

mkdir -p $APP_DIR
mkdir -p /var/log/pm2
echo "✓ Directories created"

# Backup existing installation if present
cd $APP_DIR
if [ -d ".next" ]; then
    echo "Backing up existing installation..."
    tar -czf /tmp/backup-$(date +%Y%m%d-%H%M%S).tar.gz . 2>/dev/null || true
    echo "✓ Backup complete"
fi

# ========================================
# PHASE 8: Extract Application
# ========================================
echo ""
echo "📦 Phase 8: Extracting Application..."
echo ""

echo "Extracting files..."
tar -xzf $ARCHIVE -C $APP_DIR
echo "✓ Files extracted"

# ========================================
# PHASE 9: Install Node.js Dependencies
# ========================================
echo ""
echo "📦 Phase 9: Installing Node.js Dependencies..."
echo ""

cd $APP_DIR
npm install --production
echo "✓ Node dependencies installed"

# ========================================
# PHASE 10: Build Next.js Application
# ========================================
echo ""
echo "🔨 Phase 10: Building Next.js..."
echo ""

npm run build
echo "✓ Next.js built"

# ========================================
# PHASE 11: Setup Python Scraper
# ========================================
echo ""
echo "🐍 Phase 11: Setting up Python Scraper..."
echo ""

cd $APP_DIR/Scrape_Master

# Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment exists"
fi

# Activate and install Python dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install --quiet --upgrade pip setuptools wheel
pip install --quiet -r requirements.txt

# Install Playwright browsers
echo "Installing Playwright browsers..."
playwright install chromium 2>/dev/null || playwright install --with-deps chromium
echo "✓ Python environment ready"

# ========================================
# PHASE 12: Configure Environment
# ========================================
echo ""
echo "⚙️ Phase 12: Configuring Environment..."
echo ""

cd $APP_DIR

# Create Next.js environment file
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'ENVEOF'
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

# Add your API keys here (IMPORTANT!)
# OPENAI_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here
ENVEOF
    echo "✓ Created .env.local"
else
    echo "✓ .env.local exists"
fi

# Create Python scraper environment file
cd $APP_DIR/Scrape_Master
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# AI API Keys (IMPORTANT!)
# Add your actual API keys here:
# OPENAI_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here
# DEEPSEEK_API_KEY=your-key-here
ENVEOF
    echo "✓ Created Scraper .env"
else
    echo "✓ Scraper .env exists"
fi

# Set proper permissions
chmod 600 $APP_DIR/.env.local
chmod 600 $APP_DIR/Scrape_Master/.env
echo "✓ Environment configured"

# ========================================
# PHASE 13: Configure Nginx Reverse Proxy
# ========================================
echo ""
echo "🌐 Phase 13: Configuring Nginx..."
echo ""

cat > /etc/nginx/sites-available/zaytoonz-ngo << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    # Main Next.js application
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

    # Python Scraper API (optional external access)
    location /scraper-api/ {
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
NGINXEOF

# Enable site and disable default
ln -sf /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t && systemctl restart nginx
systemctl enable nginx
echo "✓ Nginx configured"

# ========================================
# PHASE 14: Start Services with PM2
# ========================================
echo ""
echo "🚀 Phase 14: Starting Services..."
echo ""

cd $APP_DIR

# Stop any existing services
pm2 delete zaytoonz-ngo 2>/dev/null || true
pm2 delete python-scraper 2>/dev/null || true

# Start services with ecosystem config if available
if [ -f "ecosystem.production.config.js" ]; then
    echo "Starting services with ecosystem config..."
    cp ecosystem.production.config.js ecosystem.config.js
    pm2 start ecosystem.config.js
else
    echo "Starting services manually..."
    # Start Next.js
    pm2 start npm --name "zaytoonz-ngo" -- start
    
    # Start Python Scraper
    cd $APP_DIR/Scrape_Master
    pm2 start venv/bin/uvicorn --name "python-scraper" --interpreter none -- api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
echo "✓ Services started"

# ========================================
# PHASE 15: Verify Installation
# ========================================
echo ""
echo "🔍 Phase 15: Verifying Installation..."
echo ""

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Wait a moment for services to start
sleep 5

# Test Next.js
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✓ Next.js is running"
else
    echo "⚠ Next.js health check failed (may need more time to start)"
fi

# Test Python Scraper
if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✓ Python Scraper is running"
else
    echo "⚠ Python Scraper health check failed (may need more time to start)"
fi

# Test Nginx
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx is running"
else
    echo "⚠ Nginx is not running"
fi

# ========================================
# DEPLOYMENT COMPLETE
# ========================================
echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 Access Your Application:"
echo "  • Main App:        http://$SERVER_IP"
echo "  • Direct (3000):   http://$SERVER_IP:3000"
echo "  • Admin Scraper:   http://$SERVER_IP:3000/admin/Scraper/extracted"
echo "  • Scraper API:     http://$SERVER_IP:8000/health"
echo "  • External API:    http://$SERVER_IP/scraper-api/health"
echo ""
echo "📝 Important Next Steps:"
echo "  1. Add your API keys:"
echo "     • nano $APP_DIR/.env.local"
echo "     • nano $APP_DIR/Scrape_Master/.env"
echo "     • Then run: pm2 restart all"
echo ""
echo "  2. Test your deployment:"
echo "     • curl http://localhost:3000"
echo "     • curl http://localhost:8000/health"
echo ""
echo "  3. View logs:"
echo "     • pm2 logs zaytoonz-ngo"
echo "     • pm2 logs python-scraper"
echo ""
echo "🔒 Security Recommendations:"
echo "  • Set up SSH keys (disable password auth)"
echo "  • Configure SSL with Let's Encrypt (certbot)"
echo "  • Set up automatic backups"
echo "  • Monitor logs regularly"
echo ""
echo "🎉 Your Zaytoonz NGO application is now live!"
echo "=========================================="
echo ""

