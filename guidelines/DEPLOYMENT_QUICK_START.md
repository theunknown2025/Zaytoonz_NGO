# 🚀 Quick Start - Deploy Zaytoonz NGO to Hostinger

## ⚡ Super Fast Deployment (2 Commands)

### Windows PowerShell
```powershell
cd C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO
.\deploy-hostinger-complete.ps1
```

### Linux/Mac/WSL
```bash
chmod +x deploy-hostinger-complete.sh
./deploy-hostinger-complete.sh
```

That's it! ✅

---

## 📋 What Happens

1. Builds Next.js app
2. Creates deployment archive
3. Uploads to VPS (168.231.87.171)
4. Installs Python dependencies
5. Starts both services with PM2

---

## 🌐 After Deployment

### Access Your App
- **Main App**: http://168.231.87.171:3000
- **Admin Scraper**: http://168.231.87.171:3000/admin/Scraper/extracted
- **Scraper API**: http://168.231.87.171:8000/health

### Update API Keys
```bash
ssh root@168.231.87.171
nano /var/www/zaytoonz-ngo/.env.local
nano /var/www/zaytoonz-ngo/Scrape_Master/.env
pm2 restart all
```

---

## 🔧 First Time Setup

If this is your **first deployment**, run setup first:

```bash
# Upload setup script
scp setup-vps-complete.sh root@168.231.87.171:/tmp/

# Run setup on VPS
ssh root@168.231.87.171 'chmod +x /tmp/setup-vps-complete.sh && /tmp/setup-vps-complete.sh'
```

Then deploy:
```powershell
.\deploy-hostinger-complete.ps1
```

---

## 📊 Useful Commands

```bash
# Check service status
ssh root@168.231.87.171 'pm2 status'

# View logs
ssh root@168.231.87.171 'pm2 logs'

# Restart services
ssh root@168.231.87.171 'pm2 restart all'
```

---

## 🐛 Quick Troubleshooting

### Service won't start?
```bash
ssh root@168.231.87.171 'pm2 logs --lines 50'
```

### Rebuild everything?
```bash
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo && npm run build && pm2 restart all'
```

### Python scraper issues?
```bash
ssh root@168.231.87.171 'cd /var/www/zaytoonz-ngo/Scrape_Master && source venv/bin/activate && pip install -r requirements.txt && cd .. && pm2 restart python-scraper'
```

---

## 📚 Full Documentation

See `HOSTINGER_DEPLOYMENT_COMPLETE.md` for detailed guide.

---

## ✅ Success Checklist

- [ ] App accessible at http://168.231.87.171:3000
- [ ] Scraper health: http://168.231.87.171:8000/health
- [ ] PM2 shows services running
- [ ] Admin scraper page works
- [ ] Can scrape test URL

---

**Need help?** Check logs: `ssh root@168.231.87.171 'pm2 logs'`

