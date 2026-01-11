# 🚀 Complete Hostinger Deployment Guide
## Deploy Full Stack Application: Frontend, Backend, Python Scraper & AI Service

This comprehensive guide will help you deploy your complete Zaytoonz NGO application to Hostinger VPS, including:
- ✅ **Frontend**: Next.js application (accessible at `http://72.62.26.162`)
- ✅ **Backend**: Next.js API routes (integrated with frontend)
- ✅ **Python Scraper**: FastAPI service (port 8000)
- ✅ **Morchid AI Service**: FastAPI service (port 8001)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ SSH access to your Hostinger VPS
- ✅ Root or sudo access on the server
- ✅ Your code pushed to GitHub
- ✅ VPS IP address: `72.62.26.162`
- ✅ Basic knowledge of Linux commands
- ✅ All API keys and credentials ready (Supabase, OpenAI, etc.)

---

## 🔧 Step 1: Connect to Your VPS

### Option A: Using SSH (Windows PowerShell/CMD)
```powershell
ssh root@72.62.26.162
```

### Option B: Using PuTTY (Windows)
1. Download and open PuTTY
2. Enter your VPS IP address
3. Port: 22
4. Connection type: SSH
5. Click "Open"
6. Login with username: `root` and your password

---

## 📦 Step 2: Install Required Software

Once connected to your VPS, run these commands:

### 2.1 Update System Packages
```bash
apt update && apt upgrade -y
```

### 2.2 Install Node.js (v20 recommended)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.3 Install Python 3.11+ and pip
```bash
# Install Python 3.11 and pip
apt install -y python3 python3-pip python3-venv python3-dev

# Install build essentials for Python packages
apt install -y build-essential libssl-dev libffi-dev

# Verify installation
python3 --version
pip3 --version
```

### 2.4 Install PM2 (Process Manager)
```bash
npm install -g pm2

# Verify installation
pm2 --version
```

### 2.5 Install Nginx (Web Server)
```bash
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Verify Nginx is running
systemctl status nginx
```

### 2.6 Install Git (if not already installed)
```bash
apt install -y git
```

### 2.7 Install Additional Python Dependencies
```bash
# Install system dependencies for Python packages
apt install -y libpq-dev postgresql-client
```

---

## 📥 Step 3: Clone Your Repository

```bash
# Navigate to web root directory
cd /var/www

# Clone your repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo

# Navigate into the project
cd zaytoonz-ngo

# Verify files are cloned
ls -la
```

**Note:** Replace the GitHub URL with your actual repository URL if different.

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Create Main Environment File for Next.js
```bash
cd /var/www/zaytoonz-ngo
nano .env.local
```

### 4.2 Add Your Environment Variables
Copy and paste the following, then update with your actual values:

```env
# Base path (empty for root deployment)
NEXT_PUBLIC_BASE_PATH=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# Python Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# NLWeb Configuration (for Morchid AI Service)
NLWEB_URL=http://localhost:8001

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://72.62.26.162
```

**To save in nano:** Press `Ctrl+X`, then `Y`, then `Enter`

### 4.3 Create Environment File for Python Scraper
```bash
cd /var/www/zaytoonz-ngo/python_scraper
nano .env
```

Add the following:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

### 4.4 Create Environment File for Morchid AI Service
```bash
cd /var/www/zaytoonz-ngo/morchid-ai-service
nano .env
```

Add the following:
```env
# Supabase Configuration
SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# Service Configuration
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8001

# NLWeb Configuration
NLWEB_PATH=../NLWeb-main/code/python

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🐍 Step 5: Setup Python Scraper Service

### 5.1 Navigate to Python Scraper Directory
```bash
cd /var/www/zaytoonz-ngo/python_scraper
```

### 5.2 Create Python Virtual Environment
```bash
python3 -m venv venv
```

### 5.3 Activate Virtual Environment and Install Dependencies
```bash
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
```

**Note:** If you encounter issues with `crawl4ai` or other packages, you may need to install additional system dependencies:
```bash
apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

### 5.4 Verify Python Scraper Setup
```bash
# Test if the API wrapper can be imported
source venv/bin/activate
python3 -c "from api_wrapper import app; print('Python scraper setup successful')"
deactivate
```

---

## 🤖 Step 6: Setup Morchid AI Service

### 6.1 Navigate to Morchid AI Service Directory
```bash
cd /var/www/zaytoonz-ngo/morchid-ai-service
```

### 6.2 Create Python Virtual Environment
```bash
python3 -m venv venv
```

### 6.3 Activate Virtual Environment and Install Dependencies
```bash
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
```

### 6.4 Verify Morchid AI Service Setup
```bash
# Test if the app can be imported
source venv/bin/activate
python3 -c "from enhanced_app import app; print('Morchid AI service setup successful')"
deactivate
```

