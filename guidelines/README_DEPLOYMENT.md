# 🚀 Zaytoonz NGO - Hostinger VPS Deployment

## 📦 Complete Deployment Package

This package contains everything needed to deploy your Zaytoonz NGO application (Next.js + Python Scraper) to your Hostinger VPS.

---

## ⚡ Quick Deploy (2 Steps)

### Step 1: First Time Setup (Run Once)

If this is your **first deployment** to a fresh VPS, set it up:

```powershell
# Windows PowerShell
scp setup-vps-complete.sh root@168.231.87.171:/tmp/
ssh root@168.231.87.171
chmod +x /tmp/setup-vps-complete.sh
/tmp/setup-vps-complete.sh
exit
```

**Skip this if VPS is already set up.**

### Step 2: Deploy Application

```powershell
# Windows PowerShell (Your System)
.\deploy-hostinger-complete.ps1
```

Or on Linux/Mac:
```bash
chmod +x deploy-hostinger-complete.sh
./deploy-hostinger-complete.sh
```

**That's it! Your application will be live in 5-10 minutes.** ✅

---

## 🌐 Access Your Application

After deployment:

- **Main Website**: http://168.231.87.171:3000
- **Admin Dashboard**: http://168.231.87.171:3000/admin
- **Admin Scraper**: http://168.231.87.171:3000/admin/Scraper/extracted
- **Scraper API Health**: http://168.231.87.171:8000/health

---

## 📁 What's Included

### Deployment Scripts
| File | Purpose | Use When |
|------|---------|----------|
| `deploy-hostinger-complete.ps1` | Windows deployment | Every deployment |
| `deploy-hostinger-complete.sh` | Linux/Mac deployment | Every deployment |
| `setup-vps-complete.sh` | VPS initial setup | First time only |

### Configuration
| File | Purpose |
|------|---------|
| `ecosystem.production.config.js` | PM2 process manager config |

### Documentation
| File | What's Inside |
|------|---------------|
| `DEPLOYMENT_QUICK_START.md` | Fast reference guide |
| `HOSTINGER_DEPLOYMENT_COMPLETE.md` | Complete 500+ line guide |
| `DEPLOYMENT_SUMMARY.md` | Package overview |
| `README_DEPLOYMENT.md` | This file |

---

## 🎯 What Gets Deployed

### Your VPS Will Run:

```
┌──────────────────────────────────────────┐
│  Hostinger VPS (168.231.87.171)         │
├──────────────────────────────────────────┤
│                                          │
│  🟢 Next.js App (Port 3000)             │
│     - Main website                       │
│     - Admin dashboard                    │
│     - Admin Scraper UI                   │
│                                          │
│  🟢 Python Scraper API (Port 8000)      │
│     - FastAPI + Uvicorn                  │
│     - Playwright web scraping            │
│     - AI extraction (OpenAI/Gemini)      │
│     - Supabase integration               │
│                                          │
│  🟢 Nginx (Port 80)                      │
│     - Reverse proxy                      │
│                                          │
│  🔄 PM2 Process Manager                  │
│     - Auto-restart services              │
│     - Start on server reboot             │
│     - Log management                     │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🐍 Admin Scraper - Special Features

Your admin scraper will be **fully operational** after deployment:

### Capabilities
- ✅ Scrape multiple NGO websites in batch
- ✅ AI-powered data extraction
- ✅ Store structured data in Supabase
- ✅ Export to Excel with advanced filtering
- ✅ Handle JavaScript-heavy websites
- ✅ Real-time scraping status
- ✅ Error handling and retry logic

### Access Admin Scraper
```
http://168.231.87.171:3000/admin/Scraper/extracted
```

### API Endpoints
```bash
# Health check
curl http://168.231.87.171:8000/health

# Scrape a URL
curl -X POST http://168.231.87.171:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.org/opportunities",
    "opportunity_type": "job"
  }'
```

---

## 🔐 Post-Deployment: Add API Keys

After deployment, you need to add your API keys:

```bash
# SSH to VPS
ssh root@168.231.87.171

# Edit Next.js environment
nano /var/www/zaytoonz-ngo/.env.local
# Add your OPENAI_API_KEY

# Edit Python scraper environment
nano /var/www/zaytoonz-ngo/Scrape_Master/.env
# Add OPENAI_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY

# Restart services
pm2 restart all

