# 🚀 Enhanced VPS Deployment - Complete From-Scratch Setup

## ✨ What's New

The **enhanced deployment script** now handles **completely fresh VPS servers** with zero software installed. It configures everything from the ground up!

---

## 🎯 What the Enhanced Script Does

### 15 Automated Phases

#### **Phase 1: System Initialization**
- ✅ Updates all system packages
- ✅ Upgrades existing software
- ✅ Installs essential build tools
- ✅ Configures package repositories

#### **Phase 2: Node.js Installation**
- ✅ Adds NodeSource repository
- ✅ Installs Node.js 20.x LTS
- ✅ Verifies npm installation
- ✅ Checks for existing installation

#### **Phase 3: Python & Dependencies**
- ✅ Installs Python 3
- ✅ Installs pip, venv, setuptools
- ✅ Installs build dependencies
- ✅ Installs Playwright system libraries
- ✅ Installs browser dependencies (Chromium support)

#### **Phase 4: PM2 Installation**
- ✅ Installs PM2 globally
- ✅ Verifies installation
- ✅ Skips if already present

#### **Phase 5: Nginx Installation**
- ✅ Installs Nginx web server
- ✅ Enables auto-start on boot
- ✅ Prepares for reverse proxy

#### **Phase 6: Firewall Configuration**
- ✅ Configures UFW firewall
- ✅ Opens port 22 (SSH)
- ✅ Opens port 80 (HTTP)
- ✅ Opens port 443 (HTTPS)
- ✅ Opens port 3000 (Next.js)
- ✅ Opens port 8000 (Python Scraper)
- ✅ Enables firewall

#### **Phase 7: Application Directory Setup**
- ✅ Creates `/var/www/zaytoonz-ngo`
- ✅ Creates `/var/log/pm2`
- ✅ Backs up existing installation (if any)

#### **Phase 8: Application Extraction**
- ✅ Extracts deployment archive
- ✅ Preserves file permissions
- ✅ Organizes file structure

#### **Phase 9: Node.js Dependencies**
- ✅ Runs `npm install --production`
- ✅ Installs all required packages
- ✅ Optimizes for production

#### **Phase 10: Next.js Build**
- ✅ Compiles Next.js application
- ✅ Optimizes assets
- ✅ Generates production bundle

#### **Phase 11: Python Scraper Setup**
- ✅ Creates Python virtual environment
- ✅ Installs pip packages from requirements.txt
- ✅ Installs Playwright
- ✅ Downloads Chromium browser
- ✅ Configures browser dependencies

#### **Phase 12: Environment Configuration**
- ✅ Creates `.env.local` for Next.js
- ✅ Creates `.env` for Python scraper
- ✅ Sets Supabase credentials
- ✅ Configures service URLs
- ✅ Sets proper file permissions (600)
- ✅ Adds placeholders for API keys

#### **Phase 13: Nginx Configuration**
- ✅ Creates reverse proxy configuration
- ✅ Routes port 80 → Next.js (3000)
- ✅ Routes `/scraper-api/` → Python API (8000)
- ✅ Adds security headers
- ✅ Enables site configuration
- ✅ Disables default site
- ✅ Tests and restarts Nginx

#### **Phase 14: Service Startup**
- ✅ Stops existing PM2 services
- ✅ Starts Next.js with PM2
- ✅ Starts Python Scraper with PM2
- ✅ Saves PM2 configuration
- ✅ Configures PM2 auto-start on boot
- ✅ Sets up systemd integration

#### **Phase 15: Verification**
- ✅ Tests Next.js health
- ✅ Tests Python Scraper API
- ✅ Verifies Nginx status
- ✅ Shows service status
- ✅ Displays access URLs
- ✅ Provides next steps

---

## 🚀 How to Use

### Requirements
- ✅ Fresh Ubuntu/Debian VPS (18.04, 20.04, 22.04, 24.04)
- ✅ Root access
- ✅ Internet connection
- ✅ Deployment archive (`zaytoonz-deploy-*.tar.gz`)

### Step 1: Upload Files to VPS

Upload these 2 files to `/tmp/` on your VPS:
- `zaytoonz-deploy-20251218-143839.tar.gz` (your application)
- `vps-deploy-script.sh` (the enhanced script)

