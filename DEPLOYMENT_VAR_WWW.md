# Deployment Guide: /var/www (No Docker)

This guide covers deploying Zaytoonz NGO directly to `/var/www` on a Linux VPS without Docker.

## Prerequisites

- Fresh Linux VPS (Ubuntu/Debian recommended)
- Root or sudo access
- Domain name pointing to your VPS IP (optional)

## Step 1: System Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Required Software
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11+ and pip
sudo apt install -y python3.11 python3.11-venv python3-pip python3-dev

# Install build tools
sudo apt install -y build-essential git curl wget

# Install Google Chrome dependencies (for scraper)
sudo apt install -y wget gnupg ca-certificates
mkdir -p /etc/apt/keyrings
wget -q -O /etc/apt/keyrings/google-chrome.gpg https://dl-ssl.google.com/linux/linux_signing_key.pub
echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# Install Playwright dependencies
sudo apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Verify Installations
```bash
node --version  # Should be v20.x
python3 --version  # Should be 3.11+
pm2 --version
nginx -v
```

## Step 2: Create Application Directory

```bash
# Create directory
sudo mkdir -p /var/www/zaytoonz-ngo

# Set ownership (replace 'your-user' with your actual username)
sudo chown -R $USER:$USER /var/www/zaytoonz-ngo

# Create log directories
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

## Step 3: Clone Repository

```bash
cd /var/www/zaytoonz-ngo
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git .

# Or if you prefer to clone into a subdirectory:
# git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo
# cd zaytoonz-ngo
```

## Step 4: Setup Next.js Application

```bash
cd /var/www/zaytoonz-ngo

# Install Node.js dependencies
npm install --production

# Build the Next.js application
npm run build

# Verify build
ls -la .next
```

## Step 5: Setup Python Scraper

```bash
cd /var/www/zaytoonz-ngo/Scrape_Master

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install --no-cache-dir -r requirements.txt

# Install Playwright browser
playwright install chromium

# Deactivate virtual environment
deactivate
```

## Step 6: Setup NLWeb Service

```bash
cd /var/www/zaytoonz-ngo/NLWeb-main/code/python

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install --no-cache-dir -r requirements.txt

# Deactivate virtual environment
deactivate
```

## Step 7: Environment Variables

### Create Main .env File
```bash
cd /var/www/zaytoonz-ngo
nano .env
```

Add the following (replace with your actual values):
```env
# Node.js / Next.js
NODE_ENV=production
PORT=3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Scraper
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# NLWeb
NLWEB_URL=http://localhost:8001

# Python
PYTHONUNBUFFERED=1
```

### Create NLWeb .env File (if using separate file)
```bash
cd /var/www/zaytoonz-ngo/NLWeb-main
nano .env
```

Add NLWeb-specific environment variables (see `NLWeb-main/.env` for reference).

## Step 8: Update PM2 Configuration

Update `/var/www/zaytoonz-ngo/ecosystem.production.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'zaytoonz-ngo',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/zaytoonz-ngo',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '/var/www/zaytoonz-ngo/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/zaytoonz-ngo-error.log',
      out_file: '/var/log/pm2/zaytoonz-ngo-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'python-scraper',
      script: 'venv/bin/uvicorn',
      args: 'api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2',
      cwd: '/var/www/zaytoonz-ngo/Scrape_Master',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env_file: '/var/www/zaytoonz-ngo/.env',
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
      name: 'nlweb',
      script: 'venv/bin/python',
      args: 'app-file.py',
      cwd: '/var/www/zaytoonz-ngo/NLWeb-main/code/python',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env_file: '/var/www/zaytoonz-ngo/NLWeb-main/.env',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
        PORT: 8001,
        PYTHONPATH: '/var/www/zaytoonz-ngo/NLWeb-main/code/python',
        NLWEB_CONFIG_DIR: '/var/www/zaytoonz-ngo/NLWeb-main/config',
        NLWEB_OUTPUT_DIR: '/var/www/zaytoonz-ngo/NLWeb-main/data/nlweb',
      },
      error_file: '/var/log/pm2/nlweb-error.log',
      out_file: '/var/log/pm2/nlweb-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
