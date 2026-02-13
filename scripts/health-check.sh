#!/bin/bash

# Health Check Script for Zaytoonz NGO Services
# This script verifies all services are running correctly after deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"
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

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

log_info "Starting health checks for Zaytoonz NGO services..."
echo ""

# Track overall health status
OVERALL_HEALTHY=1

# Function to check service health
check_service() {
    local service_name=$1
    local health_endpoint=$2
    local port=$3
    local description=$4
    
    log_info "Checking $description..."
    
    # Check if container is running
    if ! docker-compose -f "$COMPOSE_FILE" ps "$service_name" | grep -q "Up"; then
        log_error "$description container is not running"
        OVERALL_HEALTHY=0
        return 1
    fi
    
    # Check Docker health status
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$service_name" 2>/dev/null || echo "none")
    
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        log_success "$description container is healthy (Docker health check)"
        return 0
    elif [ "$HEALTH_STATUS" = "unhealthy" ]; then
        log_error "$description container is unhealthy (Docker health check)"
        OVERALL_HEALTHY=0
        return 1
    fi
    
    # Manual health check via endpoint
    if [ -n "$health_endpoint" ]; then
        # Try internal check first
        if docker-compose -f "$COMPOSE_FILE" exec -T "$service_name" wget -q --spider "$health_endpoint" 2>/dev/null || \
           docker-compose -f "$COMPOSE_FILE" exec -T "$service_name" curl -f "$health_endpoint" > /dev/null 2>&1; then
            log_success "$description is responding at $health_endpoint"
            return 0
        fi
        
        # Try external check if port is provided
        if [ -n "$port" ]; then
            if curl -f "http://localhost:$port$health_endpoint" > /dev/null 2>&1 || \
               curl -f "http://localhost:$port/" > /dev/null 2>&1; then
                log_success "$description is responding on port $port"
                return 0
            fi
        fi
        
        log_warning "$description health endpoint check failed (service may still be starting)"
        return 1
    else
        # Just check if container is running
        log_success "$description container is running"
        return 0
    fi
}

# Check Next.js service
if check_service "nextjs" "http://localhost:3000/health" "3002" "Next.js Application"; then
    # Additional check: verify Next.js is serving content
    if curl -f http://localhost:3002/ > /dev/null 2>&1; then
        log_success "Next.js is serving content on port 3002"
    else
        log_warning "Next.js may not be fully ready yet"
    fi
else
    OVERALL_HEALTHY=0
fi

echo ""

# Check Python Scraper service
if check_service "python-scraper" "http://localhost:8000/health" "8000" "Python Scraper API"; then
    # Additional check: verify scraper API
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_success "Python Scraper API is responding"
    else
        log_warning "Python Scraper API may not be fully ready yet"
    fi
else
    OVERALL_HEALTHY=0
fi

echo ""

# Check NLWeb service (optional)
if docker-compose -f "$COMPOSE_FILE" ps nlweb | grep -q "Up"; then
    if check_service "nlweb" "http://localhost:8000/health" "8002" "NLWeb Service"; then
        log_success "NLWeb service is running"
    else
        log_warning "NLWeb service check failed (non-critical)"
    fi
else
    log_info "NLWeb service is not running (optional service)"
fi

echo ""

# Check Nginx service
if check_service "nginx" "http://localhost/health" "80" "Nginx Reverse Proxy"; then
    # Additional check: verify Nginx can reach backend
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Nginx is serving content and can reach backend"
    else
        log_warning "Nginx may not be fully configured"
    fi
else
    OVERALL_HEALTHY=0
fi

echo ""

# Check Certbot service (optional)
if docker-compose -f "$COMPOSE_FILE" ps certbot | grep -q "Up"; then
    if docker-compose -f "$COMPOSE_FILE" ps certbot | grep -q "Up"; then
        log_success "Certbot service is running"
    else
        log_warning "Certbot service is not running (non-critical for initial setup)"
    fi
else
    log_info "Certbot service is not running (optional for SSL)"
fi

echo ""

# Check container resource usage
log_info "Checking container resource usage..."
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -10

echo ""

# Check disk space
log_info "Checking disk space..."
df -h / | tail -1 | awk '{print "Available: " $4 " of " $2 " (" $5 " used)"}'

echo ""

# Check Docker logs for errors
log_info "Checking for recent errors in logs..."
ERROR_COUNT=0

for service in nextjs python-scraper nginx nlweb; do
    if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
        ERRORS=$(docker-compose -f "$COMPOSE_FILE" logs --tail=50 "$service" 2>&1 | grep -i "error\|fatal\|exception" | wc -l)
        if [ "$ERRORS" -gt 0 ]; then
            log_warning "$service has $ERRORS recent error messages"
            ERROR_COUNT=$((ERROR_COUNT + ERRORS))
        fi
    fi
done

if [ "$ERROR_COUNT" -eq 0 ]; then
    log_success "No recent errors found in service logs"
else
    log_warning "Found $ERROR_COUNT error messages across services"
fi

echo ""

# Final summary
echo "=========================================="
if [ $OVERALL_HEALTHY -eq 1 ]; then
    log_success "All critical services are healthy!"
    echo ""
    echo "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Access your application:"
    echo "  - Next.js: http://localhost:3002"
    echo "  - Scraper API: http://localhost:8000"
    echo "  - Nginx: http://localhost"
    exit 0
else
    log_error "Some services are not healthy!"
    echo ""
    echo "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    log_info "Check logs for details:"
    echo "  docker-compose -f $COMPOSE_FILE logs [service-name]"
    exit 1
fi
