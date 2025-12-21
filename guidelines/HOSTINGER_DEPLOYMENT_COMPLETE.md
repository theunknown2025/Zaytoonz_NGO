# 🚀 Complete Hostinger VPS Deployment Guide - Zaytoonz NGO

## 📋 Overview

This guide provides **complete deployment instructions** for deploying your Zaytoonz NGO application to Hostinger VPS, including:
- ✅ Next.js 14 application
- ✅ Python Scraper service with AI capabilities
- ✅ Supabase integration
- ✅ PM2 process management
- ✅ Nginx reverse proxy
- ✅ Automated deployment scripts

## 🎯 What You'll Deploy

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Hostinger VPS                        │
│  IP: 168.231.87.171                                 │
│  Hostname: srv1182909.hstgr.cloud                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐         ┌──────────────┐          │
│  │   Nginx     │         │     PM2      │          │
│  │   Port 80   │────────▶│              │          │
│  └─────────────┘         │  ┌─────────┐ │          │
│                          │  │ Next.js │ │          │
│                          │  │ :3000   │ │          │
│                          │  └────┬────┘ │          │
│                          │       │      │          │
│                          │  ┌────▼────┐ │          │
│                          │  │ Python  │ │          │
│                          │  │ Scraper │ │          │
│                          │  │ :8000   │ │          │
│                          │  └─────────┘ │          │
│                          └──────────────┘          │
│                                                      │
└─────────────────────────────────────────────────────┘
                    │
                    │ External Connections
                    ▼
          ┌──────────────────┐
          │   Supabase DB    │
          │  uroirdud...     │
          └──────────────────┘
```

## 🚀 Quick Start (Automated Deployment)

### Option 1: One-Command Deployment (Recommended)

#### On Windows (PowerShell):
```powershell
# Make sure you're in the project root
cd C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO

# Run the deployment script
.\deploy-hostinger-complete.ps1
```

#### On Linux/Mac or WSL:
```bash
# Make sure you're in the project root
cd /path/to/Zaytoonz_NGO

# Make script executable
chmod +x deploy-hostinger-complete.sh

# Run the deployment
./deploy-hostinger-complete.sh
```

**That's it!** The script will:
1. ✅ Build your Next.js application
2. ✅ Create a deployment archive (excluding node_modules, venv, etc.)
3. ✅ Upload to your VPS
4. ✅ Set up Python environment and install dependencies
5. ✅ Configure environment variables
6. ✅ Start both Next.js and Python Scraper with PM2
7. ✅ Configure services to auto-start on reboot

### Option 2: Manual Step-by-Step Deployment

See the "Manual Deployment" section below.

## 📦 What Gets Deployed

### Files Included in Deployment:
- ✅ All application source code
- ✅ package.json and dependencies
- ✅ Python scraper code (Scrape_Master/)
- ✅ requirements.txt for Python
- ✅ ecosystem.production.config.js (PM2 configuration)
- ✅ Environment configuration templates

### Files Excluded (Generated on VPS):
- ❌ node_modules/ (installed on VPS)
- ❌ .next/ (built on VPS)
- ❌ venv/ (created on VPS)
- ❌ __pycache__/ (generated on VPS)
- ❌ .env, .env.local (configured on VPS)

## 🔧 Initial VPS Setup (Run Once)

If this is your **first deployment**, you need to set up the VPS once:

### 1. Connect to VPS
```bash
ssh root@168.231.87.171
```

### 2. Run Setup Script
```bash
# Upload the setup script
scp setup-vps-complete.sh root@168.231.87.171:/tmp/

# Connect to VPS
ssh root@168.231.87.171

# Run setup
chmod +x /tmp/setup-vps-complete.sh
/tmp/setup-vps-complete.sh
```

This installs:
- ✅ Node.js 20.x
- ✅ PM2 process manager
- ✅ Python 3 + pip + venv
- ✅ Playwright dependencies
- ✅ Nginx web server
- ✅ UFW firewall configuration
- ✅ Helper deployment script

## 🎯 Admin Scraper - Special Focus

### What is the Admin Scraper?

The Admin Scraper is a **powerful Python-based web scraping service** that:
- 🔍 Extracts opportunities from NGO websites
- 🤖 Uses AI (OpenAI/Gemini/DeepSeek) to parse and structure data
- 📊 Stores data in Supabase
- 🎭 Uses Playwright for JavaScript-heavy sites
- 📄 Exports data to Excel

### How It Works After Deployment

```
┌─────────────────────────────────────────────────────┐
│  Admin Dashboard (Next.js)                          │
│  http://168.231.87.171:3000/admin/Scraper          │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ HTTP POST Request
                    │ /api/scrape
                    ▼
