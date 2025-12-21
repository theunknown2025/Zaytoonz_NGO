# PowerShell script to deploy Next.js app to Hostinger /Test subdirectory
# Usage: .\deploy-to-test-subdirectory.ps1

Write-Host "🚀 Deploying Zaytoonz NGO to /Test subdirectory..." -ForegroundColor Cyan

# Set base path
$env:NEXT_PUBLIC_BASE_PATH = "/Test"
Write-Host "✓ Base path set to /Test" -ForegroundColor Green

# Build the application
Write-Host "`n📦 Building Next.js application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully" -ForegroundColor Green

# Create deployment package
Write-Host "`n📦 Creating deployment package..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "zaytoonz-test-deploy_$timestamp.zip"

# Files and folders to include
$itemsToInclude = @(
    ".next",
    "public",
    "package.json",
    "package-lock.json",
    "server.js",
    "next.config.js"
)

# Create temporary directory
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }

Write-Host "Copying files to temporary directory..." -ForegroundColor Yellow

foreach ($item in $itemsToInclude) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempDir -Recurse -Force
        Write-Host "  ✓ $item" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ $item not found (skipping)" -ForegroundColor Yellow
    }
}

# Create .env.local template if it doesn't exist
$envTemplate = @"
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/Test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here

# Environment
NODE_ENV=production
PORT=3001

# Add your other environment variables here
"@

Set-Content -Path "$tempDir\.env.local.template" -Value $envTemplate
Write-Host "  ✓ Created .env.local.template" -ForegroundColor Gray

# Create README for deployment
$readme = @"
# Deployment Instructions

1. Upload all files in this archive to: public_html/Test/

2. Create .env.local file with your actual environment variables:
   - Copy .env.local.template to .env.local
   - Fill in your actual values

3. Install dependencies:
   cd public_html/Test
   npm install --production

4. Start the application:
   - Using PM2: pm2 start server.js --name zaytoonz-test
   - Or using Hostinger Node.js manager in hPanel

5. Configure your domain/hosting to route /Test to this application

Access your app at: https://zaytoonz.com/Test
"@

Set-Content -Path "$tempDir\DEPLOYMENT_README.txt" -Value $readme
Write-Host "  ✓ Created deployment README" -ForegroundColor Gray

# Create zip archive
Write-Host "`n📦 Creating ZIP archive..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $archiveName -Force

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "`n✅ Deployment package created: $archiveName" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload $archiveName to your Hostinger hosting" -ForegroundColor White
Write-Host "2. Extract to public_html/Test/" -ForegroundColor White
Write-Host "3. Create .env.local with your environment variables" -ForegroundColor White
Write-Host "4. Install dependencies: npm install --production" -ForegroundColor White
Write-Host "5. Start the app using PM2 or Hostinger Node.js manager" -ForegroundColor White
Write-Host "`n📖 See DEPLOYMENT_README.txt in the archive for detailed instructions" -ForegroundColor Yellow