# Exit
exit
```

---

## 📊 Managing Your Deployment

### Check Status
```bash
ssh root@168.231.87.171 'pm2 status'
```

### View Logs
```bash
# All logs
ssh root@168.231.87.171 'pm2 logs'

# Specific service
ssh root@168.231.87.171 'pm2 logs zaytoonz-ngo'
ssh root@168.231.87.171 'pm2 logs python-scraper'
```

### Restart Services
```bash
ssh root@168.231.87.171 'pm2 restart all'
```

### Update Application
```bash
# Option 1: Redeploy (from local machine)
.\deploy-hostinger-complete.ps1

# Option 2: Git pull (on VPS)
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
git pull origin main
npm install --production
npm run build
pm2 restart all
```

---

## ✅ Post-Deployment Checklist

Verify everything works:

1. [ ] **Next.js works**
   ```bash
   curl http://168.231.87.171:3000
   ```

2. [ ] **Python scraper health**
   ```bash
   curl http://168.231.87.171:8000/health
   # Should return: {"status": "healthy"}
   ```

3. [ ] **PM2 services running**
   ```bash
   ssh root@168.231.87.171 'pm2 status'
   # Both zaytoonz-ngo and python-scraper should be "online"
   ```

4. [ ] **Admin scraper page loads**
   - Visit: http://168.231.87.171:3000/admin/Scraper/extracted

5. [ ] **Test scraping**
   - Try scraping a test URL from admin interface
   - Verify data appears in the table

6. [ ] **Excel export works**
   - Filter some opportunities
   - Click "Export to Excel"
   - Verify Excel file downloads

7. [ ] **API keys added**
   - SSH and add your API keys to .env files
   - Restart services: `pm2 restart all`

---

## 🐛 Troubleshooting

### Application won't start?
```bash
# Check logs
ssh root@168.231.87.171 'pm2 logs --lines 50'

# Rebuild
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo && npm run build && pm2 restart all'
```

### Python scraper not working?
```bash
# Check Python environment
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo/Scrape_Master && source venv/bin/activate && pip list'

# Reinstall dependencies
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo/Scrape_Master && source venv/bin/activate && pip install -r requirements.txt && playwright install chromium'

# Restart
ssh root@168.231.87.171 'pm2 restart python-scraper'
```

### Can't scrape URLs?
1. Check API keys are set in `/var/www/zaytoonz-ngo/Scrape_Master/.env`
2. Check scraper logs: `pm2 logs python-scraper`
3. Test health endpoint: `curl http://localhost:8000/health`

### Port already in use?
```bash
# Check what's using the port
ssh root@168.231.87.171 'netstat -tulpn | grep -E "3000|8000"'

# Kill the process if needed
ssh root@168.231.87.171 'pm2 delete all && pm2 start ecosystem.config.js'
```

---

## 📚 Additional Resources

- **Quick Start Guide**: `DEPLOYMENT_QUICK_START.md`
- **Complete Guide**: `HOSTINGER_DEPLOYMENT_COMPLETE.md`
- **Package Overview**: `DEPLOYMENT_SUMMARY.md`
- **Python Scraper Docs**: `PYTHON_SCRAPER_DEPLOYMENT.md`

---

## 🎉 You're Ready!

Everything is prepared for deployment. Just run:

```powershell
.\deploy-hostinger-complete.ps1
```

The script will:
1. ✅ Build your application
2. ✅ Create deployment archive
3. ✅ Upload to VPS
4. ✅ Install all dependencies
5. ✅ Configure environment
6. ✅ Start services with PM2
7. ✅ Configure auto-restart

**Deployment takes ~5-10 minutes.**

---

## 🔗 Important Links

- **VPS IP**: 168.231.87.171
- **VPS Hostname**: srv1182909.hstgr.cloud
- **App Directory**: /var/www/zaytoonz-ngo
- **GitHub**: https://github.com/theunknown2025/Zaytoonz_NGO

---

## 🆘 Need Help?

1. Check logs: `ssh root@168.231.87.171 'pm2 logs'`
2. Check status: `ssh root@168.231.87.171 'pm2 status'`
3. Review documentation in this package
4. Check VPS resources: `ssh root@168.231.87.171 'free -h && df -h'`

---

**Happy Deploying! 🚀**

Your Zaytoonz NGO application with the powerful Admin Scraper will be live soon!