┌─────────────────────────────────────────────────────┐
│  Python Scraper API (FastAPI/Uvicorn)              │
│  http://localhost:8000                              │
│                                                      │
│  Endpoints:                                         │
│  - POST /api/scrape     (Scrape URL)               │
│  - GET  /health         (Health check)             │
│  - GET  /api/status     (Service status)           │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ Saves Data
                    ▼
┌─────────────────────────────────────────────────────┐
│  Supabase Database                                  │
│  Tables: scraped_opportunities,                     │
│          extracted_opportunities                    │
└─────────────────────────────────────────────────────┘
```

### Admin Scraper Features

1. **Multi-URL Scraping**: Scrape multiple NGO websites in batch
2. **AI-Powered Extraction**: Automatically extract structured data
3. **Excel Export**: Export opportunities to Excel with filtering
4. **Real-time Status**: See scraping progress live
5. **Error Handling**: Robust error handling and logging
6. **Queue Management**: Process scraping jobs in queue

### Accessing the Admin Scraper

After deployment, access at:
```
http://168.231.87.171:3000/admin/Scraper/extracted
```

### Admin Scraper API Endpoints

The Python scraper exposes these endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Scrape a URL
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.org/opportunities",
    "opportunity_type": "job"
  }'

# Get service status
curl http://localhost:8000/api/status
```

## 🔐 Environment Configuration

### Next.js Environment (.env.local)

Located at: `/var/www/zaytoonz-ngo/.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# Python Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# Environment
NODE_ENV=production
PORT=3000

# Add your API keys
OPENAI_API_KEY=your-openai-key-here
```

### Python Scraper Environment (.env)

Located at: `/var/www/zaytoonz-ngo/Scrape_Master/.env`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# AI API Keys
OPENAI_API_KEY=your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
```

### 🔑 To Update API Keys After Deployment:

```bash
# SSH to VPS
ssh root@168.231.87.171

# Edit Next.js environment
nano /var/www/zaytoonz-ngo/.env.local

# Edit Python scraper environment
nano /var/www/zaytoonz-ngo/Scrape_Master/.env

# Restart services
pm2 restart all
```

## 📊 Service Management

### PM2 Commands

```bash
# View all services
pm2 status

# View Next.js logs
pm2 logs zaytoonz-ngo

# View Python scraper logs
pm2 logs python-scraper

# View all logs
pm2 logs

# Restart a service
pm2 restart zaytoonz-ngo
pm2 restart python-scraper

# Restart all services
pm2 restart all

# Stop a service
pm2 stop zaytoonz-ngo
pm2 stop python-scraper

# Monitor resources
pm2 monit

# Save current configuration
pm2 save
```

### Check Service Health

```bash
# Check Next.js
curl http://localhost:3000

# Check Python scraper health
curl http://localhost:8000/health

# Check from external
curl http://168.231.87.171:3000
curl http://168.231.87.171:8000/health
```

### View Logs

```bash
# PM2 logs
pm2 logs --lines 100

# System logs
tail -f /var/log/pm2/zaytoonz-ngo-error.log
tail -f /var/log/pm2/python-scraper-error.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔄 Updating Your Deployment

### Quick Update (Using Git)

```bash
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
git pull origin main
npm install --production
npm run build
cd Scrape_Master
source venv/bin/activate
pip install -r requirements.txt
cd ..
pm2 restart all
```

### Full Redeployment

Just run the deployment script again:

```powershell
# Windows
.\deploy-hostinger-complete.ps1
```

```bash
# Linux/Mac
./deploy-hostinger-complete.sh
```

### Helper Command (On VPS)

After initial setup, use:

```bash
ssh root@168.231.87.171
zaytoonz-deploy
```

## 🧪 Testing Your Deployment

### 1. Test Next.js Application
```bash
curl http://168.231.87.171:3000
```

### 2. Test Python Scraper
```bash
# Health check
curl http://168.231.87.171:8000/health

# Should return: {"status": "healthy"}
```

### 3. Test Admin Scraper Integration

Visit in your browser:
```
http://168.231.87.171:3000/admin/Scraper/extracted
```

Try scraping a URL and check if it appears in the extracted opportunities.

### 4. Test Excel Export

1. Go to admin scraper page
2. Filter opportunities
3. Click "Export to Excel"
4. Verify Excel file downloads with data

## 🐛 Troubleshooting

### Next.js Won't Start

```bash
# Check logs
pm2 logs zaytoonz-ngo --lines 50

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Restart
pm2 restart zaytoonz-ngo

# Full rebuild
cd /var/www/zaytoonz-ngo
rm -rf .next node_modules
npm install
npm run build
pm2 restart zaytoonz-ngo
```

