# ================================================================
# Deploy Next.js App to Hostinger VPS (PowerShell version)
# This script uses Hostinger API (via MCP) and SSH for deployment
# ================================================================

# Configuration
$VPS_IP = "168.231.87.171"  # From your Hostinger VPS API response
$VPS_USER = "root"  # Change if you use a different user
$APP_DIR = "/var/www/zaytoonz-ngo"
$SSH_KEY = ""  # Path to your SSH key (optional)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying Zaytoonz NGO to Hostinger VPS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Build the application locally first
Write-Host "📦 Building application locally..." -ForegroundColor Blue
npm run build
Write-Host "✓ Build complete" -ForegroundColor Green
Write-Host ""

# Create deployment archive (excluding node_modules and .next)
Write-Host "📦 Creating deployment archive..." -ForegroundColor Blue

# Use 7-Zip or tar if available on Windows
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar --exclude='node_modules' `
        --exclude='.next' `
        --exclude='.git' `
        --exclude='.env.local' `
        --exclude='.env' `
        -czf deploy.tar.gz .
} elseif (Get-Command 7z -ErrorAction SilentlyContinue) {
    # Alternative: use 7-Zip
    $excludeFiles = @('node_modules', '.next', '.git', '.env.local', '.env')
    Get-ChildItem -Exclude $excludeFiles | Compress-Archive -DestinationPath deploy.zip -Force
    Write-Host "⚠️  Created deploy.zip (please extract manually on VPS)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error: tar or 7z not found. Please install one of them." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Archive created" -ForegroundColor Green
Write-Host ""

# Deploy to VPS using SSH
Write-Host "🚀 Deploying to Hostinger VPS ($VPS_IP)..." -ForegroundColor Blue
Write-Host ""

# Note: You'll need to use an SSH client like OpenSSH (built into Windows 10+) or PuTTY
Write-Host "📤 To complete deployment, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Upload the archive:" -ForegroundColor Cyan
if ($SSH_KEY) {
    Write-Host "   scp -i $SSH_KEY deploy.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/" -ForegroundColor White
} else {
    Write-Host "   scp deploy.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/" -ForegroundColor White
}

Write-Host ""
Write-Host "2. SSH into the VPS and run:" -ForegroundColor Cyan
Write-Host "   ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor White
Write-Host ""
Write-Host "3. Then on the VPS, run:" -ForegroundColor Cyan
$deployCommands = @"
   cd /var/www/zaytoonz-ngo
   tar -xzf /tmp/deploy.tar.gz
   npm install --production
   npm run build
   pm2 restart zaytoonz-ngo || pm2 start npm --name zaytoonz-ngo -- start
   pm2 save
"@
Write-Host $deployCommands -ForegroundColor White
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment script ready!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

