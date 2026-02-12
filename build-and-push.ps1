# Build and Push Docker Image for Hostinger Deployment
# This script builds your Next.js app into a Docker image and pushes it to Docker Hub

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Build & Push to Docker Hub" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get Docker Hub username
$dockerUsername = Read-Host "Enter your Docker Hub username"

if ([string]::IsNullOrWhiteSpace($dockerUsername)) {
    Write-Host "Error: Docker Hub username is required!" -ForegroundColor Red
    Write-Host "Create a free account at https://hub.docker.com" -ForegroundColor Yellow
    exit 1
}

$imageName = "$dockerUsername/zaytoonz-webapp:latest"

Write-Host ""
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "  ✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[2/5] Building Docker image..." -ForegroundColor Yellow
Write-Host "  Image: $imageName" -ForegroundColor Gray
Write-Host "  This will take 2-5 minutes..." -ForegroundColor Gray
Write-Host ""

# Build the Docker image
docker build -f Dockerfile.webapp -t $imageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ✓ Build successful!" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Logging into Docker Hub..." -ForegroundColor Yellow
Write-Host "  Please enter your Docker Hub password when prompted" -ForegroundColor Gray
Write-Host ""

# Login to Docker Hub
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ✗ Login failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ✓ Login successful!" -ForegroundColor Green

Write-Host ""
Write-Host "[4/5] Pushing image to Docker Hub..." -ForegroundColor Yellow
Write-Host "  This will take 1-3 minutes..." -ForegroundColor Gray
Write-Host ""

# Push the image
docker push $imageName

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ✗ Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ✓ Push successful!" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Updating docker-compose-webapp.yml..." -ForegroundColor Yellow

# Update docker-compose-webapp.yml
$composeFile = "docker-compose-webapp.yml"
if (Test-Path $composeFile) {
    $content = Get-Content $composeFile -Raw
    $content = $content -replace 'image: yourusername/zaytoonz-webapp:latest', "image: $imageName"
    $content = $content -replace 'image: [a-zA-Z0-9_-]+/zaytoonz-webapp:latest', "image: $imageName"
    Set-Content $composeFile $content
    Write-Host "  ✓ Updated $composeFile" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Warning: $composeFile not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SUCCESS!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Docker image is now available at:" -ForegroundColor Yellow
Write-Host "  $imageName" -ForegroundColor White
Write-Host ""
Write-Host "Next steps for Hostinger:" -ForegroundColor Yellow
Write-Host "  1. Copy docker-compose-webapp.yml (it's been updated)" -ForegroundColor White
Write-Host "  2. Paste into Hostinger's Docker Compose YAML editor" -ForegroundColor White
Write-Host "  3. Add your environment variables" -ForegroundColor White
Write-Host "  4. Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "The image will be pulled from Docker Hub automatically!" -ForegroundColor Green
Write-Host ""
