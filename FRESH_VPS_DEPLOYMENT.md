# Fresh VPS Deployment Guide - Complete Setup from Scratch

This guide assumes you have a **fresh VPS** with a clean OS installation (Ubuntu/Debian).

---

## 📋 Prerequisites Checklist

- [ ] Fresh VPS with Ubuntu 20.04+ or Debian 11+
- [ ] Root or sudo access
- [ ] SSH access configured
- [ ] Domain name (optional, for production)
- [ ] API Keys ready:
  - Supabase URL and Anon Key
  - OpenAI API Key (if using AI features)

---

## Step 1: Initial VPS Setup

### 1.1 Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### 1.2 Update System
```bash
apt-get update
apt-get upgrade -y
```

### 1.3 Install Essential Tools
```bash
apt-get install -y curl wget git unzip
```

---

## Step 2: Install Docker

### 2.1 Install Docker
```bash
# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc

# Install prerequisites
apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2.2 Start Docker
```bash
systemctl start docker
systemctl enable docker
systemctl status docker
```

**Expected:** Should show `active (running)`

---

## Step 3: Clone Project

### 3.1 Create Project Directory
```bash
mkdir -p /opt/zaytoonz-ngo
cd /opt/zaytoonz-ngo
```

### 3.2 Clone from GitHub
```bash
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git .

# Verify files
ls -la | grep -E "docker-compose|nginx|package.json"
```

**Expected files:**
- `docker-compose.production.yml`
- `nginx.conf`
- `package.json`
- `app/` directory

---

## Step 4: Create Environment File

### 4.1 Create .env File
```bash
cd /opt/zaytoonz-ngo
nano .env
```

### 4.2 Add Environment Variables
Paste the following (replace with your actual values):

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
PYTHONUNBUFFERED=1
```

**Save:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 4.3 Secure .env File
```bash
chmod 600 .env
ls -la .env
```

**Expected:** `-rw------- 1 root root`

---

## Step 5: Verify Configuration Files

### 5.1 Verify docker-compose.production.yml
```bash
cat docker-compose.production.yml
```

**Should see:**
- `nextjs` service with:
  - `image: node:20-alpine`
  - `command: sh -c "npm install --production && npm run build && npm start"`
  - `volumes:` section with:
    - `./:/app`
    - `/app/node_modules`
    - **NO `/app/.next` volume** (removed to allow cache clearing)
  - `restart: unless-stopped` (only once)
  - `depends_on: - python-scraper` (only once)
- `python-scraper` service
- `nginx` service
- `networks: zaytoonz-network`

**Verify no duplicates:**
```bash
# Check for duplicate restart/depends_on in nextjs service
grep -A 10 "nextjs:" docker-compose.production.yml | grep -E "restart|depends_on" | wc -l
# Should return: 2 (one restart, one depends_on)
```

### 5.2 Verify app/page.tsx (Root Page)
```bash
cat app/page.tsx
```

**Should show:**
```typescript
import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';
// NOT LandingPage
```

**Critical:** Must import `ZaytoonzSMLanding`, NOT `LandingPage`

### 5.3 Verify nginx.conf
```bash
cat nginx.conf
```

**Should show:**
- `proxy_pass http://nextjs_backend;` for root location
- Port 80 listener

---

## Step 6: Start Docker Services

### 6.1 Start All Services
```bash
cd /opt/zaytoonz-ngo
docker compose -f docker-compose.production.yml up -d
```

**Expected output:**
```
[+] Running 4/4
 ✔ Network zaytoonz-network    Created
 ✔ Container zaytoonz-scraper                Started
 ✔ Container zaytoonz-nextjs                 Started
 ✔ Container zaytoonz-nginx                  Started
```

### 6.2 Verify Containers Are Running
```bash
docker ps
```

**Expected:** All three containers showing "Up" status

---

## Step 7: Monitor Build Process

### 7.1 Watch Next.js Build
```bash
docker compose -f docker-compose.production.yml logs -f nextjs
```

**What to look for:**
1. `npm install` - Installing dependencies (2-5 minutes)
2. `npm run build` - Building Next.js app (3-10 minutes)
3. `✓ Compiled /page` - Root page compiled
4. `✓ Compiled successfully` - Build complete
5. `> Ready on http://localhost:3000` - Server ready

**Press `Ctrl+C` to exit log view**

### 7.2 Check Python Scraper
```bash
docker compose -f docker-compose.production.yml logs python-scraper | tail -20
```

**What to look for:**
- Chrome installation (first time: 5-10 minutes)
- `INFO: Uvicorn running on http://0.0.0.0:8000`

---

## Step 8: Verify Deployment

### 8.1 Test Services
```bash
# Test Nginx
curl http://localhost

# Test Next.js directly
curl http://localhost:3001

# Test Python scraper
curl http://localhost:8000/docs
```

