# 🚀 Quick Start - Web App Only Deployment

## One-Line Deploy (Windows)

```powershell
.\deploy-webapp.ps1
```

---

## Manual Deploy (3 Commands)

```bash
# 1. Setup
cp webapp-env-vars.txt .env && notepad .env

# 2. Deploy
docker-compose -f docker-compose-webapp.yml up -d

# 3. Check
docker ps && docker logs -f zaytoonz-nextjs
```

---

## What's Included

✅ Next.js Web App  
✅ Nginx Reverse Proxy  
✅ Certbot SSL Manager  

❌ Scraper (Not Included)  
❌ NLWEB (Not Included)  

---

## Access Your Site

- **Local**: http://localhost
- **Direct**: http://localhost:3000
- **External**: http://YOUR_SERVER_IP

---

## Useful Commands

```bash
# View logs
docker logs -f zaytoonz-nextjs

# Restart
docker restart zaytoonz-nextjs

# Stop all
docker-compose -f docker-compose-webapp.yml down

# Check status
docker ps --filter "name=zaytoonz"
```

---

## Troubleshooting

**Can't access site?**
```bash
# Check if containers are running
docker ps

# Check Next.js logs
docker logs zaytoonz-nextjs

# Check Nginx logs
docker logs zaytoonz-nginx

# Restart everything
docker-compose -f docker-compose-webapp.yml restart
```

**Port 80 already in use?**
```powershell
# Windows: Stop IIS/Apache
Stop-Service -Name W3SVC
# Or change port in docker-compose-webapp.yml to 8080:80
```

---

## Files You Need

1. `docker-compose-webapp.yml` - Main config
2. `nginx-webapp.conf` - Nginx config
3. `.env` - Environment variables (create from `webapp-env-vars.txt`)

---

## Before You Deploy

1. ✅ Docker is running
2. ✅ Created `.env` file
3. ✅ Added OpenAI API key to `.env`
4. ✅ Stopped old containers

---

## Full Documentation

- **Complete Guide**: `WEBAPP_DEPLOYMENT_GUIDE.md`
- **Audit Report**: `AUDIT_REPORT_AND_FIXES.md`
- **Original Config**: `docker-compose-hostinger.yml`

---

**Need Help?** Check `WEBAPP_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
