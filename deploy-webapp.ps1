# Web App Deployment Script for Windows
# This script deploys ONLY the Next.js web application (no Scraper, no NLWEB)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Zaytoonz NGO - Web App Only Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to stop existing containers
function Stop-ExistingContainers {
    Write-Host "[1/5] Checking for existing containers..." -ForegroundColor Yellow
    
    $containers = @("zaytoonz-nextjs", "zaytoonz-nginx", "zaytoonz-certbot", "zaytoonz-scraper", "zaytoonz-nlweb")
    
    foreach ($container in $containers) {
        $exists = docker ps -a --filter "name=$container" --format "{{.Names}}" 2>$null
        if ($exists) {
            Write-Host "  → Stopping and removing $container..." -ForegroundColor Gray
            docker stop $container 2>$null | Out-Null
            docker rm $container 2>$null | Out-Null
        }
    }
    
    Write-Host "  ✓ Cleanup complete" -ForegroundColor Green
    Write-Host ""
}

# Function to create required directories
function New-RequiredDirectories {
    Write-Host "[2/5] Creating required directories..." -ForegroundColor Yellow
    
    $directories = @(
        "certbot\conf",
        "certbot\www"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  → Created $dir" -ForegroundColor Gray
        }
    }
    
    Write-Host "  ✓ Directories ready" -ForegroundColor Green
    Write-Host ""
}

# Function to check environment variables
function Test-EnvironmentVariables {
    Write-Host "[3/5] Checking environment variables..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Write-Host "  ⚠ Warning: .env file not found" -ForegroundColor Red
        Write-Host "  → Creating .env from template..." -ForegroundColor Gray
        
        if (Test-Path "webapp-env-vars.txt") {
            Copy-Item "webapp-env-vars.txt" ".env"
            Write-Host "  → Please edit .env file and add your OpenAI API key" -ForegroundColor Yellow
            Write-Host "  → Press any key to continue after editing .env..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        else {
            Write-Host "  ⚠ Error: webapp-env-vars.txt template not found!" -ForegroundColor Red
            return $false
        }
    }
    
    # Check if OpenAI API key is configured
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "YOUR_OPENAI_API_KEY_HERE") {
        Write-Host "  ⚠ Warning: OpenAI API key not configured in .env file" -ForegroundColor Red
        Write-Host "  → Please edit .env and replace YOUR_OPENAI_API_KEY_HERE" -ForegroundColor Yellow
        
        $continue = Read-Host "  Continue anyway? (y/N)"
        if ($continue -ne "y") {
            return $false
        }
    }
    
    Write-Host "  ✓ Environment variables configured" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Function to check required files
function Test-RequiredFiles {
    Write-Host "[4/5] Checking required files..." -ForegroundColor Yellow
    
    $requiredFiles = @(
        "docker-compose-webapp.yml",
        "nginx-webapp.conf",
        "package.json"
    )
    
    $missing = @()
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missing += $file
            Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        }
        else {
            Write-Host "  ✓ Found: $file" -ForegroundColor Gray
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "  ⚠ Error: Missing required files!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "  ✓ All required files present" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Function to deploy the web app
function Start-WebAppDeployment {
    Write-Host "[5/5] Deploying web application..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Pull latest images
        Write-Host "  → Pulling Docker images..." -ForegroundColor Gray
        docker-compose -f docker-compose-webapp.yml pull
        
        # Build and start containers
        Write-Host "  → Starting containers..." -ForegroundColor Gray
        docker-compose -f docker-compose-webapp.yml up -d --build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "  ✓ Deployment successful!" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host ""
            Write-Host "  ✗ Deployment failed!" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host ""
        Write-Host "  ✗ Error during deployment: $_" -ForegroundColor Red
        return $false
    }
}

# Function to show container status
function Show-ContainerStatus {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   Container Status" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    docker ps --filter "name=zaytoonz" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host ""
}

# Function to show logs
function Show-DeploymentLogs {
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   Viewing Logs (Press Ctrl+C to exit)" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $viewLogs = Read-Host "View container logs? (Y/n)"
    if ($viewLogs -ne "n") {
        docker-compose -f docker-compose-webapp.yml logs -f
    }
}

# Function to show access information
function Show-AccessInfo {
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   Access Information" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "  Local Access:" -ForegroundColor Yellow
    Write-Host "    http://localhost" -ForegroundColor White
    Write-Host "    http://localhost:3000 (Direct Next.js)" -ForegroundColor White
    Write-Host ""
    
    # Try to get external IP
    try {
        $externalIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
        Write-Host "  External Access:" -ForegroundColor Yellow
        Write-Host "    http://$externalIP" -ForegroundColor White
        Write-Host ""
    }
    catch {
        Write-Host "  External IP: Unable to determine" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "  Useful Commands:" -ForegroundColor Yellow
    Write-Host "    View logs:           docker-compose -f docker-compose-webapp.yml logs -f" -ForegroundColor White
    Write-Host "    Stop containers:     docker-compose -f docker-compose-webapp.yml down" -ForegroundColor White
    Write-Host "    Restart containers:  docker-compose -f docker-compose-webapp.yml restart" -ForegroundColor White
    Write-Host "    View status:         docker ps" -ForegroundColor White
    Write-Host ""
}

# Main execution
try {
    # Check if Docker is running
    if (-not (Test-DockerRunning)) {
        Write-Host "⚠ Error: Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        exit 1
    }
    
    # Stop existing containers
    Stop-ExistingContainers
    
    # Create required directories
    New-RequiredDirectories
    
    # Check environment variables
    if (-not (Test-EnvironmentVariables)) {
        Write-Host ""
        Write-Host "⚠ Deployment aborted: Please configure environment variables" -ForegroundColor Red
        exit 1
    }
    
    # Check required files
    if (-not (Test-RequiredFiles)) {
        Write-Host ""
        Write-Host "⚠ Deployment aborted: Missing required files" -ForegroundColor Red
        exit 1
    }
    
    # Deploy the web app
    if (Start-WebAppDeployment) {
        # Wait a moment for containers to start
        Start-Sleep -Seconds 3
        
        # Show container status
        Show-ContainerStatus
        
        # Show access information
        Show-AccessInfo
        
        # Offer to show logs
        Show-DeploymentLogs
    }
    else {
        Write-Host ""
        Write-Host "⚠ Deployment failed! Check the logs above for errors." -ForegroundColor Red
        Write-Host ""
        Write-Host "You can view logs with:" -ForegroundColor Yellow
        Write-Host "  docker-compose -f docker-compose-webapp.yml logs" -ForegroundColor White
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "⚠ An unexpected error occurred: $_" -ForegroundColor Red
    exit 1
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