### 8.2 Verify Root Page Shows SM Page
```bash
# Check if SM page HTML is present
curl http://localhost:3001 | grep -i "zaytoonz-sm-root\|background-slideshow\|social-link"

# Should see SM page elements
```

### 8.3 Test in Browser
Open in browser:
```
http://YOUR_VPS_IP
```

**Expected:**
- ✅ SM Page (social media links)
- ✅ Background slideshow
- ✅ Zaytoonz logo and slogan
- ❌ NOT the full LandingPage

---

## Step 9: Configure Domain (Optional)

### 9.1 DNS Configuration
In your domain DNS manager:

**A Record:**
- Name: `@` (or blank)
- Type: `A`
- Value: `YOUR_VPS_IP`
- TTL: `3600`

**A Record (www):**
- Name: `www`
- Type: `A`
- Value: `YOUR_VPS_IP`
- TTL: `3600`

### 9.2 Update Nginx Server Name (Optional)
```bash
nano nginx.conf
```

Change:
```nginx
server_name _;
```

To:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Restart Nginx:
```bash
docker compose -f docker-compose.production.yml restart nginx
```

---

## Step 10: Final Verification

### 10.1 Container Status
```bash
docker compose -f docker-compose.production.yml ps
```

**All should show "Up":**
- `zaytoonz-nextjs`
- `zaytoonz-scraper`
- `zaytoonz-nginx`

### 10.2 Resource Usage
```bash
docker stats --no-stream
```

### 10.3 Test All Routes
```bash
# Root - should show SM page
curl -I http://localhost:3001

# /app - should show full LandingPage
curl -I http://localhost:3001/app

# /social - should show SM page
curl -I http://localhost:3001/social
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Container Won't Start
```bash
# Check logs
docker compose -f docker-compose.production.yml logs nextjs

# Check if port is in use
netstat -tlnp | grep 80
netstat -tlnp | grep 3001
```

### Issue 2: Build Fails
```bash
# Check if .env file exists
ls -la .env

# Check environment variables
cat .env | grep -E "SUPABASE|OPENAI"

# Rebuild without cache
docker compose -f docker-compose.production.yml build --no-cache nextjs
```

### Issue 3: Wrong Page at Root
```bash
# Verify app/page.tsx
cat app/page.tsx | grep -E "ZaytoonzSMLanding|LandingPage"

# Should show: ZaytoonzSMLanding (NOT LandingPage)

# If wrong, fix it:
nano app/page.tsx
# Change to: import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';

# Rebuild
rm -rf .next
docker compose -f docker-compose.production.yml up -d --build nextjs
```

### Issue 4: Python Scraper Fails
```bash
# Check logs
docker compose -f docker-compose.production.yml logs python-scraper

# First build takes 5-10 minutes (Chrome installation)
# Wait and check again
```

---

## 📝 Post-Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Project cloned from GitHub
- [ ] `.env` file created with all API keys
- [ ] All containers running (`docker ps`)
- [ ] Next.js build completed successfully
- [ ] Root URL shows SM page (not LandingPage)
- [ ] `/app` route shows full LandingPage
- [ ] `/social` route shows SM page
- [ ] Python scraper running on port 8000
- [ ] Nginx proxying correctly
- [ ] Domain configured (if using)
- [ ] Tested in browser

---

## 🚀 Quick Reference Commands

```bash
# Navigate to project
cd /opt/zaytoonz-ngo

# View logs
docker compose -f docker-compose.production.yml logs -f

# Restart services
docker compose -f docker-compose.production.yml restart

# Stop services
docker compose -f docker-compose.production.yml down

# Start services
docker compose -f docker-compose.production.yml up -d

# Rebuild after code changes
rm -rf .next
docker compose -f docker-compose.production.yml up -d --build nextjs

# Update from GitHub
git pull origin main
docker compose -f docker-compose.production.yml up -d --build
```

---

## ✅ Success Indicators

After deployment, you should have:

1. ✅ **Root URL (`/`):** SM Page with social media links
2. ✅ **`/app`:** Full LandingPage with navigation
3. ✅ **`/social`:** SM Page (same as root)
4. ✅ All containers running
5. ✅ No build errors in logs
6. ✅ Application accessible via IP and domain

---

## 📚 Additional Resources

- `HOSTINGER_DOCKER_DEPLOYMENT.md` - Detailed deployment guide
- `ROOT_PAGE_AUDIT.md` - Root page routing audit
- `CLEAR_BUILD_CACHE.md` - Cache clearing guide
- `FIX_ROOT_PAGE.md` - Root page troubleshooting

---

**Deployment Complete!** 🎉

Your Zaytoonz NGO application should now be running on your fresh VPS.
