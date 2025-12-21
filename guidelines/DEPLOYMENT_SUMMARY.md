# 🎉 Deployment Package Ready - Zaytoonz NGO

## ✅ What's Been Created

I've prepared a **complete deployment solution** for your Zaytoonz NGO application with special focus on the Admin Scraper functionality.

### 📦 Deployment Files

#### 1. **Automated Deployment Scripts**
- `deploy-hostinger-complete.sh` - Linux/Mac/WSL deployment
- `deploy-hostinger-complete.ps1` - Windows PowerShell deployment
- `setup-vps-complete.sh` - One-time VPS initial setup

#### 2. **Configuration Files**
- `ecosystem.production.config.js` - PM2 config for both Next.js and Python Scraper

#### 3. **Documentation**
- `HOSTINGER_DEPLOYMENT_COMPLETE.md` - Comprehensive 500+ line guide
- `DEPLOYMENT_QUICK_START.md` - Quick reference for fast deployment

---

## 🚀 How to Deploy (Choose One Method)

### Method 1: Automated Deployment (Recommended) ⭐

**For Windows (Your System):**
```powershell
.\deploy-hostinger-complete.ps1
```

**For Linux/Mac/WSL:**
```bash
chmod +x deploy-hostinger-complete.sh
./deploy-hostinger-complete.sh
```

### Method 2: Manual Deployment

See `HOSTINGER_DEPLOYMENT_COMPLETE.md` for step-by-step instructions.

---

## 🎯 What Gets Deployed

### Architecture Overview

```
Hostinger VPS (168.231.87.171)
├── Next.js Application (Port 3000)
│   ├── Main Website
│   ├── Admin Dashboard
│   └── Admin Scraper UI (/admin/Scraper/extracted)
│
├── Python Scraper API (Port 8000)
│   ├── FastAPI/Uvicorn
│   ├── Playwright for web scraping
│   ├── AI Integration (OpenAI/Gemini/DeepSeek)
│   └── Supabase data storage
│
└── Nginx (Port 80)
    └── Reverse proxy to Next.js
```

### Services Managed by PM2

1. **zaytoonz-ngo** - Next.js application
   - Auto-restart on crash
   - Logs to `/var/log/pm2/zaytoonz-ngo-*.log`
   - Memory limit: 1GB

2. **python-scraper** - Python API service
   - Auto-restart on crash
   - Logs to `/var/log/pm2/python-scraper-*.log`
   - Memory limit: 2GB
   - Runs with 2 Uvicorn workers

---

## 🐍 Admin Scraper - Key Features

### What It Does
- ✅ Scrapes NGO opportunity websites
- ✅ Extracts structured data using AI
- ✅ Stores in Supabase database
- ✅ Exports to Excel with filtering
- ✅ Handles JavaScript-heavy sites with Playwright
- ✅ Batch processing of multiple URLs
- ✅ Real-time progress tracking

### How It Works After Deployment

1. **Frontend**: http://168.231.87.171:3000/admin/Scraper/extracted
2. **Backend**: Python API on port 8000
3. **Communication**: Next.js → HTTP POST → Python API → Supabase

### Admin Scraper Endpoints

```bash
# Health check
curl http://168.231.87.171:8000/health

# Scrape a URL
curl -X POST http://168.231.87.171:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.org/jobs", "opportunity_type": "job"}'
```

---

## 🔐 Environment Variables

### Automatically Configured
- ✅ Supabase URL and keys (from your .env.local)
- ✅ Python scraper connection settings
- ✅ Production environment flags

### You Need to Add (After Deployment)
```bash
ssh root@168.231.87.171

# Edit Next.js environment
nano /var/www/zaytoonz-ngo/.env.local
# Add: OPENAI_API_KEY=your-key

# Edit Python scraper environment
nano /var/www/zaytoonz-ngo/Scrape_Master/.env
# Add: OPENAI_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY

# Restart services
pm2 restart all
```

---

## 📊 Post-Deployment Testing

### 1. Test Next.js
```bash
curl http://168.231.87.171:3000
```

### 2. Test Python Scraper
```bash
curl http://168.231.87.171:8000/health
# Expected: {"status": "healthy"}
```