**Note:** If NLWeb integration is not available, the service will use fallback responses. This is normal if NLWeb-main is not fully configured.

---

## 📦 Step 7: Install Frontend Dependencies and Build

```bash
# Make sure you're in the project root directory
cd /var/www/zaytoonz-ngo

# Install dependencies
npm install --production

# Build the Next.js application
export NEXT_PUBLIC_BASE_PATH=
npm run build
```

**Note:** The build process may take a few minutes. Be patient!

---

## 🚀 Step 8: Configure PM2 for All Services

### 8.1 Create PM2 Ecosystem Configuration
```bash
cd /var/www/zaytoonz-ngo
nano ecosystem.production.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'zaytoonz-app',
      script: 'server.js',
      cwd: '/var/www/zaytoonz-ngo',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: 'localhost',
        NEXT_PUBLIC_BASE_PATH: '',
      },
      error_file: '/var/log/pm2/zaytoonz-app-error.log',
      out_file: '/var/log/pm2/zaytoonz-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
    {
      name: 'python-scraper',
      script: 'venv/bin/uvicorn',
      args: 'api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2',
      cwd: '/var/www/zaytoonz-ngo/python_scraper',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      },
      error_file: '/var/log/pm2/python-scraper-error.log',
      out_file: '/var/log/pm2/python-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'morchid-ai-service',
      script: 'venv/bin/uvicorn',
      args: 'enhanced_app:app --host 0.0.0.0 --port 8001 --workers 1',
      cwd: '/var/www/zaytoonz-ngo/morchid-ai-service',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      },
      error_file: '/var/log/pm2/morchid-ai-error.log',
      out_file: '/var/log/pm2/morchid-ai-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ]
};
```

### 8.2 Create PM2 Log Directory
```bash
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2
```

### 8.3 Start All Services with PM2
```bash
cd /var/www/zaytoonz-ngo
pm2 start ecosystem.production.config.js
```

### 8.4 Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

The `pm2 startup` command will output a command. **Copy and run that command** to enable PM2 on system boot.

### 8.5 Verify PM2 Status
```bash
pm2 status
pm2 logs
```

You should see all three services running:
- `zaytoonz-app` (Next.js app)
- `python-scraper` (Python scraper on port 8000)
- `morchid-ai-service` (AI service on port 8001)

Press `Ctrl+C` to exit logs.

---

## 🌐 Step 9: Configure Nginx

### 9.1 Create Nginx Configuration File
```bash
nano /etc/nginx/sites-available/zaytoonz-ngo
```

