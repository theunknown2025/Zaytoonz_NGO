# 🚀 Quick Reference - Enhanced VPS Deployment

## ⚡ One-Page Quick Guide

### 📦 What You Need

1. **Deployment archive**: `zaytoonz-deploy-20251218-143839.tar.gz`
2. **Deployment script**: `vps-deploy-script.sh`
3. **Fresh VPS**: Ubuntu/Debian with root access

---

## 🎯 Deployment in 3 Steps

### Step 1: Upload Files (2 minutes)

Upload to `/tmp/` on your VPS:
- `zaytoonz-deploy-20251218-143839.tar.gz`
- `vps-deploy-script.sh`

### Step 2: Run Script (10-15 minutes)

```bash
ssh root@YOUR_VPS_IP
chmod +x /tmp/vps-deploy-script.sh
sudo /tmp/vps-deploy-script.sh /tmp/zaytoonz-deploy-20251218-143839.tar.gz
```

### Step 3: Add API Keys (2 minutes)

```bash
nano /var/www/zaytoonz-ngo/.env.local
nano /var/www/zaytoonz-ngo/Scrape_Master/.env
pm2 restart all
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Main App** | `http://YOUR_IP` |
| **Admin Scraper** | `http://YOUR_IP:3000/admin/Scraper/extracted` |
| **Scraper API** | `http://YOUR_IP:8000/health` |
| **Direct Next.js** | `http://YOUR_IP:3000` |

---

## 📊 Quick Commands

### Service Management
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart all
pm2 monit               # Live monitoring
```

### System Checks
```bash
free -h                 # Memory
df -h                   # Disk space
systemctl status nginx  # Nginx status
ufw status              # Firewall
```

### Troubleshooting
```bash
pm2 logs --lines 50                    # Recent logs
curl http://localhost:3000             # Test Next.js
curl http://localhost:8000/health      # Test Scraper
nginx -t                               # Test Nginx config
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| **Service won't start** | `pm2 logs` → Check error messages |
| **502 Bad Gateway** | `pm2 status` → Ensure services are online |
| **Port in use** | `netstat -tulpn \| grep PORT` → Kill process |
| **Out of memory** | Add swap space or upgrade VPS |
| **Permission denied** | Run with `sudo` |

---

## ✅ Success Checklist

- [ ] Script completed all 15 phases
- [ ] PM2 shows both services "online"
- [ ] Nginx is active
- [ ] Port 80 accessible
- [ ] Admin scraper page loads
- [ ] API health check passes
- [ ] API keys added
- [ ] Can scrape test URL

---

## 📞 Quick Support

**Logs**: `/var/log/pm2/` and `/var/log/nginx/`  
**Config**: `/var/www/zaytoonz-ngo/`  
**Services**: Managed by PM2 and systemd  

---

**Time to Production: ~15 minutes** 🚀