### 3. Test Admin Scraper
1. Open: http://168.231.87.171:3000/admin/Scraper/extracted
2. Try scraping a test URL
3. Verify data appears in the table
4. Test Excel export

### 4. Check PM2 Status
```bash
ssh root@168.231.87.171 'pm2 status'
```

---

## 🔄 Updating Your Deployment

### Quick Updates (Code Changes)
```bash
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
git pull origin main
npm install --production
npm run build
pm2 restart all
```

### Full Redeployment
Just run the deployment script again:
```powershell
.\deploy-hostinger-complete.ps1
```

---

## 🐛 Troubleshooting Quick Reference

### View Logs
```bash
ssh root@168.231.87.171 'pm2 logs'
ssh root@168.231.87.171 'pm2 logs zaytoonz-ngo'
ssh root@168.231.87.171 'pm2 logs python-scraper'
```

### Restart Services
```bash
ssh root@168.231.87.171 'pm2 restart all'
```

### Check Service Status
```bash
ssh root@168.231.87.171 'pm2 status'
```

### Rebuild Next.js
```bash
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo && npm run build && pm2 restart zaytoonz-ngo'
```

### Reinstall Python Dependencies
```bash
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo/Scrape_Master && source venv/bin/activate && pip install -r requirements.txt && pm2 restart python-scraper'
```

---

## ✅ Deployment Checklist

Before deploying:
- [ ] VPS is accessible (ssh root@168.231.87.171)
- [ ] Git changes are committed
- [ ] You're in the project root directory
- [ ] You have VPS root password ready

After deployment:
- [ ] Next.js accessible at http://168.231.87.171:3000
- [ ] Python scraper health check passes
- [ ] PM2 shows both services running
- [ ] Admin scraper page loads
- [ ] Can successfully scrape a test URL
- [ ] Excel export works
- [ ] Update API keys in .env files

---

## 🎯 Next Steps

### Option 1: Deploy Now
Run the deployment script:
```powershell
.\deploy-hostinger-complete.ps1
```

### Option 2: Setup VPS First (If Fresh VPS)
```bash
# Upload setup script
scp setup-vps-complete.sh root@168.231.87.171:/tmp/

# Run setup
ssh root@168.231.87.171 'chmod +x /tmp/setup-vps-complete.sh && /tmp/setup-vps-complete.sh'

# Then deploy
.\deploy-hostinger-complete.ps1
```

---

## 📚 Documentation Structure

1. **DEPLOYMENT_QUICK_START.md** - Start here for fast deployment
2. **HOSTINGER_DEPLOYMENT_COMPLETE.md** - Full comprehensive guide
3. **DEPLOYMENT_SUMMARY.md** - This file (overview)
4. **PYTHON_SCRAPER_DEPLOYMENT.md** - Existing Python scraper docs
5. **DEPLOYMENT_GUIDE.md** - Original deployment guide

---

## 🆘 Getting Help

### Common Issues

**Service won't start?**
- Check logs: `pm2 logs`
- Check if ports are in use: `netstat -tulpn | grep -E '3000|8000'`

**Can't connect to VPS?**
- Verify IP: 168.231.87.171
- Check firewall allows SSH (port 22)

**Python scraper not working?**
- Check Python env: `source venv/bin/activate && python --version`
- Check Playwright: `playwright install chromium`

**Build fails?**
- Clear cache: `rm -rf .next node_modules && npm install`
- Check Node version: Should be 20.x

---

## 🎉 Success!

Once deployed, your application will be:
- ✅ Running 24/7 on Hostinger VPS
- ✅ Auto-restarting on crashes
- ✅ Auto-starting on server reboot
- ✅ Accessible via IP or domain (if configured)
- ✅ Logging all activity for debugging
- ✅ Ready to scrape NGO opportunities!

**Main App**: http://168.231.87.171:3000
**Admin Scraper**: http://168.231.87.171:3000/admin/Scraper/extracted

---

## 🔗 Quick Links

- VPS IP: 168.231.87.171
- VPS Hostname: srv1182909.hstgr.cloud
- App Directory: /var/www/zaytoonz-ngo
- GitHub Repo: https://github.com/theunknown2025/Zaytoonz_NGO

---

**Ready to deploy?** 🚀

```powershell
# Run this command:
.\deploy-hostinger-complete.ps1
```