**Methods:**
- **WinSCP**: GUI file transfer (recommended for Windows)
- **SCP**: `scp *.gz *.sh root@YOUR_VPS_IP:/tmp/`
- **hPanel**: Web-based file manager

### Step 2: Run the Script

```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# Make script executable
chmod +x /tmp/vps-deploy-script.sh

# Run with sudo (or as root)
sudo /tmp/vps-deploy-script.sh /tmp/zaytoonz-deploy-20251218-143839.tar.gz
```

### Step 3: Wait (~10-15 minutes)

The script will:
- Install all software from scratch
- Configure your entire VPS
- Deploy your application
- Start all services

### Step 4: Add API Keys

```bash
# Edit Next.js environment
nano /var/www/zaytoonz-ngo/.env.local
# Add: OPENAI_API_KEY=your-actual-key

# Edit Python scraper environment
nano /var/www/zaytoonz-ngo/Scrape_Master/.env
# Add: OPENAI_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY

# Restart services
pm2 restart all
```

---

## 🌐 Access Your Application

After successful deployment:

### Primary Access (via Nginx)
```
http://YOUR_VPS_IP
```

### Direct Access
```
http://YOUR_VPS_IP:3000        # Next.js
http://YOUR_VPS_IP:8000/health # Scraper API
```

### Admin Scraper
```
http://YOUR_VPS_IP:3000/admin/Scraper/extracted
```

### External Scraper API
```
http://YOUR_VPS_IP/scraper-api/health
```

---

## 📊 What Gets Installed

### Software Stack
| Component | Version | Purpose |
|-----------|---------|---------|
| **Ubuntu/Debian** | 18.04+ | Operating System |
| **Node.js** | 20.x LTS | JavaScript runtime |
| **npm** | Latest | Package manager |
| **Python** | 3.x | Python runtime |
| **pip** | Latest | Python package manager |
| **PM2** | Latest | Process manager |
| **Nginx** | Latest | Reverse proxy |
| **UFW** | System default | Firewall |

### Python Packages
- litellm
- python-dotenv
- pydantic
- pandas
- openpyxl
- streamlit-tags
- supabase
- streamlit
- crawl4ai
- fastapi
- uvicorn
- requests
- nest-asyncio
- playwright (+ Chromium browser)

### System Libraries
- Build tools (gcc, g++, make)
- SSL libraries
- Browser dependencies (for Playwright)
- Font libraries
- Audio libraries

---

## 🔍 Verification Checklist

After deployment, the script automatically checks:

- [ ] Next.js responds on port 3000
- [ ] Python Scraper API responds on port 8000
- [ ] Nginx is running and active
- [ ] PM2 shows both services as "online"
- [ ] Firewall is configured and active
- [ ] Services will auto-start on reboot

---

## 📝 Post-Deployment Management

### View Service Status
```bash
pm2 status
```

### View Logs
```bash
# All logs
pm2 logs

# Specific service
pm2 logs zaytoonz-ngo
pm2 logs python-scraper

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart all
pm2 restart all

# Restart specific
pm2 restart zaytoonz-ngo
pm2 restart python-scraper

# Restart Nginx
systemctl restart nginx
```

### Stop Services
```bash
pm2 stop all
pm2 stop zaytoonz-ngo
pm2 stop python-scraper
```

### Check System Resources
```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU and processes
htop  # or top
```

---

## 🐛 Troubleshooting

### Script Fails at Phase X

**View detailed logs:**
```bash
# Run with debug output
bash -x /tmp/vps-deploy-script.sh /tmp/zaytoonz-deploy-*.tar.gz 2>&1 | tee deployment.log
```

**Check system logs:**
```bash
tail -100 /var/log/syslog
journalctl -xe
```

### Services Won't Start

**Check PM2 logs:**
```bash
pm2 logs --lines 100
```

**Check if ports are in use:**
```bash
netstat -tulpn | grep -E "3000|8000"
```

**Manually restart:**
```bash
cd /var/www/zaytoonz-ngo
pm2 delete all
pm2 start ecosystem.config.js
```

### Nginx Shows 502 Bad Gateway

**Check if services are running:**
```bash
pm2 status
```

**Test services directly:**
```bash
curl http://localhost:3000
curl http://localhost:8000/health
```

