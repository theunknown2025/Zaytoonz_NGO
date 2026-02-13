#!/bin/bash

# Rollback Script for Zaytoonz NGO Deployment
# This script restores the previous deployment from backup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"
BACKUP_DIR="/var/backups/zaytoonz-ngo"
COMPOSE_FILE="docker-compose.production.yml"

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

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Backup directory not found: $BACKUP_DIR"
    log_info "No backups available for rollback"
    exit 1
fi

log_info "Starting rollback process..."
log_info "Working directory: $APP_DIR"
log_info "Backup directory: $BACKUP_DIR"
echo ""

# List available backups
log_info "Available backups:"
BACKUPS=($(ls -t "$BACKUP_DIR" | grep "^backup_" | head -10))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    log_error "No backups found in $BACKUP_DIR"
    exit 1
fi

# Display backups
for i in "${!BACKUPS[@]}"; do
    BACKUP_DATE=$(echo "${BACKUPS[$i]}" | sed 's/backup_//' | sed 's/_/ /')
    echo "  [$((i+1))] ${BACKUPS[$i]} ($BACKUP_DATE)"
done

echo ""

# Ask user to select backup
if [ -z "$1" ]; then
    read -p "Select backup to restore (1-${#BACKUPS[@]}, default: 1): " SELECTION
    SELECTION=${SELECTION:-1}
else
    SELECTION=$1
fi

# Validate selection
if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#BACKUPS[@]} ]; then
    log_error "Invalid selection: $SELECTION"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$((SELECTION-1))]}"
BACKUP_PATH="$BACKUP_DIR/$SELECTED_BACKUP"

log_info "Selected backup: $SELECTED_BACKUP"
log_info "Backup path: $BACKUP_PATH"

# Verify backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    log_error "Backup directory not found: $BACKUP_PATH"
    exit 1
fi

# Confirm rollback
if [ -z "$2" ] || [ "$2" != "--yes" ]; then
    log_warning "This will stop current services and restore from backup: $SELECTED_BACKUP"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi
fi

echo ""
log_info "Starting rollback..."

# Step 1: Stop current services
log_info "Stopping current services..."
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    log_success "Services stopped"
else
    log_info "No running services to stop"
fi

# Step 2: Restore environment file
if [ -f "$BACKUP_PATH/.env" ]; then
    log_info "Restoring environment file..."
    cp "$BACKUP_PATH/.env" "$APP_DIR/.env"
    log_success "Environment file restored"
else
    log_warning "No .env file found in backup"
fi

# Step 3: Check if we need to restore code
log_info "Checking if code rollback is needed..."

# Get current git commit
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

# Check backup for git commit info
if [ -f "$BACKUP_PATH/git-commit.txt" ]; then
    BACKUP_COMMIT=$(cat "$BACKUP_PATH/git-commit.txt")
    log_info "Backup was from commit: $BACKUP_COMMIT"
    log_info "Current commit: $CURRENT_COMMIT"
    
    if [ "$CURRENT_COMMIT" != "$BACKUP_COMMIT" ] && [ "$CURRENT_COMMIT" != "unknown" ]; then
        log_info "Rolling back code to backup commit..."
        git fetch origin
        git reset --hard "$BACKUP_COMMIT" || {
            log_warning "Could not reset to backup commit, trying to checkout..."
            git checkout "$BACKUP_COMMIT" || log_warning "Code rollback failed, continuing with current code"
        }
        log_success "Code rolled back to commit: $BACKUP_COMMIT"
    else
        log_info "Code is already at backup commit or git not available"
    fi
else
    log_warning "No git commit info in backup, skipping code rollback"
fi

# Step 4: Rebuild and restart services
log_info "Rebuilding services..."
if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
    log_success "Services rebuilt"
else
    log_error "Failed to rebuild services"
    exit 1
fi

log_info "Starting services..."
if docker-compose -f "$COMPOSE_FILE" up -d; then
    log_success "Services started"
else
    log_error "Failed to start services"
    exit 1
fi

# Step 5: Wait for services to initialize
log_info "Waiting for services to initialize..."
sleep 15

# Step 6: Health checks
log_info "Performing health checks..."

MAX_RETRIES=20
RETRY_INTERVAL=5
HEALTH_CHECK_FAILED=0

# Check Next.js service
log_info "Checking Next.js service..."
RETRY_COUNT=0
NEXTJS_HEALTHY=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3002/health > /dev/null 2>&1 || \
       curl -f http://localhost:3002/ > /dev/null 2>&1; then
        log_success "Next.js service is healthy"
        NEXTJS_HEALTHY=1
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo -n "."
        sleep $RETRY_INTERVAL
    fi
done
echo ""

if [ $NEXTJS_HEALTHY -eq 0 ]; then
    log_error "Next.js service health check failed"
    HEALTH_CHECK_FAILED=1
fi

# Check Nginx service
log_info "Checking Nginx service..."
if docker-compose -f "$COMPOSE_FILE" ps nginx | grep -q "Up"; then
    log_success "Nginx service is running"
else
    log_error "Nginx service is not running"
    HEALTH_CHECK_FAILED=1
fi

# Step 7: Display summary
echo ""
log_info "Service status:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""

if [ $HEALTH_CHECK_FAILED -eq 1 ]; then
    log_error "Rollback completed but health checks failed"
    log_info "Check logs: docker-compose -f $COMPOSE_FILE logs"
    exit 1
else
    log_success "Rollback completed successfully!"
    echo ""
    echo "=== Rollback Summary ==="
    echo "Restored from: $SELECTED_BACKUP"
    echo "Backup path: $BACKUP_PATH"
    echo ""
    echo "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Access your application:"
    echo "  - Next.js: http://localhost:3002"
    echo "  - Scraper API: http://localhost:8000"
    echo "  - Nginx: http://localhost"
    echo ""
    log_info "To verify deployment: ./scripts/health-check.sh"
fi
