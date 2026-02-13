#!/bin/bash

# VPS Initial Setup Script for Zaytoonz NGO
# This script sets up a fresh Hostinger VPS for deployment
# Run this script once on a new VPS before first deployment

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

log_info "Starting VPS setup for Zaytoonz NGO..."

# Update system packages
log_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
log_success "System packages updated"

# Install required packages
log_info "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common \
    nano \
    htop \
    net-tools \
    > /dev/null 2>&1
log_success "Required packages installed"

# Install Docker
log_info "Installing Docker..."
if command -v docker &> /dev/null; then
    log_warning "Docker is already installed"
    docker --version
else
    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install Docker using official script
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sh /tmp/get-docker.sh
    rm /tmp/get-docker.sh
    
    # Add current user to docker group (if not root)
    if [ "$SUDO_USER" ]; then
        usermod -aG docker $SUDO_USER
    fi
    
    log_success "Docker installed: $(docker --version)"
fi

# Install Docker Compose
log_info "Installing Docker Compose..."
if command -v docker-compose &> /dev/null; then
    log_warning "Docker Compose is already installed"
    docker-compose --version
else
    # Get latest version
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # Download and install
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Create symlink
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose installed: $(docker-compose --version)"
fi

# Configure firewall
log_info "Configuring firewall (UFW)..."
if command -v ufw &> /dev/null; then
    # Allow SSH (important - do this first!)
    ufw allow 22/tcp comment 'SSH'
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Enable firewall (non-interactive)
    ufw --force enable
    
    log_success "Firewall configured"
    ufw status
else
    log_warning "UFW not found, skipping firewall configuration"
fi

# Create application directories
log_info "Creating application directories..."
APP_DIR="/var/www/zaytoonz-ngo"
BACKUP_DIR="/var/backups/zaytoonz-ngo"
LOG_DIR="/var/log/zaytoonz-ngo"

mkdir -p "$APP_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Set proper permissions
chown -R root:root "$APP_DIR"
chown -R root:root "$BACKUP_DIR"
chown -R root:root "$LOG_DIR"

chmod 755 "$APP_DIR"
chmod 755 "$BACKUP_DIR"
chmod 755 "$LOG_DIR"

log_success "Directories created:"
echo "  - $APP_DIR"
echo "  - $BACKUP_DIR"
echo "  - $LOG_DIR"

# Configure Docker to start on boot
log_info "Configuring Docker to start on boot..."
systemctl enable docker
systemctl start docker
log_success "Docker service configured"

# Set up log rotation for Docker containers
log_info "Setting up log rotation..."
cat > /etc/logrotate.d/docker-containers << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
EOF
log_success "Log rotation configured"

# Optimize system settings
log_info "Optimizing system settings..."

# Increase file descriptor limits
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
EOF

# Optimize kernel parameters for Docker
cat >> /etc/sysctl.conf << 'EOF'
# Docker optimizations
vm.max_map_count=262144
fs.file-max=2097152
net.core.somaxconn=1024
net.ipv4.ip_local_port_range=1024 65535
EOF

sysctl -p > /dev/null 2>&1

log_success "System settings optimized"

# Check disk space
log_info "Checking disk space..."
AVAILABLE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
REQUIRED=10

if [ "$AVAILABLE" -lt "$REQUIRED" ]; then
    log_warning "Low disk space: ${AVAILABLE}G available (${REQUIRED}G recommended)"
else
    log_success "Disk space check passed: ${AVAILABLE}G available"
fi

# Verify installations
log_info "Verifying installations..."
echo ""
echo "=== Installation Summary ==="
echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Not installed')"
echo "Git: $(git --version 2>/dev/null || echo 'Not installed')"
echo "UFW Status: $(ufw status | head -1 2>/dev/null || echo 'Not configured')"
echo ""

# Test Docker
log_info "Testing Docker installation..."
if docker run --rm hello-world > /dev/null 2>&1; then
    log_success "Docker is working correctly"
else
    log_error "Docker test failed"
    exit 1
fi

# Final instructions
echo ""
log_success "VPS setup completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Clone the repository:"
echo "     cd $APP_DIR"
echo "     git clone https://github.com/theunknown2025/Zaytoonz_NGO.git ."
echo ""
echo "  2. Configure environment variables:"
echo "     cp .env.production.example .env"
echo "     nano .env"
echo ""
echo "  3. Run deployment:"
echo "     chmod +x scripts/deploy.sh"
echo "     ./scripts/deploy.sh"
echo ""
echo "  4. Or use GitHub Actions for automated deployment"
echo ""
log_info "Setup script completed"