### Python Scraper Won't Start

```bash
# Check logs
pm2 logs python-scraper --lines 50

# Check Python environment
cd /var/www/zaytoonz-ngo/Scrape_Master
source venv/bin/activate
python --version
pip list

# Reinstall dependencies
pip install -r requirements.txt
playwright install chromium

# Restart
pm2 restart python-scraper
```

### Scraper Can't Connect to Supabase

```bash
# Check environment variables
cat /var/www/zaytoonz-ngo/Scrape_Master/.env

# Test Supabase connection
cd /var/www/zaytoonz-ngo
node test-supabase-connection.js
```

### Build Fails with venv Errors

The deployment scripts already exclude `venv/` from the build. If you still see errors:

```bash
# Remove venv from git tracking (if accidentally added)
git rm -r --cached Scrape_Master/venv
echo "Scrape_Master/venv/" >> .gitignore

# Rebuild
npm run build
```

### Nginx Shows 502 Bad Gateway

```bash
# Check if services are running
pm2 status

# Check Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

## 🔒 Security Recommendations

### 1. Set Up SSH Keys

```bash
# On your local machine
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to VPS
ssh-copy-id root@168.231.87.171

# Disable password authentication
ssh root@168.231.87.171
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

### 2. Set Up SSL Certificate (Let's Encrypt)

```bash
ssh root@168.231.87.171

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### 3. Configure Firewall

```bash
# The setup script already configures UFW
# To check status:
ufw status

# To add a rule:
ufw allow from YOUR_IP to any port 22
```

### 4. Secure Environment Variables

```bash
# Make .env files readable only by root
chmod 600 /var/www/zaytoonz-ngo/.env.local
chmod 600 /var/www/zaytoonz-ngo/Scrape_Master/.env
```

## 📈 Performance Optimization

### 1. Enable PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Configure Nginx Caching

Edit `/etc/nginx/sites-available/zaytoonz-ngo`:

```nginx
# Add caching for static files
location /_next/static/ {
    proxy_cache_valid 200 60m;
    proxy_pass http://localhost:3000;
}
```

### 3. Scale Python Scraper

Edit `ecosystem.production.config.js` and increase workers:

```javascript
args: 'api_wrapper:app --host 0.0.0.0 --port 8000 --workers 4',
```

## 📱 Monitoring & Alerts

### Set Up PM2 Plus (Optional)

```bash
pm2 link your-secret-key your-public-key
```

### Basic Health Check Script

Create `/usr/local/bin/health-check.sh`:

```bash
#!/bin/bash
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "Next.js is down! Restarting..."
    pm2 restart zaytoonz-ngo
fi

if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "Python scraper is down! Restarting..."
    pm2 restart python-scraper
fi
```

Add to crontab:
```bash
crontab -e
# Add: */5 * * * * /usr/local/bin/health-check.sh
```

## 🎉 Success Checklist

After deployment, verify:

- [ ] Next.js accessible at http://168.231.87.171:3000
- [ ] Python scraper health check passes: http://168.231.87.171:8000/health
- [ ] PM2 shows both services running: `pm2 status`
- [ ] Admin scraper page loads: http://168.231.87.171:3000/admin/Scraper
- [ ] Can scrape a test URL successfully
- [ ] Excel export works
- [ ] Nginx reverse proxy works (port 80)
- [ ] Services auto-restart on reboot
- [ ] Logs are accessible: `pm2 logs`

## 🆘 Support

### Log Locations

- PM2 Logs: `/var/log/pm2/`
- Nginx Logs: `/var/log/nginx/`
- Application: Use `pm2 logs`

### Useful Commands Reference

```bash
# Service Management
pm2 status                    # Check all services
pm2 logs                      # View all logs
pm2 restart all              # Restart everything
pm2 monit                    # Monitor resources

# System
systemctl status nginx       # Check Nginx
ufw status                   # Check firewall
df -h                        # Check disk space
free -h                      # Check memory

# Application
cd /var/www/zaytoonz-ngo    # Go to app directory
npm run build                # Rebuild Next.js
git pull                     # Update code

# Python Scraper
cd /var/www/zaytoonz-ngo/Scrape_Master
source venv/bin/activate     # Activate Python env
pip list                     # List Python packages
```

## 📞 Contact

If you encounter issues not covered here, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `tail -f /var/log/nginx/error.log`
3. System resources: `pm2 monit`

---

**🎉 Congratulations!** Your Zaytoonz NGO application with the powerful Admin Scraper is now deployed and running on Hostinger VPS!

