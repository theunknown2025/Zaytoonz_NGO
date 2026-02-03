# 🚀 Hostinger Quick Start Guide

## Quick Deployment Checklist

### 1. Initial Server Setup (One-time)
```bash
# Connect to VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Python
apt install -y python3 python3-pip python3-venv python3-dev build-essential

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Install Git
apt install -y git
```

### 2. Clone Repository
```bash
cd /var/www
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo
cd zaytoonz-ngo
```

### 3. Setup Environment Variables

**Next.js (.env.local):**
```bash
nano /var/www/zaytoonz-ngo/.env.local
```
Add: `NEXT_PUBLIC_BASE_PATH=/test`, Supabase keys, OpenAI keys, etc.

**Python Scraper (.env):**
```bash
nano /var/www/zaytoonz-ngo/python_scraper/.env
```
Add: Supabase keys, OpenAI keys

**Morchid AI (.env):**
```bash
nano /var/www/zaytoonz-ngo/morchid-ai-service/.env
```
Add: Supabase keys, OpenAI keys

### 4. Setup Python Services

**Python Scraper:**
```bash
cd /var/www/zaytoonz-ngo/python_scraper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

**Morchid AI:**
```bash
cd /var/www/zaytoonz-ngo/morchid-ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

### 5. Build Frontend
```bash
cd /var/www/zaytoonz-ngo
npm install --production
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
```

### 6. Create PM2 Config
```bash
cd /var/www/zaytoonz-ngo
nano ecosystem.production.config.js
```
Copy config from main guide (includes all 3 services)

### 7. Start All Services
```bash
mkdir -p /var/log/pm2
pm2 start ecosystem.production.config.js
pm2 save
pm2 startup  # Run the command it outputs
```

### 8. Configure Nginx
```bash
nano /etc/nginx/sites-available/zaytoonz
```
Copy config from main guide

```bash
ln -s /etc/nginx/sites-available/zaytoonz /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 9. Setup SSL
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d zaytoonz.com -d www.zaytoonz.com
```

### 10. Verify
```bash
pm2 status
curl http://localhost:3001/test
curl http://localhost:8000/health
curl http://localhost:8001/health
```

## Quick Update Commands

```bash
cd /var/www/zaytoonz-ngo
git pull origin main
npm install --production
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
pm2 restart all
```

## Service Ports

- **Next.js App**: Port 3001
- **Python Scraper**: Port 8000
- **Morchid AI**: Port 8001

## Important Paths

- Project: `/var/www/zaytoonz-ngo`
- Next.js env: `/var/www/zaytoonz-ngo/.env.local`
- Python scraper: `/var/www/zaytoonz-ngo/python_scraper`
- Morchid AI: `/var/www/zaytoonz-ngo/morchid-ai-service`
- PM2 logs: `/var/log/pm2/`
- Nginx config: `/etc/nginx/sites-available/zaytoonz`

## Common Commands

```bash
# Check all services
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Check ports
netstat -tulpn | grep -E '3001|8000|8001'

# Test services
curl http://localhost:3001/test
curl http://localhost:8000/health
curl http://localhost:8001/health
```

For detailed instructions, see `COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md`

