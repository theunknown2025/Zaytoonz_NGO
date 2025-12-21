# ================================================================
# Complete Deployment Script for Zaytoonz NGO to Hostinger VPS
# Includes Next.js App + Python Scraper with Full Configuration
# Windows PowerShell Version
# ================================================================

param(
    [string]$VPS_IP = "168.231.87.171",
    [string]$VPS_USER = "root",
    [string]$APP_DIR = "/var/www/zaytoonz-ngo",
    [string]$SSH_KEY = ""
)

# Colors
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "▶ $args" -ForegroundColor Blue }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Header { Write-Host "$args" -ForegroundColor Magenta }

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Header "🚀 Zaytoonz NGO Complete Deployment to Hostinger VPS"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Info "📦 Target: $VPS_IP"
Write-Info "📁 App Directory: $APP_DIR"
Write-Info "🐍 Python Scraper: Included"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Confirm deployment
Write-Warning "This will deploy your application to production."
Write-Warning "Make sure you have committed all your changes to git."
$confirmation = Read-Host "Continue? (y/n)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Warning "Deployment cancelled."
    exit 0
}

# Step 1: Build the application
Write-Info "Building Next.js application..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}
Write-Success "Build complete"
Write-Host ""

# Step 2: Create deployment archive
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveName = "zaytoonz-deploy-$timestamp.tar.gz"

Write-Info "Creating deployment archive..."

# Check if tar is available (Windows 10+)
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar --exclude='node_modules' `
        --exclude='.next' `
        --exclude='.git' `
        --exclude='.env' `
        --exclude='.env.local' `
        --exclude='Scrape_Master/venv' `
        --exclude='app/admin/Scrape_Master/venv' `
        --exclude='**/__pycache__' `
        --exclude='**/*.pyc' `
        --exclude='.DS_Store' `
        --exclude='*.log' `
        -czf $archiveName .
    
    Write-Success "Archive created: $archiveName"
} else {
    Write-Error "tar command not found. Please install Git for Windows or use WSL."
    exit 1
}
Write-Host ""

# Step 3: Upload to VPS
Write-Info "Uploading to VPS..."
if ($SSH_KEY) {
    scp -i $SSH_KEY $archiveName "${VPS_USER}@${VPS_IP}:/tmp/"
} else {
    scp $archiveName "${VPS_USER}@${VPS_IP}:/tmp/"
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Upload failed!"
    Remove-Item $archiveName
    exit 1
}
Write-Success "Upload complete"
Write-Host ""

# Step 4: Deploy on VPS
Write-Info "Deploying on VPS..."

$sshScript = @"
set -e

echo "================================================================"
echo "🔧 VPS Deployment Steps"
echo "================================================================"

# Create app directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Backup current version
if [ -d ".next" ]; then
    echo "📦 Backing up current version..."
    BACKUP_FILE="/tmp/zaytoonz-backup-\`$(date +%Y%m%d-%H%M%S)\`.tar.gz"
    tar -czf "\$BACKUP_FILE" . 2>/dev/null || true
    echo "✓ Backup saved: \$BACKUP_FILE"
fi

# Extract new version
echo "📥 Extracting new version..."
tar -xzf /tmp/$archiveName -C $APP_DIR
echo "✓ Files extracted"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production
echo "✓ Node.js dependencies installed"

# Build Next.js
echo "🔨 Building Next.js application..."
npm run build
echo "✓ Next.js build complete"

# Setup Python environment
echo ""
echo "================================================================"
echo "🐍 Setting up Python Scraper"
echo "================================================================"

cd $APP_DIR/Scrape_Master

# Install system dependencies
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv python3-dev build-essential 2>/dev/null || true

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
playwright install --with-deps chromium 2>/dev/null || true
echo "✓ Python dependencies installed"

# Create .env files
cd $APP_DIR

if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

NODE_ENV=production
PORT=3000
EOF
    echo "✓ .env.local created"
fi

# Copy ecosystem config
if [ -f "ecosystem.production.config.js" ]; then
    cp ecosystem.production.config.js ecosystem.config.js
fi

echo ""
echo "================================================================"
echo "🔄 Restarting Services with PM2"
echo "================================================================"

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop and restart services
pm2 delete zaytoonz-ngo 2>/dev/null || true
pm2 delete python-scraper 2>/dev/null || true

if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start npm --name "zaytoonz-ngo" -- start
    cd $APP_DIR/Scrape_Master
    pm2 start venv/bin/uvicorn --name "python-scraper" -- api_wrapper:app --host 0.0.0.0 --port 8000
fi

pm2 save
pm2 startup systemd -u $VPS_USER --hp /root 2>/dev/null || true

echo ""
echo "================================================================"
echo "📊 Service Status"
echo "================================================================"
pm2 status

echo ""
echo "================================================================"
echo "✅ Deployment Complete!"
echo "================================================================"
"@

if ($SSH_KEY) {
    $sshScript | ssh -i $SSH_KEY "${VPS_USER}@${VPS_IP}" bash
} else {
    $sshScript | ssh "${VPS_USER}@${VPS_IP}" bash
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed!"
    Remove-Item $archiveName
    exit 1
}

Write-Success "Deployment complete!"
Write-Host ""

# Clean up
Remove-Item $archiveName
Write-Success "Cleaned up local deployment archive"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Success "Deployment Successful!"
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URL: http://${VPS_IP}:3000" -ForegroundColor Cyan
Write-Host "🐍 Scraper API: http://${VPS_IP}:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update API keys in $APP_DIR/.env.local"
Write-Host "2. Update API keys in $APP_DIR/Scrape_Master/.env"
Write-Host "3. Test the admin scraper at: http://${VPS_IP}:3000/admin/Scraper"
Write-Host ""

