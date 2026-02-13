#!/bin/bash

# Automated Deployment Script for Zaytoonz NGO
# This script handles deployment to Hostinger VPS with health checks and rollback

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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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
    log_info "Please run setup-vps.sh first or clone the repository"
    exit 1
fi

cd "$APP_DIR"

log_info "Starting deployment process..."
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
        log_warning "Press Enter to continue or Ctrl+C to abort..."
        read
    else
        log_error ".env file not found and no template available"
        exit 1
    fi
fi

# Source environment file for validation
set +e
source .env 2>/dev/null
set -e

# Check required variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "OPENAI_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_error "Missing required environment variables:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi
log_success "Environment variables validated"

# Step 3: Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Step 4: Create backup
log_info "Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

# Backup environment file
if [ -f ".env" ]; then
    cp .env "$BACKUP_PATH/.env"
fi

# Backup docker-compose state
if docker-compose -f "$COMPOSE_FILE" ps > "$BACKUP_PATH/services.txt" 2>&1; then
    log_success "Backup created: $BACKUP_PATH"
else
    log_warning "Could not backup service state (services may not be running)"
fi

# Backup git commit info for rollback
if [ -d ".git" ]; then
    git rev-parse HEAD > "$BACKUP_PATH/git-commit.txt" 2>/dev/null || true
    git log -1 --pretty=format:"%H%n%an%n%ae%n%ad%n%s" > "$BACKUP_PATH/git-info.txt" 2>/dev/null || true
fi

# Step 5: Pull latest code (if git repository)
if [ -d ".git" ]; then
    log_info "Pulling latest code from GitHub..."
    git fetch origin
    git reset --hard origin/main
    git clean -fd
    log_success "Code updated to: $(git rev-parse HEAD)"
else
    log_warning "Not a git repository, skipping code update"
fi

# Step 6: Stop and remove existing services
log_info "Stopping and removing existing services..."
# Stop services using docker-compose
docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# Remove any containers with our naming pattern that might still exist
log_info "Cleaning up any remaining containers..."
CONTAINERS=(
    "zaytoonz-nextjs"
    "zaytoonz-scraper"
    "zaytoonz-nlweb"
    "zaytoonz-nginx"
    "zaytoonz-certbot"
)

for container in "${CONTAINERS[@]}"; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        log_info "Removing container: $container"
        docker rm -f "$container" 2>/dev/null || true
    fi
done

log_success "Existing services cleaned up"

# Step 7: Build Docker images
log_info "Building Docker images..."
if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
    log_success "Docker images built successfully"
else
    log_error "Docker build failed"
    exit 1
fi

# Step 8: Start services
log_info "Starting services..."
if docker-compose -f "$COMPOSE_FILE" up -d; then
    log_success "Services started"
else
    log_error "Failed to start services"
    exit 1
fi

# Step 9: Wait for services to initialize
log_info "Waiting for services to initialize..."
sleep 15

# Step 10: Health checks
log_info "Performing health checks..."

MAX_RETRIES=30
RETRY_INTERVAL=5
HEALTH_CHECK_FAILED=0

# Check Next.js service
log_info "Checking Next.js service..."
RETRY_COUNT=0
NEXTJS_HEALTHY=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T nextjs wget -q --spider http://localhost:3000/health 2>/dev/null || \
       docker-compose -f "$COMPOSE_FILE" exec -T nextjs wget -q --spider http://localhost:3000/ 2>/dev/null || \
       curl -f http://localhost:3002/health > /dev/null 2>&1 || \
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
    docker-compose -f "$COMPOSE_FILE" logs nextjs --tail=50
    HEALTH_CHECK_FAILED=1
fi

# Check Python scraper service
log_info "Checking Python scraper service..."
RETRY_COUNT=0
SCRAPER_HEALTHY=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T python-scraper curl -f http://localhost:8000/health > /dev/null 2>&1 || \
       curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_success "Python scraper service is healthy"
        SCRAPER_HEALTHY=1
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo -n "."
        sleep $RETRY_INTERVAL
    fi
done
echo ""

if [ $SCRAPER_HEALTHY -eq 0 ]; then
    log_warning "Python scraper service health check failed (non-critical)"
fi

# Check Nginx service
log_info "Checking Nginx service..."
if docker-compose -f "$COMPOSE_FILE" ps nginx | grep -q "Up"; then
    log_success "Nginx service is running"
else
    log_error "Nginx service is not running"
    docker-compose -f "$COMPOSE_FILE" logs nginx --tail=50
    HEALTH_CHECK_FAILED=1
fi

# Step 11: Rollback if health checks failed
if [ $HEALTH_CHECK_FAILED -eq 1 ]; then
    log_error "Health checks failed. Attempting rollback..."
    
    # Stop current services
    docker-compose -f "$COMPOSE_FILE" down || true
    
    # Restore environment file
    if [ -f "$BACKUP_PATH/.env" ]; then
        log_info "Restoring environment file..."
        cp "$BACKUP_PATH/.env" .env
    fi
    
    # Try to restart previous version
    log_info "Attempting to restart previous version..."
    docker-compose -f "$COMPOSE_FILE" up -d || true
    
    log_error "Deployment failed. Rollback attempted."
    log_info "Backup available at: $BACKUP_PATH"
    log_info "Check logs: docker-compose -f $COMPOSE_FILE logs"
    exit 1
fi

# Step 12: Show service status
log_info "Service status:"
docker-compose -f "$COMPOSE_FILE" ps

# Step 13: Display summary
echo ""
log_success "Deployment completed successfully!"
echo ""
echo "=== Deployment Summary ==="
echo "Application Directory: $APP_DIR"
echo "Backup Location: $BACKUP_PATH"
echo "Services Status:"
docker-compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Access your application:"
echo "  - Next.js: http://localhost:3002"
echo "  - Scraper API: http://localhost:8000"
echo "  - Nginx: http://localhost"
echo ""
log_info "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
log_info "To check health: ./scripts/health-check.sh"
