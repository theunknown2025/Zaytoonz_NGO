#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Supabase Configuration Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status
print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check if running in Docker container or VPS
if [ -f "/.dockerenv" ] || [ -f "/opt/zaytoonz-ngo/.env.production" ]; then
    ENV_FILE="/opt/zaytoonz-ngo/.env.production"
    IS_VPS=true
else
    ENV_FILE=".env.production"
    if [ ! -f "$ENV_FILE" ]; then
        ENV_FILE=".env"
    fi
    IS_VPS=false
fi

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    print_info "Loading environment from: $ENV_FILE"
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
else
    print_warning "Environment file not found: $ENV_FILE"
    print_info "Trying to load from current environment..."
fi

# Step 1: Check if variables are set
echo -e "\n${YELLOW}Step 1: Checking Environment Variables${NC}"

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_URL" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_URL is not set"
    exit 1
else
    print_success "NEXT_PUBLIC_SUPABASE_URL is set"
    echo -e "   Value: ${GREEN}${SUPABASE_URL}${NC}"
fi

if [ -z "$SUPABASE_KEY" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    exit 1
else
    print_success "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    # Show first 20 chars and last 10 chars for security
    KEY_PREVIEW="${SUPABASE_KEY:0:20}...${SUPABASE_KEY: -10}"
    echo -e "   Value: ${GREEN}${KEY_PREVIEW}${NC}"
fi

# Step 2: Validate URL format
echo -e "\n${YELLOW}Step 2: Validating URL Format${NC}"

if [[ "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    print_success "Supabase URL format is valid"
else
    print_error "Supabase URL format is invalid"
    echo -e "   Expected format: ${GREEN}https://[project-id].supabase.co${NC}"
    echo -e "   Got: ${RED}${SUPABASE_URL}${NC}"
    exit 1
fi

# Step 3: Validate JWT token format
echo -e "\n${YELLOW}Step 3: Validating JWT Token Format${NC}"

if [[ "$SUPABASE_KEY" =~ ^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$ ]]; then
    print_success "JWT token format is valid"
else
    print_error "JWT token format appears invalid"
    print_warning "Token should start with 'eyJ' and contain 3 parts separated by dots"
fi

# Step 4: Test Supabase API connection
echo -e "\n${YELLOW}Step 4: Testing Supabase API Connection${NC}"

# Check if curl is available
if ! command -v curl &> /dev/null; then
    print_warning "curl not found, skipping API test"
    print_info "Install curl to test API connection: apt-get install curl"
else
    # Test REST API endpoint
    API_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        "${SUPABASE_URL}/rest/v1/" 2>&1) || true
    
    HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
        print_success "Supabase API is reachable (HTTP $HTTP_CODE)"
        print_info "Response indicates the server is responding"
    elif [ "$HTTP_CODE" = "000" ]; then
        print_error "Cannot connect to Supabase API"
        print_info "Check your internet connection and URL"
        exit 1
    else
        print_warning "Unexpected HTTP response: $HTTP_CODE"
        print_info "This might indicate a configuration issue"
    fi
fi

# Step 5: Test with Node.js (if available)
echo -e "\n${YELLOW}Step 5: Testing Supabase Client Connection${NC}"

if command -v node &> /dev/null; then
    # Create a temporary test script
    TEST_SCRIPT=$(cat << 'NODE_EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Environment variables not set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection by querying a system table
supabase
    .from('users')
    .select('count')
    .limit(1)
    .then(({ data, error, status }) => {
        if (error) {
            // Check if it's a permission error (which means connection works)
            if (error.code === 'PGRST116' || error.message.includes('permission') || error.message.includes('RLS')) {
                console.log('SUCCESS: Connection works! (RLS/permission error is expected)');
                process.exit(0);
            } else if (error.code === '42P01') {
                console.log('WARNING: Table "users" does not exist, but connection works');
                process.exit(0);
            } else {
                console.error('ERROR:', error.message);
                process.exit(1);
            }
        } else {
            console.log('SUCCESS: Connection works! Query successful.');
            process.exit(0);
        }
    })
    .catch((err) => {
        console.error('ERROR:', err.message);
        process.exit(1);
    });
NODE_EOF
)
    
    # Check if @supabase/supabase-js is installed
    if [ -f "package.json" ] && grep -q "@supabase/supabase-js" package.json; then
        # Try to run the test
        TEST_RESULT=$(echo "$TEST_SCRIPT" | node 2>&1) || TEST_EXIT_CODE=$?
        
        if [ ${TEST_EXIT_CODE:-0} -eq 0 ]; then
            print_success "Supabase client connection test passed"
            echo -e "   ${GREEN}${TEST_RESULT}${NC}"
        else
            print_warning "Supabase client test had issues"
            echo -e "   ${YELLOW}${TEST_RESULT}${NC}"
            print_info "This might be due to RLS policies or missing tables"
        fi
    else
        print_info "Node.js available but @supabase/supabase-js not found in package.json"
        print_info "Skipping client test (this is normal if not in project directory)"
    fi
else
    print_info "Node.js not available, skipping client test"
fi

# Step 6: Verify in Docker container (if applicable)
if [ "$IS_VPS" = true ]; then
    echo -e "\n${YELLOW}Step 6: Verifying Configuration in Docker Container${NC}"
    
    if command -v docker &> /dev/null; then
        # Check if nextjs container is running
        if docker ps | grep -q "zaytoonz-nextjs-beta"; then
            print_info "Checking environment variables in Next.js container..."
            
            CONTAINER_ENV=$(docker exec zaytoonz-nextjs-beta env | grep -E "NEXT_PUBLIC_SUPABASE" || true)
            
            if echo "$CONTAINER_ENV" | grep -q "NEXT_PUBLIC_SUPABASE_URL"; then
                print_success "Supabase URL is set in container"
                CONTAINER_URL=$(docker exec zaytoonz-nextjs-beta sh -c 'echo $NEXT_PUBLIC_SUPABASE_URL')
                if [ "$CONTAINER_URL" = "$SUPABASE_URL" ]; then
                    print_success "Container URL matches environment file"
                else
                    print_warning "Container URL differs from environment file"
                    echo -e "   Env file: ${GREEN}${SUPABASE_URL}${NC}"
                    echo -e "   Container: ${YELLOW}${CONTAINER_URL}${NC}"
                fi
            else
                print_error "Supabase URL not found in container environment"
            fi
            
            if echo "$CONTAINER_ENV" | grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY"; then
                print_success "Supabase key is set in container"
            else
                print_error "Supabase key not found in container environment"
            fi
        else
            print_warning "Next.js container is not running"
            print_info "Start containers with: docker compose -f docker-compose-beta.yml up -d"
        fi
    fi
fi

# Step 7: Summary and recommendations
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Configuration Details:${NC}"
echo -e "  URL: ${GREEN}${SUPABASE_URL}${NC}"
echo -e "  Key: ${GREEN}${SUPABASE_KEY:0:30}...${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify credentials in Supabase Dashboard:"
echo -e "     ${BLUE}https://app.supabase.com/project/uroirdudxkfppocqcorm/settings/api${NC}"
echo -e "  2. Test authentication in your application"
echo -e "  3. Check browser console for any Supabase errors"
echo -e "  4. Verify RLS (Row Level Security) policies are configured"

echo -e "\n${YELLOW}To test in your application:${NC}"
echo -e "  - Try signing up a new user"
echo -e "  - Try signing in with existing credentials"
echo -e "  - Check browser Network tab for Supabase API calls"

echo -e "\n${GREEN}✓ Supabase configuration verification complete!${NC}\n"
