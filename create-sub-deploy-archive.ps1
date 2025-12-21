# PowerShell script to create sub-deploy-vps.tar.gz archive
# This creates a deployment package for the /test subdirectory
# Usage: .\create-sub-deploy-archive.ps1

Write-Host "📦 Creating VPS Deployment Archive for /test subdirectory..." -ForegroundColor Cyan
Write-Host ""

# Set base path for build
$env:NEXT_PUBLIC_BASE_PATH = "/test"

# Build the application first
Write-Host "🔨 Building Next.js application with basePath=/test..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Create temporary directory for packaging
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow

# Files and directories to include
$itemsToInclude = @(
    ".next",
    "public",
    "server.js",
    "next.config.js",
    "package.json",
    "package-lock.json",
    "ecosystem.test.config.js"
)

# Copy files
foreach ($item in $itemsToInclude) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            Copy-Item -Path $item -Destination $tempDir -Recurse -Force
        } else {
            Copy-Item -Path $item -Destination $tempDir -Force
        }
        Write-Host "  ✓ $item" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ $item not found (skipping)" -ForegroundColor Yellow
    }
}

# Copy nginx config template
if (Test-Path "guidelines\nginx-test-subdirectory.conf") {
    Copy-Item -Path "guidelines\nginx-test-subdirectory.conf" -Destination $tempDir -Force
    Write-Host "  ✓ nginx-test-subdirectory.conf" -ForegroundColor Gray
}

# Create .env.local template
$envTemplate = @'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here

# Environment
NODE_ENV=production
PORT=3001

# Add your other environment variables here
# OPENAI_API_KEY=your_key_here
'@

Set-Content -Path "$tempDir\.env.local.template" -Value $envTemplate
Write-Host "  ✓ .env.local.template" -ForegroundColor Gray

# Create deployment README
$readme = @'
# Deployment Instructions

## Quick Deploy

1. Upload both files to your VPS /tmp/ directory:
   - sub-deploy-vps.tar.gz
   - vps-deploy-sub.sh

2. SSH into your VPS:
   ssh root@168.231.87.171

3. Make script executable and run:
   chmod +x /tmp/vps-deploy-sub.sh
   bash /tmp/vps-deploy-sub.sh

## Manual Steps (if needed)

1. Extract archive:
   cd /var/www/zaytoonz-ngo
   tar -xzf /tmp/sub-deploy-vps.tar.gz

2. Install dependencies:
   npm install --production

3. Configure environment:
   cp .env.local.template .env.local
   nano .env.local  # Edit with your actual values

4. Start with PM2:
   pm2 start ecosystem.test.config.js
   pm2 save

5. Configure Nginx:
   - Edit nginx-test-subdirectory.conf
   - Copy to /etc/nginx/sites-available/zaytoonz-ngo
   - Update path to your 'Coming Soon' page
   - Test: nginx -t
   - Reload: systemctl reload nginx

## Access

Your app will be available at: https://zaytoonz.com/test

## Troubleshooting

- Check PM2: pm2 status zaytoonz-test
- View logs: pm2 logs zaytoonz-test
- Test locally: curl http://localhost:3001/test
'@

Set-Content -Path "$tempDir\DEPLOYMENT_README.txt" -Value $readme
Write-Host "  ✓ DEPLOYMENT_README.txt" -ForegroundColor Gray

# Create archive using tar (if available) or 7zip
Write-Host ""
Write-Host "📦 Creating tar.gz archive..." -ForegroundColor Yellow

$archiveName = "sub-deploy-vps.tar.gz"

# Try using tar (Windows 10+ has tar)
try {
    # Change to temp directory to create archive with correct paths
    Push-Location $tempDir
    tar -czf "$PWD\..\$archiveName" *
    Pop-Location
    
    # Move archive to current directory
    Move-Item -Path "$tempDir\..\$archiveName" -Destination $archiveName -Force
    
    Write-Host "✓ Archive created: $archiveName" -ForegroundColor Green
} catch {
    Write-Host "⚠ tar command not available. Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use 7zip if available
    if (Get-Command 7z -ErrorAction SilentlyContinue) {
        Push-Location $tempDir
        7z a -ttar "$PWD\..\sub-deploy-vps.tar" *
        7z a -tgzip "$PWD\..\$archiveName" "$PWD\..\sub-deploy-vps.tar"
        Remove-Item "$PWD\..\sub-deploy-vps.tar"
        Pop-Location
        Move-Item -Path "$tempDir\..\$archiveName" -Destination $archiveName -Force
        Write-Host "✓ Archive created using 7zip: $archiveName" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot create tar.gz archive. Please install tar or 7zip." -ForegroundColor Red
        Write-Host "   You can manually create the archive from: $tempDir" -ForegroundColor Yellow
        exit 1
    }
}

# Get file size
$fileSize = (Get-Item $archiveName).Length / 1MB
Write-Host "  Archive size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force

Write-Host ""
Write-Host "✅ Deployment package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Files created:" -ForegroundColor Cyan
Write-Host "  1. $archiveName - Deployment archive" -ForegroundColor White
Write-Host "  2. vps-deploy-sub.sh - Deployment script" -ForegroundColor White
Write-Host ""
Write-Host "📤 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload both files to your VPS /tmp/ directory using WinSCP" -ForegroundColor White
Write-Host "  2. SSH into your VPS: ssh root@168.231.87.171" -ForegroundColor White
Write-Host "  3. Run: chmod +x /tmp/vps-deploy-sub.sh" -ForegroundColor White
Write-Host "  4. Run: bash /tmp/vps-deploy-sub.sh" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to deploy!" -ForegroundColor Green

