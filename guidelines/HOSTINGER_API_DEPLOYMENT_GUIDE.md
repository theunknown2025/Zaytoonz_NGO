# 🚀 Hostinger VPS Deployment - Complete Guide

## ✅ What's Ready

Your deployment package is **complete** and ready:

1. ✅ **Application built** - Next.js compiled successfully
2. ✅ **Deployment archive created** - `zaytoonz-deploy-20251218-143839.tar.gz`
3. ✅ **Deployment script ready** - `vps-deploy-script.sh`
4. ✅ **Docker Compose config** - `docker-compose.production.yml` (optional)
5. ✅ **Free domain generated** - `darkgoldenrod-badger-925553.hostingersite.com`

---

## 🎯 Your VPS Details

- **Subscription**: KVM 2 VPS (Active until Nov 2027)
- **IP**: 168.231.87.171
- **Status**: Active
- **Type**: Virtual Private Server (Full control)

---

## 🚀 Deployment Options

### Option 1: Manual Upload & Deploy (Recommended - 5 minutes)

This is the simplest and most reliable method:

#### Step 1: Upload Files to VPS

**Using WinSCP (Recommended for Windows):**
1. Download WinSCP: https://winscp.net/eng/download.php
2. Connect to your VPS:
   - **Host**: 168.231.87.171
   - **User**: root
   - **Password**: [Your VPS root password]
3. Navigate to `/tmp/` on the VPS
4. Upload these 2 files:
   - `zaytoonz-deploy-20251218-143839.tar.gz`
   - `vps-deploy-script.sh`

**Or using Command Line (If SSH works):**
```powershell
# In your project directory
scp zaytoonz-deploy-20251218-143839.tar.gz root@168.231.87.171:/tmp/
scp vps-deploy-script.sh root@168.231.87.171:/tmp/
```

#### Step 2: Run Deployment Script

**Using PuTTY (Recommended for Windows):**
1. Download PuTTY: https://www.putty.org/
2. Connect to 168.231.87.171 as root
3. Run these commands:
```bash
chmod +x /tmp/vps-deploy-script.sh
/tmp/vps-deploy-script.sh /tmp/zaytoonz-deploy-20251218-143839.tar.gz
```

**Or using Command Line:**
```powershell
ssh root@168.231.87.171 "chmod +x /tmp/vps-deploy-script.sh && /tmp/vps-deploy-script.sh /tmp/zaytoonz-deploy-20251218-143839.tar.gz"
```

#### Step 3: Done! ✅

Your application will be live at:
- **Main App**: http://168.231.87.171:3000
- **Admin Scraper**: http://168.231.87.171:3000/admin/Scraper/extracted
- **Scraper API**: http://168.231.87.171:8000/health

---

### Option 2: Using Hostinger hPanel (Web Interface)

1. **Log in to Hostinger hPanel**: https://hpanel.hostinger.com/
2. **Navigate to VPS** section
3. **Access File Manager** or **Terminal**
4. Upload and run the deployment script

---

### Option 3: Docker Compose Deployment (Advanced)

If you prefer containerized deployment:

1. Upload entire project to VPS
2. Use `docker-compose.production.yml`
3. Run:
```bash
docker-compose -f docker-compose.production.yml up -d
```

---

## 📦 What the Deployment Script Does

The `vps-deploy-script.sh` automatically:

1. ✅ Creates `/var/www/zaytoonz-ngo` directory
2. ✅ Backs up existing version (if any)
3. ✅ Extracts your application files
4. ✅ Installs Node.js dependencies
5. ✅ Builds Next.js application
6. ✅ Sets up Python virtual environment
7. ✅ Installs Python dependencies & Playwright
8. ✅ Creates environment configuration files
9. ✅ Installs PM2 (if needed)
10. ✅ Starts both Next.js and Python Scraper services
11. ✅ Configures auto-restart on crash/reboot
12. ✅ Shows service status

**Total time: ~5-7 minutes**

---

## 🔐 What You Need

### Required Information:
- ✅ VPS IP: **168.231.87.171** (You have this)
- ❓ VPS Root Password (You need this to connect)

### Where to Find VPS Password:
1. Check Hostinger welcome email
2. Log in to hPanel → VPS → View Details
3. Or reset password in hPanel if forgotten

---

## 🐍 Admin Scraper - What You'll Get

After deployment, your admin scraper will be fully functional:

### Features Active:
- ✅ **Multi-URL Scraping**: Batch process multiple NGO websites
- ✅ **AI Extraction**: OpenAI/Gemini/DeepSeek integration
- ✅ **Playwright**: Handle JavaScript-heavy websites
- ✅ **Supabase Storage**: All data saved to database
- ✅ **Excel Export**: Advanced filtering and export
- ✅ **Real-time Status**: Live scraping progress
- ✅ **Error Handling**: Automatic retries and logging

