# 🚀 Hostinger Deployment - Quick Reference

## 📋 Initial Setup (One-Time)

### 1. Upload Setup Script to VPS
```bash
# On your local machine, upload the script
scp hostinger-setup.sh root@your-vps-ip:/tmp/

# SSH into VPS
ssh root@your-vps-ip

# Make executable and run
chmod +x /tmp/hostinger-setup.sh
bash /tmp/hostinger-setup.sh
```

### 2. Configure Environment Variables
```bash
nano /var/www/zaytoonz-ngo/.env.local
# Edit with your actual values, then save
```

### 3. Install SSL Certificate
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d zaytoonz.com -d www.zaytoonz.com
```

---

## 🔄 Daily Operations

### Update Application (After Git Push)
```bash
# Option 1: Use update script
scp hostinger-update.sh root@your-vps-ip:/tmp/
ssh root@your-vps-ip "chmod +x /tmp/hostinger-update.sh && bash /tmp/hostinger-update.sh"

# Option 2: Manual update
ssh root@your-vps-ip
cd /var/www/zaytoonz-ngo
git pull origin main
npm install --production
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
pm2 restart zaytoonz-test --update-env
```

---

## 🛠️ Common Commands

### PM2 Management
```bash
pm2 status                    # Check status
pm2 logs zaytoonz-test        # View logs
pm2 restart zaytoonz-test     # Restart app
pm2 stop zaytoonz-test        # Stop app
pm2 delete zaytoonz-test      # Remove app
pm2 monit                     # Monitor resources
```

### Nginx Management
```bash
nginx -t                      # Test config
systemctl reload nginx        # Reload (no downtime)
systemctl restart nginx      # Restart
systemctl status nginx        # Check status
tail -f /var/log/nginx/error.log  # View errors
```

### Application
```bash
cd /var/www/zaytoonz-ngo      # Go to app directory
npm run build                 # Rebuild
cat .env.local                # View environment
```

---

## 🔍 Troubleshooting

### App Not Starting
```bash
pm2 logs zaytoonz-test --lines 50
pm2 restart zaytoonz-test
```

### 502 Bad Gateway
```bash
pm2 status                    # Check if app is running
tail -f /var/log/nginx/error.log
nginx -t                      # Test config
```

### Check Port
```bash
netstat -tulpn | grep 3001
```

### View All Logs
```bash
# PM2 logs
pm2 logs zaytoonz-test

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## 📍 Important Paths

- **App Directory:** `/var/www/zaytoonz-ngo`
- **Coming Soon Page:** `/var/www/zaytoonz`
- **Environment File:** `/var/www/zaytoonz-ngo/.env.local`
- **Nginx Config:** `/etc/nginx/sites-available/zaytoonz`
- **PM2 Logs:** `/var/log/pm2/`

---

## 🌐 URLs

- **Coming Soon:** `https://zaytoonz.com`
- **Your App:** `https://zaytoonz.com/test`

---

## ✅ Quick Health Check

```bash
# Run all checks
echo "=== PM2 Status ===" && pm2 status && \
echo "=== Nginx Status ===" && systemctl status nginx --no-pager && \
echo "=== App Response ===" && curl -s http://localhost:3001/test | head -20
```

---

## 🔐 Security

### Firewall Setup
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### Update System
```bash
apt update && apt upgrade -y
```

---

## 📞 Emergency Commands

### Complete Restart
```bash
pm2 restart zaytoonz-test
systemctl restart nginx
```

### Rebuild Everything
```bash
cd /var/www/zaytoonz-ngo
rm -rf .next node_modules
npm install --production
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
pm2 restart zaytoonz-test
```

### Check Everything
```bash
pm2 status && \
systemctl status nginx && \
curl -I http://localhost:3001/test && \
nginx -t
```

