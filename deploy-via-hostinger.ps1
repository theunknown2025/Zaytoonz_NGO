# PowerShell script to deploy to /test subdirectory using Hostinger MCP and GitHub
# This script uses SSH to deploy directly from GitHub
# Usage: .\deploy-via-hostinger.ps1

param(
    [string]$VPS_IP = "168.231.87.171",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY = "",
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Info { param($msg) Write-Host "[*] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Zaytoonz NGO - Deploy to /test via Hostinger VPS     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$APP_DIR = "/var/www/zaytoonz-ngo"
$REPO_URL = "https://github.com/theunknown2025/Zaytoonz_NGO.git"
$BRANCH = "main"

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH command not found. Please install OpenSSH or use Git Bash."
    exit 1
}

# Build locally if not skipped
if (-not $SkipBuild) {
    Write-Info "Building Next.js application locally..."
    $env:NEXT_PUBLIC_BASE_PATH = "/test"
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed! Please fix errors and try again."
        exit 1
    }
    Write-Success "Build completed successfully"
}

# Create SSH command
$sshCmd = if ($SSH_KEY) {
    "ssh -i `"$SSH_KEY`" $VPS_USER@$VPS_IP"
} else {
    "ssh $VPS_USER@$VPS_IP"
}

Write-Info "Connecting to VPS at $VPS_IP..."

# Create deployment script content
$deployScript = @'
#!/bin/bash
set -e

APP_DIR="/var/www/zaytoonz-ngo"
REPO_URL="https://github.com/theunknown2025/Zaytoonz_NGO.git"
BRANCH="main"

echo "[*] Starting deployment to /test subdirectory..."

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "[*] Cloning repository..."
    mkdir -p $(dirname $APP_DIR)
    git clone $REPO_URL $APP_DIR
else
    echo "[*] Updating code from GitHub..."
    cd $APP_DIR
    if [ ! -d ".git" ]; then
        git init
        git remote add origin $REPO_URL
        git fetch
        git checkout -b main origin/main
    else
        git fetch origin
        git reset --hard origin/$BRANCH
    fi
fi

cd $APP_DIR

# Backup .env.local if exists
if [ -f ".env.local" ]; then
    echo "[*] Backing up .env.local..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# Setup environment variables
echo "[*] Setting up environment..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_BASE_PATH=/test
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
NODE_ENV=production
PORT=3001
ENVEOF
    echo "[WARN] .env.local created with default values. Please update with your API keys."
fi

# Ensure NEXT_PUBLIC_BASE_PATH is set
if ! grep -q "NEXT_PUBLIC_BASE_PATH" .env.local; then
    echo "NEXT_PUBLIC_BASE_PATH=/test" >> .env.local
fi

# Load environment
export $(grep -v '^#' .env.local | xargs)

# Install dependencies
echo "[*] Installing dependencies..."
npm install --production

# Build application
echo "[*] Building Next.js application with basePath=/test..."
export NEXT_PUBLIC_BASE_PATH=/test
npm run build

# Configure PM2
echo "[*] Configuring PM2..."
pm2 delete zaytoonz-test 2>/dev/null || true

if [ -f "ecosystem.test.config.js" ]; then
    pm2 start ecosystem.test.config.js
    pm2 save
    echo "[OK] PM2 started with ecosystem config"
else
    PORT=3001 pm2 start server.js --name zaytoonz-test --update-env --cwd $APP_DIR
    pm2 save
    echo "[OK] PM2 started manually"
fi

# Show status
echo ""
echo "[*] PM2 Status:"
pm2 status zaytoonz-test

# Configure Nginx
echo ""
echo "[*] Configuring Nginx..."
if [ -f "guidelines/nginx-test-subdirectory.conf" ]; then
    cp guidelines/nginx-test-subdirectory.conf /etc/nginx/sites-available/zaytoonz-ngo
    echo "[WARN] Please edit /etc/nginx/sites-available/zaytoonz-ngo"
    echo "[WARN] Update the path to your 'Coming Soon' page directory"
    echo ""
    read -p "Test and reload Nginx now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if nginx -t; then
            systemctl reload nginx
            echo "[OK] Nginx configured and reloaded"
        else
            echo "[ERROR] Nginx configuration test failed"
        fi
    fi
fi

echo ""
echo "[SUCCESS] Deployment complete!"
echo "[*] Access your app at: https://zaytoonz.com/test"
'@

# Write deployment script to temp file
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline

Write-Info "Uploading deployment script to VPS..."

# Upload script to VPS
if ($SSH_KEY) {
    scp -i $SSH_KEY $tempScript "${VPS_USER}@${VPS_IP}:/tmp/deploy-test.sh"
} else {
    scp $tempScript "${VPS_USER}@${VPS_IP}:/tmp/deploy-test.sh"
}

# Clean up local temp file
Remove-Item $tempScript -Force

Write-Info "Running deployment script on VPS..."
Write-Warning "You may be prompted for your VPS password"

# Execute deployment script on VPS
if ($SSH_KEY) {
    ssh -i $SSH_KEY $VPS_USER@$VPS_IP "chmod +x /tmp/deploy-test.sh && bash /tmp/deploy-test.sh"
} else {
    ssh $VPS_USER@$VPS_IP "chmod +x /tmp/deploy-test.sh && bash /tmp/deploy-test.sh"
}

Write-Host ""
Write-Success "Deployment process completed!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "  1. Verify PM2: ssh $VPS_USER@$VPS_IP 'pm2 status zaytoonz-test'"
Write-Host "  2. Check logs: ssh $VPS_USER@$VPS_IP 'pm2 logs zaytoonz-test'"
Write-Host "  3. Configure Nginx if not done: ssh $VPS_USER@$VPS_IP 'nano /etc/nginx/sites-available/zaytoonz-ngo'"
Write-Host "  4. Access your app at: https://zaytoonz.com/test"
Write-Host ""

