#!/bin/bash

# Setup Script for Nginx + PM2 Deployment
# This script sets up the VPS for PM2 and Nginx deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

log_info "Starting Nginx + PM2 setup for Zaytoonz NGO..."

# Update system
log_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
log_success "System packages updated"

# Install Node.js 20
log_info "Installing Node.js 20..."
if command -v node &> /dev/null && node --version | grep -q "v20"; then
    log_warning "Node.js 20 is already installed"
    node --version
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_success "Node.js installed: $(node --version)"
fi

# Install PM2
log_info "Installing PM2..."
if command -v pm2 &> /dev/null; then
    log_warning "PM2 is already installed"
    pm2 --version
else
    npm install -g pm2
    log_success "PM2 installed: $(pm2 --version)"
fi

# Install Python and dependencies
log_info "Installing Python and dependencies..."
apt-get install -y python3.11 python3.11-venv python3-pip python3-dev \
    build-essential wget curl git

# Install Chrome dependencies
log_info "Installing Chrome dependencies..."
apt-get install -y \
    wget gnupg ca-certificates \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

# Install Google Chrome
log_info "Installing Google Chrome..."
if command -v google-chrome &> /dev/null; then
    log_warning "Google Chrome is already installed"
else
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
    apt-get update
    apt-get install -y google-chrome-stable
    log_success "Google Chrome installed"
fi

# Install Nginx
log_info "Installing Nginx..."
if command -v nginx &> /dev/null; then
    log_warning "Nginx is already installed"
    nginx -v
else
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_success "Nginx installed and started"
fi

# Configure firewall
log_info "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw --force enable
    log_success "Firewall configured"
else
    log_warning "UFW not found, skipping firewall configuration"
fi

# Create directories
log_info "Creating application directories..."
APP_DIR="/var/www/zaytoonz-ngo"
mkdir -p "$APP_DIR"
mkdir -p /var/log/pm2
chown -R root:root "$APP_DIR"
chown -R root:root /var/log/pm2
log_success "Directories created"

# Setup PM2 log rotation
log_info "Setting up PM2 log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
log_success "PM2 log rotation configured"

log_success "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Clone repository: cd $APP_DIR && git clone https://github.com/theunknown2025/Zaytoonz_NGO.git ."
echo "  2. Install dependencies: npm ci"
echo "  3. Build application: npm run build"
echo "  4. Setup Python environments (see NGINX_PM2_DEPLOYMENT_GUIDE.md)"
echo "  5. Configure .env file"
echo "  6. Start with PM2: pm2 start ecosystem.production.config.js"
echo "  7. Configure Nginx (see NGINX_PM2_DEPLOYMENT_GUIDE.md)"
