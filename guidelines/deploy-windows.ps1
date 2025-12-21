# Zaytoonz NGO - Windows Deployment Script
# Simplified version for PowerShell

param(
    [string]$VPS_IP = "168.231.87.171",
    [string]$VPS_USER = "root"
)

$ErrorActionPreference = "Stop"

function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "▶ $args" -ForegroundColor Blue }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Header { Write-Host "$args" -ForegroundColor Magenta }

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Header "🚀 Zaytoonz NGO Deployment to Hostinger VPS"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Run this from project root."
    exit 1
}

# Build application
Write-Info "Building Next.js application..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}
Write-Success "Build complete"
Write-Host ""

# Create archive
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveName = "zaytoonz-deploy-$timestamp.tar.gz"

Write-Info "Creating deployment archive..."
tar --exclude='node_modules' `
    --exclude='.next' `
    --exclude='.git' `
    --exclude='.env*' `
    --exclude='**/venv' `
    --exclude='**/__pycache__' `
    --exclude='*.pyc' `
    --exclude='*.log' `
    -czf $archiveName .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Archive creation failed!"
    exit 1
}
Write-Success "Archive created: $archiveName"
Write-Host ""

# Upload to VPS
Write-Info "Uploading to VPS..."
scp $archiveName "${VPS_USER}@${VPS_IP}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Upload failed!"
    Remove-Item $archiveName -ErrorAction SilentlyContinue
    exit 1
}
Write-Success "Upload complete"
Write-Host ""

# Deploy on VPS
Write-Info "Deploying on VPS..."
Write-Host ""

# Create deployment script on VPS
$deployScript = "/tmp/deploy-zaytoonz.sh"
ssh "${VPS_USER}@${VPS_IP}" "cat > $deployScript" @"
#!/bin/bash
set -e

APP_DIR=/var/www/zaytoonz-ngo
ARCHIVE=/tmp/$archiveName

echo "=========================================="
echo "Deploying Zaytoonz NGO"
echo "=========================================="

# Create directory
mkdir -p `$APP_DIR
cd `$APP_DIR

# Backup
if [ -d ".next" ]; then
    echo "Backing up..."
    tar -czf /tmp/backup-`$(date +%Y%m%d-%H%M%S).tar.gz . 2>/dev/null || true
fi

# Extract
echo "Extracting files..."
tar -xzf `$ARCHIVE -C `$APP_DIR

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install --production

# Build Next.js
echo "Building Next.js..."
npm run build

# Setup Python scraper
echo "Setting up Python scraper..."
cd `$APP_DIR/Scrape_Master

# Install system packages
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv 2>/dev/null || true

# Create venv
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Install Python deps
source venv/bin/activate
pip install --quiet -r requirements.txt
playwright install chromium 2>/dev/null || true

# Create env files if needed
cd `$APP_DIR
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NODE_ENV=production
PORT=3000
ENVEOF
fi

cd `$APP_DIR/Scrape_Master
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
ENVEOF
fi

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Restart services
cd `$APP_DIR
pm2 delete zaytoonz-ngo 2>/dev/null || true
pm2 delete python-scraper 2>/dev/null || true

if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start npm --name "zaytoonz-ngo" -- start
    cd `$APP_DIR/Scrape_Master
    pm2 start venv/bin/uvicorn --name "python-scraper" -- api_wrapper:app --host 0.0.0.0 --port 8000
fi

pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
pm2 status
"@

# Make script executable and run it
ssh "${VPS_USER}@${VPS_IP}" "chmod +x $deployScript && bash $deployScript"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed!"
    Remove-Item $archiveName -ErrorAction SilentlyContinue
    exit 1
}

Write-Success "Deployment complete!"
Write-Host ""

# Clean up
Remove-Item $archiveName -ErrorAction SilentlyContinue
Write-Success "Cleaned up local files"
Write-Host ""

Write-Host "================================================================" -ForegroundColor Green
Write-Success "Deployment Successful!"
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application: http://${VPS_IP}:3000" -ForegroundColor Cyan
Write-Host "🐍 Scraper API: http://${VPS_IP}:8000" -ForegroundColor Cyan
Write-Host "🎯 Admin Scraper: http://${VPS_IP}:3000/admin/Scraper/extracted" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Add API keys: ssh ${VPS_USER}@${VPS_IP}"
Write-Host "2. Test the application"
Write-Host "3. Check logs: ssh ${VPS_USER}@${VPS_IP} 'pm2 logs'"
Write-Host ""

