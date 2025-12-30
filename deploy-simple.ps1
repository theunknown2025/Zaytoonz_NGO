# Simple deployment script with password authentication
# This script uses your local config file for credentials

# Load local config
$configFile = Join-Path $PSScriptRoot "deploy-config.local.ps1"
if (Test-Path $configFile) {
    . $configFile
} else {
    Write-Host "[ERROR] deploy-config.local.ps1 not found!" -ForegroundColor Red
    Write-Host "Please create it from deploy-config.local.ps1.example" -ForegroundColor Yellow
    exit 1
}

$VPS_IP = $script:VPS_IP
$VPS_USER = $script:VPS_USER
$VPS_PASSWORD = $script:VPS_PASSWORD

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Zaytoonz NGO - Quick Deploy to /test" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Build locally
Write-Host "[*] Building application..." -ForegroundColor Cyan
$env:NEXT_PUBLIC_BASE_PATH = "/test"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Build completed" -ForegroundColor Green
Write-Host ""

# Create deployment script
$deployScript = @'
#!/bin/bash
set -e
cd /var/www/zaytoonz || { mkdir -p /var/www && cd /var/www && git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz && cd zaytoonz; }
git fetch origin
git reset --hard origin/main
export NEXT_PUBLIC_BASE_PATH=/test
npm install --production
npm run build
pm2 delete zaytoonz-test 2>/dev/null || true
if [ -f ecosystem.test.config.js ]; then
    pm2 start ecosystem.test.config.js
else
    PORT=3001 pm2 start server.js --name zaytoonz-test --update-env
fi
pm2 save
echo "[SUCCESS] Deployment complete! Access at: https://zaytoonz.com/test"
'@

# Write to temp file
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline

Write-Host "[*] Connecting to VPS and deploying..." -ForegroundColor Cyan

# Use Plink (PuTTY) if available, otherwise use ssh with expect-like approach
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue

if ($plinkPath) {
    Write-Host "[*] Using Plink for authentication..." -ForegroundColor Gray
    # Upload script using PowerShell-compatible method
    echo y | & $plinkPath -ssh -pw $VPS_PASSWORD $VPS_USER@$VPS_IP "mkdir -p /tmp" 2>&1 | Out-Null
    
    # Upload file content using Get-Content and pipe to plink
    $fileContent = Get-Content $tempScript -Raw
    $fileContent | & $plinkPath -ssh -pw $VPS_PASSWORD $VPS_USER@$VPS_IP "cat > /tmp/deploy-test.sh" 2>&1 | Out-Null
    
    # Execute
    $execCmd = "chmod +x /tmp/deploy-test.sh; bash /tmp/deploy-test.sh"
    & $plinkPath -ssh -pw $VPS_PASSWORD $VPS_USER@$VPS_IP $execCmd
} else {
    # Use ssh with password via here-string (requires sshpass or manual entry)
    Write-Host "[*] Using SSH (you may be prompted for password)..." -ForegroundColor Yellow
    Write-Host "[*] Password: $VPS_PASSWORD" -ForegroundColor Gray
    
    # Upload script first using Get-Content
    Write-Host "[*] Uploading deployment script..." -ForegroundColor Cyan
    $uploadCmd = "cat > /tmp/deploy-test.sh"
    Get-Content $tempScript -Raw | ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP $uploadCmd
    
    # Execute deployment
    Write-Host "[*] Running deployment..." -ForegroundColor Cyan
    $command = "chmod +x /tmp/deploy-test.sh; bash /tmp/deploy-test.sh"
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP $command
}

# Cleanup
Remove-Item $tempScript -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[SUCCESS] Deployment process completed!" -ForegroundColor Green
Write-Host ""
$appUrl = 'https://zaytoonz.com/test'
Write-Host "Access your app at: $appUrl" -ForegroundColor Cyan
Write-Host ""