### 9.2 Add Nginx Configuration
Copy and paste the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 72.62.26.162;

    client_max_body_size 100M;

    # Root - Next.js application
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Handle Next.js static files
    location /_next/static/ {
        proxy_pass http://localhost:3001/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle Next.js API routes
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Python Scraper API (if exposed externally)
    location /api/scraper/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Morchid AI Service API (if exposed externally)
    location /api/morchid/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Important:** 
- The Python services are accessible via `localhost:8000` and `localhost:8001` internally
- If you want to expose them externally, uncomment the proxy sections for `/api/scraper/` and `/api/morchid/`

**To save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 9.3 Enable the Site
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
```

If the test is successful, you'll see:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 9.4 Reload Nginx
```bash
systemctl reload nginx
```

---

## 🔒 Step 10: SSL/HTTPS Note

**Note:** SSL certificates cannot be issued for IP addresses using Let's Encrypt. If you need HTTPS:
- Use a domain name pointing to your IP address
- Or use a self-signed certificate (not recommended for production)
- Or use a service that provides SSL for IP addresses

For now, the application will be accessible via HTTP at `http://72.62.26.162`.

---

## ✅ Step 11: Verify Deployment

### 11.1 Check PM2 Status
```bash
pm2 status
```

Should show all three services as `online`:
- `zaytoonz-app`
- `python-scraper`
- `morchid-ai-service`

### 11.2 Check Nginx Status
```bash
systemctl status nginx
```

### 11.3 Test Services Locally on Server

**Test Next.js App:**
```bash
curl http://localhost:3001
```

**Test Python Scraper:**
```bash
curl http://localhost:8000/health
# or
curl http://localhost:8000/docs
```

**Test Morchid AI Service:**
```bash
curl http://localhost:8001/health
# or
curl http://localhost:8001/docs
```

### 11.4 Test via IP Address
```bash
curl http://72.62.26.162
```

### 11.5 Check Logs
```bash
# PM2 logs for all services
pm2 logs

# Individual service logs
pm2 logs zaytoonz-app
pm2 logs python-scraper
pm2 logs morchid-ai-service

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## 🌐 Step 12: Access Your Application

Open your browser and visit:
- **Your App:** `http://72.62.26.162`
- **Python Scraper API Docs:** `http://localhost:8000/docs` (internal only)
- **Morchid AI API Docs:** `http://localhost:8001/docs` (internal only)

---

## 🔄 Step 13: Updating Your Application

When you push new changes to GitHub:

### 13.1 Update Frontend
```bash
# SSH into your VPS
ssh root@72.62.26.162

# Navigate to project directory
cd /var/www/zaytoonz-ngo

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install --production

# Rebuild the application
export NEXT_PUBLIC_BASE_PATH=
npm run build

# Restart PM2
pm2 restart zaytoonz-app
```

### 13.2 Update Python Scraper
```bash
cd /var/www/zaytoonz-ngo/python_scraper

# Pull latest changes (if in separate repo, otherwise already pulled)
git pull origin main  # if needed

# Activate venv and update dependencies
source venv/bin/activate
pip install -r requirements.txt --upgrade
deactivate

# Restart PM2
pm2 restart python-scraper
```

### 13.3 Update Morchid AI Service
```bash
cd /var/www/zaytoonz-ngo/morchid-ai-service

# Pull latest changes (if in separate repo, otherwise already pulled)
git pull origin main  # if needed

# Activate venv and update dependencies
source venv/bin/activate
pip install -r requirements.txt --upgrade
deactivate

# Restart PM2
pm2 restart morchid-ai-service
```

### 13.4 Quick Update Script
You can create a script to update everything at once:

```bash
cd /var/www/zaytoonz-ngo
nano update-all.sh
```

Add:
```bash
#!/bin/bash
set -e

echo "Updating all services..."

# Pull latest code
git pull origin main

# Update frontend
echo "Updating frontend..."
npm install --production
export NEXT_PUBLIC_BASE_PATH=
npm run build
pm2 restart zaytoonz-app

# Update Python scraper
echo "Updating Python scraper..."
cd python_scraper
source venv/bin/activate
pip install -r requirements.txt --upgrade
deactivate
cd ..
pm2 restart python-scraper

# Update Morchid AI service
echo "Updating Morchid AI service..."
cd morchid-ai-service
source venv/bin/activate
pip install -r requirements.txt --upgrade
deactivate
cd ..
pm2 restart morchid-ai-service

echo "All services updated!"
pm2 status
```

Make it executable:
```bash
chmod +x update-all.sh
```

---

## 🛠️ Troubleshooting

### Issue: Next.js App not starting
```bash
# Check PM2 logs
pm2 logs zaytoonz-app --lines 50

# Check if port 3001 is in use
netstat -tulpn | grep 3001

# Restart the app
pm2 restart zaytoonz-app

# Check environment variables
cat /var/www/zaytoonz-ngo/.env.local
```

### Issue: Python Scraper not starting
```bash
# Check PM2 logs
pm2 logs python-scraper --lines 50

# Check if port 8000 is in use
netstat -tulpn | grep 8000

# Test Python environment
cd /var/www/zaytoonz-ngo/python_scraper
source venv/bin/activate
python3 -c "from api_wrapper import app; print('OK')"
deactivate

# Restart the service
pm2 restart python-scraper
```

### Issue: Morchid AI Service not starting
```bash
# Check PM2 logs
pm2 logs morchid-ai-service --lines 50

# Check if port 8001 is in use
netstat -tulpn | grep 8001

# Test Python environment
cd /var/www/zaytoonz-ngo/morchid-ai-service
source venv/bin/activate
python3 -c "from enhanced_app import app; print('OK')"
deactivate

# Restart the service
pm2 restart morchid-ai-service
```

### Issue: 502 Bad Gateway
```bash
# Check if all services are running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Verify Nginx config
nginx -t

# Check if services are listening on correct ports
netstat -tulpn | grep -E '3001|8000|8001'
```

### Issue: 404 errors on routes
- Verify `NEXT_PUBLIC_BASE_PATH=` (empty) in `.env.local`
- Check that the app is running: `pm2 status zaytoonz-app`
- Verify Nginx is proxying correctly

### Issue: Python services can't connect to Supabase
```bash
# Check environment variables
cat /var/www/zaytoonz-ngo/python_scraper/.env
cat /var/www/zaytoonz-ngo/morchid-ai-service/.env

# Test Supabase connection
cd /var/www/zaytoonz-ngo/python_scraper
source venv/bin/activate
python3 -c "from supabase import create_client; print('Supabase connection OK')"
deactivate
```

### Issue: Permission denied errors
```bash
# Fix ownership
chown -R www-data:www-data /var/www/zaytoonz-ngo
chmod -R 755 /var/www/zaytoonz-ngo

# Fix Python venv permissions
chmod -R 755 /var/www/zaytoonz-ngo/python_scraper/venv
chmod -R 755 /var/www/zaytoonz-ngo/morchid-ai-service/venv
```

### Issue: Out of memory
```bash
# Check memory usage
free -h
pm2 monit

# Restart services to free memory
pm2 restart all

# If persistent, increase swap space or upgrade VPS
```

---

## 📝 Useful Commands Reference

### PM2 Management
```bash
pm2 status                    # Check all services
pm2 logs                      # View all logs
pm2 logs zaytoonz-app         # View Next.js logs
pm2 logs python-scraper       # View Python scraper logs
pm2 logs morchid-ai-service   # View AI service logs
pm2 restart all               # Restart all services
pm2 restart zaytoonz-app      # Restart Next.js app
pm2 restart python-scraper    # Restart Python scraper
pm2 restart morchid-ai-service # Restart AI service
pm2 stop all                  # Stop all services
pm2 delete all                # Delete all services
pm2 save                      # Save current process list
pm2 monit                     # Monitor resources
```

### Nginx Management
```bash
nginx -t                      # Test configuration
systemctl reload nginx        # Reload Nginx
systemctl restart nginx       # Restart Nginx
systemctl status nginx        # Check Nginx status
tail -f /var/log/nginx/error.log   # View error logs
tail -f /var/log/nginx/access.log  # View access logs
```

### Service Management
```bash
# Check if services are listening
netstat -tulpn | grep 3001    # Next.js
netstat -tulpn | grep 8000    # Python scraper
netstat -tulpn | grep 8001    # Morchid AI

# Test services
curl http://localhost:3001
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### Python Environment Management
```bash
# Activate Python scraper venv
cd /var/www/zaytoonz-ngo/python_scraper
source venv/bin/activate

# Activate Morchid AI venv
cd /var/www/zaytoonz-ngo/morchid-ai-service
source venv/bin/activate

# Deactivate venv
deactivate
```

---

## ✅ Deployment Checklist

Before considering deployment complete, verify:

### Prerequisites
- [ ] Node.js and npm installed
- [ ] Python 3.11+ and pip installed
- [ ] PM2 installed and configured
- [ ] Nginx installed and running
- [ ] Git installed

### Repository
- [ ] Repository cloned to `/var/www/zaytoonz-ngo`
- [ ] All code files present

### Environment Variables
- [ ] `.env.local` created for Next.js with all required variables
- [ ] `.env` created for Python scraper
- [ ] `.env` created for Morchid AI service
- [ ] All API keys and credentials configured

### Python Services
- [ ] Python virtual environments created
- [ ] Dependencies installed for Python scraper
- [ ] Dependencies installed for Morchid AI service
- [ ] Both services can import their modules

### Frontend
- [ ] npm dependencies installed
- [ ] Application built successfully
- [ ] Build output in `.next/` directory

### PM2 Services
- [ ] `zaytoonz-app` running on port 3001
- [ ] `python-scraper` running on port 8000
- [ ] `morchid-ai-service` running on port 8001
- [ ] All services showing as `online` in PM2
- [ ] PM2 startup configured

### Nginx
- [ ] Nginx configured and reloaded
- [ ] Site enabled in `/etc/nginx/sites-enabled/`
- [ ] Nginx configuration test passed

### SSL/HTTPS
- [ ] Note: SSL not available for IP addresses (requires domain)

### Testing
- [ ] App accessible at `http://72.62.26.162`
- [ ] API routes working (test `/api/...`)
- [ ] Python scraper responding (internal test)
- [ ] Morchid AI service responding (internal test)
- [ ] Static assets loading correctly
- [ ] No console errors in browser

---

## 🎉 Success!

Your complete application should now be:
- ✅ Next.js frontend running on PM2 (port 3001)
- ✅ Python scraper running on PM2 (port 8000)
- ✅ Morchid AI service running on PM2 (port 8001)
- ✅ All services accessible via Nginx
- ✅ Accessible at `http://72.62.26.162`
- ✅ Auto-restarting on server reboot

---

## 📞 Need Help?

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify environment: Check all `.env` files
4. Test locally: `curl http://localhost:PORT`
5. Check PM2 status: `pm2 status`
6. Verify ports: `netstat -tulpn | grep -E '3001|8000|8001'`

---

## 🔐 Security Recommendations

1. **Firewall Setup:**
   ```bash
   # Install UFW
   apt install -y ufw
   
   # Allow SSH, HTTP, HTTPS
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   
   # Enable firewall
   ufw enable
   ```

2. **Keep Software Updated:**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Use Strong Passwords** for SSH and database access

4. **Regular Backups** of your application and database

5. **Monitor Logs** regularly for suspicious activity

6. **Keep API Keys Secure** - Never commit `.env` files to Git

---

**Last Updated:** 2025-01-15  
**For:** Zaytoonz NGO Project  
**Target:** Complete Full-Stack Deployment on Hostinger VPS