**Check Nginx config:**
```bash
nginx -t
systemctl status nginx
```

### Out of Memory

**Check memory usage:**
```bash
free -h
```

**Increase swap space:**
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Python Packages Won't Install

**Update pip:**
```bash
cd /var/www/zaytoonz-ngo/Scrape_Master
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

**Install system dependencies:**
```bash
apt-get install python3-dev build-essential
```

---

## 🔒 Security Enhancements

### Set Up SSH Keys

```bash
# On your local machine
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id root@YOUR_VPS_IP

# On VPS, disable password auth
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

### Configure SSL (Let's Encrypt)

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
certbot renew --dry-run
```

### Harden Firewall

```bash
# Allow only specific IP for SSH
ufw delete allow 22/tcp
ufw allow from YOUR_IP to any port 22 proto tcp

# Rate limit SSH
ufw limit 22/tcp
```

### Set Up Fail2Ban

```bash
# Install
apt-get install fail2ban

# Configure
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local

# Start
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 🔄 Update Procedures

### Update Application Code

```bash
# Option 1: Redeploy with new archive
# Upload new archive and run script again

# Option 2: Git pull (if using git)
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

### Update System Packages

```bash
apt-get update
apt-get upgrade -y
apt-get autoremove -y
```

### Update Node.js

```bash
# Install n (Node version manager)
npm install -g n

# Update to latest LTS
n lts

# Restart services
pm2 restart all
```

---

## 📊 Monitoring Setup

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### System Monitoring

```bash
# Install monitoring tools
apt-get install htop iotop nethogs

# View system stats
htop           # CPU/Memory
iotop          # Disk I/O
nethogs        # Network usage
```

---

## 🎉 Success Indicators

After deployment completes, you should see:

```
✅ DEPLOYMENT COMPLETE!
📊 Service Status:
┌─────────────────┬────┬─────────┬──────┬───────┐
│ App name        │ id │ mode    │ pid  │ status│
├─────────────────┼────┼─────────┼──────┼───────┤
│ zaytoonz-ngo    │ 0  │ fork    │ XXXX │ online│
│ python-scraper  │ 1  │ fork    │ XXXX │ online│
└─────────────────┴────┴─────────┴──────┴───────┘

🌐 Access Your Application:
  • Main App:        http://YOUR_IP
  • Admin Scraper:   http://YOUR_IP:3000/admin/Scraper/extracted
  • Scraper API:     http://YOUR_IP:8000/health
```

---

## 🆘 Getting Help

1. **Check logs first**: `pm2 logs`
2. **Verify services**: `pm2 status`
3. **Check resources**: `free -h && df -h`
4. **Review Nginx**: `nginx -t && systemctl status nginx`
5. **System logs**: `tail -100 /var/log/syslog`

---

## ✨ Features of Enhanced Script

### Advantages Over Manual Setup

✅ **Fully Automated** - Zero manual configuration needed  
✅ **Idempotent** - Safe to run multiple times  
✅ **Error Handling** - Continues on non-critical errors  
✅ **Progress Tracking** - Clear phase indicators  
✅ **Verification** - Built-in health checks  
✅ **Production Ready** - Security headers, firewall, auto-restart  
✅ **Well Documented** - Comments and status messages  
✅ **Time Saving** - 15 phases in ~10-15 minutes  

### What Makes It Special

- 🔧 **Zero-config deployment** on fresh VPS
- 🐍 **Full Python environment** with Playwright
- 🌐 **Nginx reverse proxy** pre-configured
- 🔥 **Firewall setup** included
- 🔄 **Auto-restart** on crash/reboot
- 📊 **Health checks** built-in
- 🔒 **Secure by default** (proper permissions, headers)

---

## 📞 Summary

The **enhanced vps-deploy-script.sh** is now a **complete VPS provisioning and deployment solution** that:

1. ✅ Handles fresh, empty VPS servers
2. ✅ Installs all required software
3. ✅ Configures firewall and security
4. ✅ Deploys your application
5. ✅ Sets up reverse proxy
6. ✅ Starts all services
7. ✅ Configures auto-restart
8. ✅ Verifies installation
9. ✅ Provides clear next steps

**Total Time: ~10-15 minutes** from bare metal to production! 🚀

