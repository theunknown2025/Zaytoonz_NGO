#!/bin/bash

# PM2 Deployment Script for Zaytoonz NGO
# This script handles deployment using PM2 and Nginx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"

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

cd "$APP_DIR"

log_info "Starting PM2 deployment process..."
log_info "Working directory: $APP_DIR"

# Step 1: Check disk space
log_info "Checking disk space..."
AVAILABLE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
REQUIRED=5

if [ "$AVAILABLE" -lt "$REQUIRED" ]; then
    log_error "Insufficient disk space. Available: ${AVAILABLE}G, Required: ${REQUIRED}G"
    exit 1
fi
log_success "Disk space check passed: ${AVAILABLE}G available"

# Step 2: Validate environment file
log_info "Validating environment file..."
if [ ! -f ".env" ]; then
    log_warning ".env file not found"
    if [ -f ".env.production.example" ]; then
        log_info "Creating .env from template..."
        cp .env.production.example .env
        log_warning "Please update .env with your actual values before continuing"
    else
        log_error ".env file not found and no template available"
        exit 1
    fi
fi

# Step 3: Pull latest code
if [ -d ".git" ]; then
    log_info "Pulling latest code from GitHub..."
    git fetch origin
    git reset --hard origin/main
    git clean -fd
    log_success "Code updated to: $(git rev-parse HEAD)"
else
    log_warning "Not a git repository, skipping code update"
fi

# Step 4: Install dependencies
log_info "Installing Node.js dependencies..."
npm ci --production=false
log_success "Dependencies installed"

# Step 5: Build application
log_info "Building Next.js application..."
rm -rf .next
npm run build
log_success "Application built successfully"

# Step 6: Restart PM2 services
log_info "Restarting PM2 services..."
if [ -f "ecosystem.production.config.js" ]; then
    pm2 restart ecosystem.production.config.js || pm2 start ecosystem.production.config.js
    pm2 save
    log_success "PM2 services restarted"
else
    log_error "ecosystem.production.config.js not found"
    exit 1
fi

# Step 7: Reload Nginx
log_info "Reloading Nginx..."
if nginx -t; then
    systemctl reload nginx
    log_success "Nginx reloaded"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

# Step 8: Health checks
log_info "Performing health checks..."
sleep 5

# Check Next.js
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    log_success "Next.js is responding"
else
    log_warning "Next.js health check failed (may need more time)"
fi

# Check Nginx
if curl -f http://localhost/ > /dev/null 2>&1; then
    log_success "Nginx is serving content"
else
    log_warning "Nginx health check failed"
fi

# Step 9: Show status
log_info "PM2 Status:"
pm2 status

echo ""
log_success "Deployment completed successfully!"
echo ""
echo "=== Deployment Summary ==="
echo "Application Directory: $APP_DIR"
echo "PM2 Services:"
pm2 list
echo ""
echo "Access your application:"
echo "  - Via Nginx: http://168.231.87.171"
echo "  - Direct: http://168.231.87.171:3000"
echo ""
log_info "To view logs: pm2 logs"
log_info "To monitor: pm2 monit"
