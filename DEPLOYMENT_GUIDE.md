# Hostinger VPS Deployment Guide - Zaytoonz NGO

Complete step-by-step guide for deploying the Zaytoonz NGO web application to Hostinger VPS using Docker, GitHub, and terminal commands.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [SSH Key Setup](#ssh-key-setup)
3. [VPS Initial Configuration](#vps-initial-configuration)
4. [First-Time Deployment](#first-time-deployment)
5. [Regular Deployment](#regular-deployment)
6. [GitHub Actions Setup](#github-actions-setup)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Backup and Recovery](#backup-and-recovery)

---

## Prerequisites

### Required Information

- **VPS IP Address**: `168.231.87.171` (or your Hostinger VPS IP)
- **VPS Username**: Usually `root` for Hostinger VPS
- **GitHub Repository**: `https://github.com/theunknown2025/Zaytoonz_NGO.git`
- **Domain Name** (optional): Your domain pointing to the VPS IP

### Required Software on Local Machine

- **Git**: For version control
- **SSH Client**: Usually pre-installed on Linux/Mac, or use PuTTY/WSL on Windows
- **Terminal/Command Line**: PowerShell (Windows), Terminal (Mac/Linux), or WSL

### VPS Requirements

- **OS**: Ubuntu 20.04+ or Debian 10+ (recommended)
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Public IP address with ports 80, 443, 22 open

---

## SSH Key Setup

### Step 1: Generate SSH Key Pair (if you don't have one)

**On Windows (PowerShell):**
```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com" -f $HOME\.ssh\id_ed25519_vps

# If ed25519 is not supported, use RSA
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f $HOME\.ssh\id_rsa_vps
```

**On Linux/Mac:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_vps

# If ed25519 is not supported, use RSA
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa_vps
```

**Note**: Press Enter when prompted for passphrase (or set one for extra security).

### Step 2: Copy Public Key to VPS

**Method 1: Using ssh-copy-id (Linux/Mac/WSL)**
```bash
ssh-copy-id -i ~/.ssh/id_ed25519_vps.pub root@168.231.87.171
```

**Method 2: Manual Copy (Windows/All)**
```powershell
# On Windows (PowerShell)
type $HOME\.ssh\id_ed25519_vps.pub | ssh root@168.231.87.171 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# On Linux/Mac
cat ~/.ssh/id_ed25519_vps.pub | ssh root@168.231.87.171 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Method 3: Manual Steps**
1. Display your public key:
   ```powershell
   # Windows
   type $HOME\.ssh\id_ed25519_vps.pub
   
   # Linux/Mac
   cat ~/.ssh/id_ed25519_vps.pub
   ```
2. SSH into VPS with password:
   ```bash
   ssh root@168.231.87.171
   ```
3. On VPS, run:
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```

### Step 3: Test SSH Connection

```bash
# Test connection (Windows - specify key path)
ssh -i $HOME\.ssh\id_ed25519_vps root@168.231.87.171

# Test connection (Linux/Mac)
ssh -i ~/.ssh/id_ed25519_vps root@168.231.87.171
```

If successful, you should connect without entering a password.

### Step 4: Configure SSH Config (Optional but Recommended)

Create/edit `~/.ssh/config` (Windows: `$HOME\.ssh\config`):

```
Host hostinger-vps
    HostName 168.231.87.171
    User root
    IdentityFile ~/.ssh/id_ed25519_vps
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Now you can connect with:
```bash
ssh hostinger-vps
```

---

## VPS Initial Configuration

### Step 1: Connect to VPS

```bash
ssh root@168.231.87.171
# Or if you configured SSH config:
ssh hostinger-vps
```

### Step 2: Run Initial Setup Script

**Option A: Upload and Run Setup Script**

On your local machine:
```bash
# Upload setup script
scp scripts/setup-vps.sh root@168.231.87.171:/tmp/

# SSH into VPS
ssh root@168.231.87.171

# Run setup script
chmod +x /tmp/setup-vps.sh
/tmp/setup-vps.sh
```

**Option B: Manual Setup**

Run these commands on the VPS:

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install required packages
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create application directory
mkdir -p /var/www/zaytoonz-ngo
mkdir -p /var/backups/zaytoonz-ngo

# Set permissions
chown -R root:root /var/www/zaytoonz-ngo
chown -R root:root /var/backups/zaytoonz-ngo
```

### Step 3: Verify Setup

```bash
# Check Docker
docker ps

# Check Docker Compose
docker-compose --version

# Check firewall
ufw status

# Check disk space
df -h
```

---

## First-Time Deployment

### Step 1: Clone Repository on VPS

```bash
# SSH into VPS
ssh root@168.231.87.171

# Navigate to application directory
cd /var/www/zaytoonz-ngo

# Clone repository (if not already cloned)
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git .

# Or if directory exists, pull latest
git pull origin main
```

### Step 2: Configure Environment Variables

```bash
# On VPS
cd /var/www/zaytoonz-ngo

# Copy example environment file
cp .env.production.example .env

# Edit environment file
nano .env
# Or use vi: vi .env
```

**Required Environment Variables:**

```bash
# Node.js Configuration
NODE_ENV=production
PORT=3000

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# NLWeb Configuration (Optional)
NLWEB_URL=http://nlweb:8000
```

**Save and exit:**
- Nano: `Ctrl+X`, then `Y`, then `Enter`
- Vi: Press `Esc`, type `:wq`, then `Enter`

### Step 3: Run Deployment Script

**Option A: Use Automated Script**

```bash
# On VPS
cd /var/www/zaytoonz-ngo
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Option B: Manual Deployment**

```bash
# On VPS
cd /var/www/zaytoonz-ngo

# Stop any existing services
docker-compose -f docker-compose.production.yml down || true

# Build and start services
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Step 4: Verify Deployment

```bash
# Check all services are running
docker-compose -f docker-compose.production.yml ps

# Check service health
./scripts/health-check.sh

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:8000/health
```

### Step 5: Configure Domain and SSL (Optional)

If you have a domain:

1. **Point domain to VPS IP**: Update DNS A record to point to `168.231.87.171`

2. **Update Nginx configuration** with your domain name

3. **Obtain SSL certificate**:
   ```bash
   # On VPS
   docker-compose -f docker-compose.production.yml run --rm certbot certonly \
     --webroot \
     --webroot-path=/var/www/certbot \
     --email your-email@example.com \
     --agree-tos \
     --no-eff-email \
     -d yourdomain.com \
     -d www.yourdomain.com
   ```

4. **Update Nginx config** to use SSL certificates

5. **Restart services**:
   ```bash
   docker-compose -f docker-compose.production.yml restart nginx
   ```

---

## Regular Deployment

### Method 1: Using GitHub Actions (Recommended)

Once configured (see [GitHub Actions Setup](#github-actions-setup)), simply push to main branch:

```bash
# On local machine
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Actions will automatically deploy to VPS.

### Method 2: Manual Deployment via Terminal

**On Local Machine:**

```bash
# Push changes to GitHub
git add .
git commit -m "Your commit message"
git push origin main
```

**On VPS:**

```bash
# SSH into VPS
ssh root@168.231.87.171

# Navigate to application directory
cd /var/www/zaytoonz-ngo

# Pull latest changes
git pull origin main

# Run deployment script
./scripts/deploy.sh

# Or manually:
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
./scripts/health-check.sh
```

### Method 3: Using Deployment Script from Local Machine

```bash
# On local machine (Windows PowerShell)
.\scripts\deploy.sh

# On local machine (Linux/Mac)
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## GitHub Actions Setup

### Step 1: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **VPS_HOST**: `168.231.87.171`
2. **VPS_USER**: `root`
3. **VPS_SSH_PRIVATE_KEY**: Your private SSH key (entire content of `~/.ssh/id_ed25519_vps` or `id_rsa_vps`)
4. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase URL
5. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon key

**To get your private key:**

**Windows (PowerShell):**
```powershell
type $HOME\.ssh\id_ed25519_vps
```

**Linux/Mac:**
```bash
cat ~/.ssh/id_ed25519_vps
```

**Important**: Copy the entire output including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

### Step 2: Test GitHub Actions

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab
4. Watch the deployment workflow run
5. Check logs if any step fails

### Step 3: Verify Deployment

After GitHub Actions completes:

```bash
# SSH into VPS
ssh root@168.231.87.171

# Check services
cd /var/www/zaytoonz-ngo
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs --tail=50
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. SSH Connection Refused

**Problem**: Cannot connect to VPS via SSH

**Solutions**:
```bash
# Check if SSH service is running on VPS
ssh root@168.231.87.171 "systemctl status ssh"

# Check firewall
ssh root@168.231.87.171 "ufw status"

# Verify port 22 is open
ssh root@168.231.87.171 "netstat -tlnp | grep :22"
```

#### 2. Docker Build Fails

**Problem**: Docker build errors during deployment

**Solutions**:
```bash
# Check Docker logs
docker-compose -f docker-compose.production.yml logs

# Check disk space
df -h

# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

#### 3. Services Not Starting

**Problem**: Containers exit immediately after starting

**Solutions**:
```bash
# Check container logs
docker-compose -f docker-compose.production.yml logs nextjs
docker-compose -f docker-compose.production.yml logs python-scraper

# Check environment variables
docker-compose -f docker-compose.production.yml config

# Verify .env file exists and has correct values
cat .env

# Check port conflicts
netstat -tlnp | grep -E ':(3000|8000|80|443)'
```

#### 4. Next.js Build Fails

**Problem**: `npm run build` fails

**Solutions**:
```bash
# Check Node.js version (should be 20+)
node --version

# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env | grep NEXT_PUBLIC

# Try building with verbose output
npm run build -- --debug
```

#### 5. Python Scraper Not Working

**Problem**: Scraper API returns errors

**Solutions**:
```bash
# Check scraper logs
docker-compose -f docker-compose.production.yml logs python-scraper

# Check if Playwright is installed
docker-compose -f docker-compose.production.yml exec python-scraper playwright --version

# Reinstall Playwright browsers
docker-compose -f docker-compose.production.yml exec python-scraper playwright install chromium

# Check Python dependencies
docker-compose -f docker-compose.production.yml exec python-scraper pip list
```

#### 6. Nginx Not Serving Content

**Problem**: Cannot access application via browser

**Solutions**:
```bash
# Check Nginx logs
docker-compose -f docker-compose.production.yml logs nginx

# Test Nginx configuration
docker-compose -f docker-compose.production.yml exec nginx nginx -t

# Check if Nginx can reach backend
docker-compose -f docker-compose.production.yml exec nginx ping nextjs

# Verify ports are exposed
docker-compose -f docker-compose.production.yml ps
```

#### 7. Out of Memory Errors

**Problem**: Services crash due to memory issues

**Solutions**:
```bash
# Check memory usage
free -h

# Check Docker memory limits
docker stats

# Reduce resource limits in docker-compose.production.yml
# Or upgrade VPS plan
```

#### 8. SSL Certificate Issues

**Problem**: SSL certificate not renewing or invalid

**Solutions**:
```bash
# Check Certbot logs
docker-compose -f docker-compose.production.yml logs certbot

# Manually renew certificate
docker-compose -f docker-compose.production.yml run --rm certbot renew

# Check certificate expiration
docker-compose -f docker-compose.production.yml exec certbot certbot certificates
```

### Getting Help

If you encounter issues not covered here:

1. **Check logs**: Always check service logs first
   ```bash
   docker-compose -f docker-compose.production.yml logs --tail=100
   ```

2. **Check GitHub Actions logs**: If using automated deployment, check workflow logs

3. **Verify configuration**: Ensure all environment variables are set correctly

4. **Test connectivity**: Verify services can communicate with each other

---

## Monitoring and Maintenance

### Daily Checks

```bash
# Check service status
cd /var/www/zaytoonz-ngo
docker-compose -f docker-compose.production.yml ps

# Check disk space
df -h

# Check memory usage
free -h

# View recent logs
docker-compose -f docker-compose.production.yml logs --tail=50
```

### Weekly Maintenance

```bash
# Update system packages
apt-get update && apt-get upgrade -y

# Clean Docker images and containers
docker system prune -f

# Check SSL certificate expiration
docker-compose -f docker-compose.production.yml exec certbot certbot certificates

# Review logs for errors
docker-compose -f docker-compose.production.yml logs | grep -i error
```

### Monthly Maintenance

```bash
# Full system backup (see Backup section)

# Review and rotate logs
docker-compose -f docker-compose.production.yml logs --since 30d > monthly-logs.txt

# Check for security updates
apt-get update && apt-get upgrade -y

# Review resource usage
docker stats --no-stream
```

### Setting Up Monitoring (Optional)

Consider setting up monitoring tools:

1. **Uptime monitoring**: Use services like UptimeRobot or Pingdom
2. **Log aggregation**: Set up ELK stack or similar
3. **Resource monitoring**: Use tools like Netdata or Prometheus
4. **Error tracking**: Integrate Sentry or similar service

---

## Backup and Recovery

### Creating Backups

**Manual Backup:**

```bash
# On VPS
cd /var/www/zaytoonz-ngo
BACKUP_DIR="/var/backups/zaytoonz-ngo"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR/backup_$TIMESTAMP"

# Backup environment file
cp .env "$BACKUP_DIR/backup_$TIMESTAMP/.env"

# Backup docker-compose state
docker-compose -f docker-compose.production.yml ps > "$BACKUP_DIR/backup_$TIMESTAMP/services.txt"

# Backup database (if applicable)
# Add your database backup command here

echo "Backup created: $BACKUP_DIR/backup_$TIMESTAMP"
```

**Automated Backup Script:**

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /var/www/zaytoonz-ngo/scripts/backup.sh
```

### Restoring from Backup

```bash
# List available backups
ls -la /var/backups/zaytoonz-ngo/

# Restore environment file
cd /var/www/zaytoonz-ngo
cp /var/backups/zaytoonz-ngo/backup_YYYYMMDD_HHMMSS/.env .env

# Restart services
docker-compose -f docker-compose.production.yml restart
```

### Disaster Recovery

If you need to completely restore:

1. **Set up new VPS** (follow VPS Initial Configuration)
2. **Clone repository**: `git clone https://github.com/theunknown2025/Zaytoonz_NGO.git /var/www/zaytoonz-ngo`
3. **Restore environment file** from backup
4. **Deploy services**: `./scripts/deploy.sh`
5. **Verify deployment**: `./scripts/health-check.sh`

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Hostinger VPS Documentation**: https://www.hostinger.com/tutorials/vps
- **GitHub Actions Documentation**: https://docs.github.com/en/actions

---

## Quick Reference Commands

```bash
# Connect to VPS
ssh root@168.231.87.171

# Navigate to app directory
cd /var/www/zaytoonz-ngo

# View service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop services
docker-compose -f docker-compose.production.yml down

# Start services
docker-compose -f docker-compose.production.yml up -d

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Check health
./scripts/health-check.sh

# View disk space
df -h

# View memory
free -h
```

---

**Last Updated**: 2024
**Maintained By**: Zaytoonz NGO Development Team