```

## Step 9: Start Services with PM2

```bash
cd /var/www/zaytoonz-ngo

# Start all services
pm2 start ecosystem.production.config.js

# Save PM2 configuration to start on system reboot
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs
```

## Step 10: Configure Nginx

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/zaytoonz-ngo
```

Add the following configuration:

```nginx
upstream nextjs_backend {
    server localhost:3001;
}

upstream python_backend {
    server localhost:8000;
}

upstream nlweb_backend {
    server localhost:8001;
}

server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or use _ for all

    client_max_body_size 100M;

    # Main Next.js application
    location / {
        proxy_pass http://nextjs_backend;
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

    # Python scraper API
    location /scraper-api/ {
        proxy_pass http://python_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 600s;
        proxy_connect_timeout 75s;
    }

    # NLWeb API (if needed)
    location /nlweb-api/ {
        proxy_pass http://nlweb_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 11: Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall (if not already enabled)
sudo ufw enable

# Check status
sudo ufw status
```

## Step 12: Verify Deployment

```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx

# Test endpoints
curl http://localhost:3001
curl http://localhost:8000/docs
curl http://localhost:8001

# Check from browser
# Visit: http://your-server-ip
```

## Step 13: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Maintenance Commands

### Update Application
```bash
cd /var/www/zaytoonz-ngo

# Pull latest changes
git pull origin main

# Rebuild Next.js
npm install --production
npm run build

# Restart services
pm2 restart all
```

### View Logs
```bash
# PM2 logs
pm2 logs

# Specific service logs
pm2 logs zaytoonz-ngo
pm2 logs python-scraper
pm2 logs nlweb

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart zaytoonz-ngo
pm2 restart python-scraper
pm2 restart nlweb

# Stop all
pm2 stop all

# Start all
pm2 start all
```

### Clear Next.js Build Cache
```bash
cd /var/www/zaytoonz-ngo
rm -rf .next
npm run build
pm2 restart zaytoonz-ngo
```

## Troubleshooting

### PM2 Process Not Starting
```bash
# Check logs
pm2 logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '3001|8000|8001'

# Kill process on port if needed
sudo lsof -ti:3001 | xargs kill -9
```

### Nginx 502 Bad Gateway
- Check if PM2 services are running: `pm2 status`
- Check service logs: `pm2 logs`
- Verify ports are listening: `sudo netstat -tulpn | grep -E '3001|8000|8001'`

### Python Scraper Issues
```bash
# Check virtual environment
cd /var/www/zaytoonz-ngo/Scrape_Master
source venv/bin/activate
python --version
pip list

# Reinstall dependencies if needed
pip install --no-cache-dir -r requirements.txt
playwright install chromium
```

### NLWeb Issues
```bash
# Check virtual environment
cd /var/www/zaytoonz-ngo/NLWeb-main/code/python
source venv/bin/activate
python --version

# Check environment variables
cat /var/www/zaytoonz-ngo/NLWeb-main/.env
```

## Security Recommendations

1. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
2. **Use firewall**: `sudo ufw enable`
3. **Use SSL**: Set up Let's Encrypt certificate
4. **Secure .env files**: `chmod 600 /var/www/zaytoonz-ngo/.env`
5. **Regular backups**: Set up automated backups of `/var/www/zaytoonz-ngo`
6. **Monitor logs**: Regularly check PM2 and Nginx logs

## File Structure

```
/var/www/zaytoonz-ngo/
├── .env                          # Main environment variables
├── .next/                        # Next.js build output
├── app/                          # Next.js app directory
├── Scrape_Master/
│   ├── venv/                     # Python virtual environment
│   └── api_wrapper.py
├── NLWeb-main/
│   ├── .env                      # NLWeb environment variables
│   ├── code/
│   │   └── python/
│   │       ├── venv/             # NLWeb Python virtual environment
│   │       └── app-file.py
│   └── config/
├── ecosystem.production.config.js # PM2 configuration
└── package.json
```

## Next Steps

- Set up automated backups
- Configure monitoring (e.g., PM2 Plus, or custom monitoring)
- Set up CI/CD pipeline for automated deployments
- Configure log rotation
- Set up health checks