### Access Points:
- **Admin UI**: http://168.231.87.171:3000/admin/Scraper/extracted
- **API Health**: http://168.231.87.171:8000/health
- **API Docs**: http://168.231.87.171:8000/docs (if enabled)

---

## 📝 Post-Deployment Tasks

### 1. Add API Keys (Important!)

SSH to your VPS and add your API keys:

```bash
ssh root@168.231.87.171

# Edit Next.js environment
nano /var/www/zaytoonz-ngo/.env.local
# Add: OPENAI_API_KEY=your-actual-key

# Edit Python scraper environment
nano /var/www/zaytoonz-ngo/Scrape_Master/.env
# Add: OPENAI_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY

# Restart services
pm2 restart all

# Exit
exit
```

### 2. Test Your Deployment

```bash
# Test Next.js
curl http://168.231.87.171:3000

# Test Python Scraper
curl http://168.231.87.171:8000/health
# Should return: {"status":"healthy"}

# Check PM2 status
ssh root@168.231.87.171 "pm2 status"
```

### 3. Test Admin Scraper

1. Visit: http://168.231.87.171:3000/admin/Scraper/extracted
2. Try scraping a test URL
3. Verify data appears in the table
4. Test Excel export functionality

---

## 🔄 Managing Your Deployment

### Check Status
```bash
ssh root@168.231.87.171 "pm2 status"
```

### View Logs
```bash
ssh root@168.231.87.171 "pm2 logs"
ssh root@168.231.87.171 "pm2 logs zaytoonz-ngo"
ssh root@168.231.87.171 "pm2 logs python-scraper"
```

### Restart Services
```bash
ssh root@168.231.87.171 "pm2 restart all"
```

### Update Application
```bash
# Option 1: Redeploy (from local)
# Just upload new archive and run script again

# Option 2: Git pull (on VPS)
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
git pull origin main
npm install --production
npm run build
pm2 restart all
```

---

## 🐛 Troubleshooting

### Can't Connect to VPS?
1. Verify IP: `ping 168.231.87.171`
2. Check hPanel for VPS status
3. Verify root password
4. Try web-based terminal in hPanel

### Upload Failed?
1. Check file sizes (archive should be < 100MB)
2. Use WinSCP instead of command line
3. Try uploading to `/root/` instead of `/tmp/`

### Deployment Script Fails?
```bash
# Check script logs
ssh root@168.231.87.171 "tail -100 /var/log/syslog"

# Run script with debug
ssh root@168.231.87.171 "bash -x /tmp/vps-deploy-script.sh /tmp/zaytoonz-deploy-20251218-143839.tar.gz"
```

### Services Won't Start?
```bash
# Check PM2 logs
ssh root@168.231.87.171 "pm2 logs --lines 50"

# Check system resources
ssh root@168.231.87.171 "free -h && df -h"

# Manually restart
ssh root@168.231.87.171 "cd /var/www/zaytoonz-ngo && pm2 restart all"
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Next.js accessible: http://168.231.87.171:3000
- [ ] Scraper health check: http://168.231.87.171:8000/health returns `{"status":"healthy"}`
- [ ] PM2 shows both services "online": `ssh root@168.231.87.171 "pm2 status"`
- [ ] Admin scraper page loads
- [ ] Can scrape a test URL successfully
- [ ] Excel export works
- [ ] API keys added and services restarted
- [ ] Services survive reboot: `ssh root@168.231.87.171 "reboot"` (wait 2 min, then check pm2 status)

---

## 🌐 Optional: Set Up Custom Domain

If you have a domain, you can point it to your VPS:

1. **Add A Record**: Point your domain to `168.231.87.171`
2. **Update Nginx**: Edit `/etc/nginx/sites-available/zaytoonz-ngo`
3. **Add SSL**: Use Let's Encrypt `certbot`

Or use the free subdomain: **darkgoldenrod-badger-925553.hostingersite.com**

---

## 📚 Files Reference

All these files are in your project directory:

- `zaytoonz-deploy-20251218-143839.tar.gz` - Your application archive
- `vps-deploy-script.sh` - Automated deployment script
- `docker-compose.production.yml` - Docker configuration (optional)
- `ecosystem.production.config.js` - PM2 configuration
- `nginx.conf` - Nginx configuration (optional)

---

## 🆘 Need Help?

1. **Check Logs**: `pm2 logs`
2. **Check hPanel**: https://hpanel.hostinger.com/
3. **Restart Services**: `pm2 restart all`
4. **Full Reboot**: Restart VPS in hPanel

---

## 🎯 Next Steps

1. **Get VPS root password** from Hostinger hPanel
2. **Download WinSCP** and **PuTTY** for easy file transfer and SSH
3. **Upload the 2 files** to `/tmp/` on your VPS
4. **Run the deployment script**
5. **Test your application**
6. **Add API keys**
7. **Start scraping!**

---

**Everything is ready. You just need to:**
1. Upload 2 files to VPS
2. Run 1 command
3. Your app is live! 🚀


