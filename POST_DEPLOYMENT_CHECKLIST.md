# ✅ Post-Deployment Checklist - beta-zaytoonz.pro

## 🎯 Immediate Next Steps

### 1. **Verify DNS Configuration** ⚠️ CRITICAL
Before setting up SSL, ensure your domain DNS is properly configured:

```bash
# Check if DNS is pointing to your VPS
dig beta-zaytoonz.pro +short
# Should return: 76.13.57.178

# Or use nslookup
nslookup beta-zaytoonz.pro
```

**If DNS is not configured:**
- Go to your domain registrar (where you bought beta-zaytoonz.pro)
- Add an **A Record**:
  - **Name:** `@` or `beta-zaytoonz.pro`
  - **Value:** `76.13.57.178`
  - **TTL:** `3600` (or default)
- Wait 5-30 minutes for DNS propagation

---

### 2. **Set Up SSL Certificate** 🔒
Once DNS is configured, initialize SSL certificates:

```bash
# SSH into your VPS
ssh root@76.13.57.178

# Navigate to application directory
cd /opt/zaytoonz-ngo

# Run SSL initialization
chmod +x init-ssl-beta.sh
./init-ssl-beta.sh
```

**What this does:**
- Requests Let's Encrypt SSL certificate for `beta-zaytoonz.pro`
- Configures automatic renewal
- Enables HTTPS access

**Expected output:**
```
✅ SSL certificate obtained successfully!
🌐 Your site should now be accessible at: https://beta-zaytoonz.pro
```

---

### 3. **Verify Services Are Running** 🚀

```bash
# Check Docker container status
cd /opt/zaytoonz-ngo
docker compose -f docker-compose-beta.yml ps

# Expected output: All containers should show "Up" status
```

**Services to verify:**
- ✅ `zaytoonz-nextjs-beta` - Next.js application
- ✅ `zaytoonz-nginx-beta` - Nginx reverse proxy
- ✅ `zaytoonz-scraper-beta` - Python scraper
- ✅ `zaytoonz-nlweb-beta` - NLWeb service
- ✅ `zaytoonz-certbot-beta` - SSL certificate manager

---

### 4. **Check Service Logs** 📋

```bash
# View all logs
docker compose -f docker-compose-beta.yml logs -f

# View specific service logs
docker compose -f docker-compose-beta.yml logs -f nextjs
docker compose -f docker-compose-beta.yml logs -f nginx
docker compose -f docker-compose-beta.yml logs -f python-scraper
```

**Look for:**
- ✅ No error messages
- ✅ "Ready" or "started" messages
- ✅ Services listening on correct ports

---

### 5. **Test Application Access** 🌐

#### Test HTTP (Port 80):
```bash
# From your local machine
curl -I http://beta-zaytoonz.pro
# Should return: HTTP/1.1 301 Moved Permanently (redirecting to HTTPS)

# Or test via IP
curl -I http://76.13.57.178
```

#### Test HTTPS (Port 443) - After SSL setup:
```bash
curl -I https://beta-zaytoonz.pro
# Should return: HTTP/1.1 200 OK
```

#### Test from Browser:
- Open: `https://beta-zaytoonz.pro`
- Should see the main landing page
- Check browser console for errors (F12)

---

### 6. **Verify Environment Variables** 🔐

```bash
# Check if .env.production has all required values
cd /opt/zaytoonz-ngo
cat .env.production | grep -E "SUPABASE|OPENAI"

# Verify no placeholder values remain
grep -E "your_|YOUR_|TODO" .env.production
# Should return nothing (or only optional fields)
```

**Required variables that must be set:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `NEXT_PUBLIC_OPENAI_API_KEY`

---

### 7. **Test API Endpoints** 🔌

```bash
# Test Next.js health
curl http://localhost:3002/health
# Should return: healthy

# Test Python scraper (if enabled)
curl http://localhost:8000/health
# Should return: {"status":"healthy"} or similar

# Test NLWeb service
curl http://localhost:8002/health
# Should return service status
```

---

### 8. **Monitor Resource Usage** 📊

```bash
# Check Docker resource usage
docker stats

# Check disk space
df -h

# Check memory
free -h

# Check system load
uptime
```

---

## 🎯 Quick Verification Commands

Run these on your VPS to verify everything:

```bash
# 1. Check all containers are running
docker compose -f docker-compose-beta.yml ps

# 2. Check Nginx is serving traffic
curl -I http://localhost

# 3. Check Next.js is responding
curl http://localhost:3002/health

# 4. Check SSL certificate (after setup)
openssl s_client -connect beta-zaytoonz.pro:443 -servername beta-zaytoonz.pro < /dev/null 2>/dev/null | openssl x509 -noout -dates

# 5. View recent logs for errors
docker compose -f docker-compose-beta.yml logs --tail=50 | grep -i error
```

---

## 🚨 Troubleshooting

### If services are not running:

```bash
# Restart all services
cd /opt/zaytoonz-ngo
docker compose -f docker-compose-beta.yml restart

# Or rebuild and restart
docker compose -f docker-compose-beta.yml up -d --build
```

### If SSL certificate fails:

1. **Check DNS:**
   ```bash
   dig beta-zaytoonz.pro +short
   ```

2. **Check ports are open:**
   ```bash
   ufw status
   # Should show: 80/tcp and 443/tcp as ALLOW
   ```

3. **Check Nginx is running:**
   ```bash
   docker compose -f docker-compose-beta.yml ps nginx
   ```

4. **Try SSL setup again:**
   ```bash
   ./init-ssl-beta.sh
   ```

### If application shows errors:

1. **Check Next.js logs:**
   ```bash
   docker compose -f docker-compose-beta.yml logs nextjs
   ```

2. **Verify environment variables:**
   ```bash
   docker compose -f docker-compose-beta.yml exec nextjs env | grep NEXT_PUBLIC
   ```

3. **Rebuild Next.js container:**
   ```bash
   docker compose -f docker-compose-beta.yml up -d --build nextjs
   ```

---

## 📝 Maintenance Commands

### Update Application:
```bash
cd /opt/zaytoonz-ngo
git pull
docker compose -f docker-compose-beta.yml up -d --build
```

### View Logs:
```bash
# All services
docker compose -f docker-compose-beta.yml logs -f

# Specific service
docker compose -f docker-compose-beta.yml logs -f nextjs
```

### Restart Services:
```bash
docker compose -f docker-compose-beta.yml restart
```

### Stop Services:
```bash
docker compose -f docker-compose-beta.yml down
```

### Start Services:
```bash
docker compose -f docker-compose-beta.yml up -d
```

---

## ✅ Success Criteria

Your deployment is successful when:

- [ ] DNS is configured and pointing to 76.13.57.178
- [ ] SSL certificate is installed and working
- [ ] All Docker containers are running
- [ ] Application is accessible at https://beta-zaytoonz.pro
- [ ] No errors in service logs
- [ ] Environment variables are properly configured
- [ ] Services respond to health checks

---

## 🎉 You're Done!

Once all checks pass, your application is live and ready to use!

**Access your application:**
- 🌐 **Main Site:** https://beta-zaytoonz.pro
- 🔧 **Admin Panel:** https://beta-zaytoonz.pro/admin
- 📊 **Dashboard:** https://beta-zaytoonz.pro/dashboard

**Need help?** Check the logs or refer to `VPS_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
