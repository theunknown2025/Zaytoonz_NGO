# Complete Docker Deployment Guide for Hostinger VPS

This is a comprehensive, step-by-step guide to deploy Zaytoonz NGO application on Hostinger VPS using Docker. This guide assumes Docker is already installed on your VPS.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Connect to Your VPS](#step-1-connect-to-your-vps)
3. [Step 2: Verify Docker Installation](#step-2-verify-docker-installation)
4. [Step 3: Prepare Project Directory](#step-3-prepare-project-directory)
5. [Step 4: Upload Project Files](#step-4-upload-project-files)
6. [Step 5: Create Environment File](#step-5-create-environment-file)
7. [Step 6: Start Docker Services](#step-6-start-docker-services)
8. [Step 7: Verify Deployment](#step-7-verify-deployment)
9. [Step 8: Configure Domain (Optional)](#step-8-configure-domain-optional)
10. [Step 9: Common Management Tasks](#step-9-common-management-tasks)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Hostinger VPS** with root/SSH access
- ✅ **Docker** and **Docker Compose** installed on VPS
- ✅ **Domain name** (optional, for production)
- ✅ **API Keys** ready:
  - Supabase URL and Anon Key
  - OpenAI API Key (if using AI features)
- ✅ **Project files** ready to upload

---

## Step 1: Connect to Your VPS

### On your local machine (PowerShell/Command Prompt):

```bash
ssh root@YOUR_VPS_IP
```

**Example:**
```bash
ssh root@168.231.87.171
```

**Expected prompts:**
- First time: Accept the host key fingerprint by typing `yes`
- Enter your root password when prompted

**After successful login, you should see:**
```
Welcome to Ubuntu 22.04 LTS
root@vps-hostname:~#
```

---

## Step 2: Verify Docker Installation

### Check Docker version:

```bash
docker --version
```

**Expected output:**
```
Docker version 24.0.x, build xxxxxxx
```

### Check Docker Compose version:

```bash
docker compose version
```

**Expected output:**
```
Docker Compose version v2.x.x
```

### Verify Docker daemon is running:

```bash
docker ps
```

**Expected output (if no containers running):**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

**If Docker is not running, start it:**
```bash
systemctl start docker
systemctl enable docker
systemctl status docker
```

**Expected status:** `active (running)`

---

## Step 3: Prepare Project Directory

### Create project directory:

```bash
mkdir -p /opt/zaytoonz-ngo
cd /opt/zaytoonz-ngo
pwd
```

**Expected output:**
```
/opt/zaytoonz-ngo
```

### Verify directory is ready:

```bash
ls -la
```

**Expected output (empty directory):**
```
total 8
drwxr-xr-x  2 root root 4096 Jan 15 10:00 .
drwxr-xr-x  3 root root 4096 Jan 15 10:00 ..
```

---

## Step 4: Upload Project Files

You have two options: **Git Clone** (recommended) or **ZIP Upload**.

### Option A: Git Clone (Recommended)

**If your project is on GitHub:**

```bash
cd /opt/zaytoonz-ngo

# Install Git if not already installed
apt-get update
apt-get install -y git

# Clone the repository
git clone https://github.com/YOUR_USERNAME/Zaytoonz_NGO.git .

# Or if repository already exists, pull latest
git pull origin main
```

**Expected output:**
```
Cloning into '.'...
remote: Enumerating objects: X, done.
remote: Counting objects: 100% (X/X), done.
...
```

### Option B: ZIP Upload

**On your local machine (PowerShell):**

```powershell
# Navigate to project folder
cd "C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO"

# Create ZIP (excluding node_modules and .next)
Compress-Archive -Path * -DestinationPath zaytoonz-ngo-deploy.zip -Force
```

**Upload using SFTP/SCP:**

```powershell
# Using SCP (if available)
scp zaytoonz-ngo-deploy.zip root@YOUR_VPS_IP:/opt/zaytoonz-ngo/
```

**Or use WinSCP/FileZilla:**
- Host: `YOUR_VPS_IP`
- User: `root`
- Password: Your VPS password
- Upload to: `/opt/zaytoonz-ngo/`

**On VPS, extract the ZIP:**

```bash
cd /opt/zaytoonz-ngo
unzip zaytoonz-ngo-deploy.zip
rm zaytoonz-ngo-deploy.zip  # Remove ZIP to save space
```

### Verify key files are present:

```bash
cd /opt/zaytoonz-ngo
ls -la | grep -E "(docker-compose|nginx|package.json)"
```

**Expected output:**
```
-rw-r--r--  1 root root  1234 Jan 15 10:00 docker-compose.production.yml
-rw-r--r--  1 root root   567 Jan 15 10:00 nginx.conf
-rw-r--r--  1 root root  8901 Jan 15 10:00 package.json
```

---

## Step 5: Create Environment File

### Create `.env` file:

```bash
cd /opt/zaytoonz-ngo
nano .env
```

### Paste the following content (replace with your actual values):

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

### Save the file:

- Press `Ctrl + O` (write out)
- Press `Enter` to confirm filename
- Press `Ctrl + X` to exit

### Secure the `.env` file:

```bash
chmod 600 .env
ls -la .env
```

**Expected output:**
```
-rw------- 1 root root 567 Jan 15 10:15 .env
```

### Verify file contents (without exposing keys):

```bash
cat .env | grep -E "^[A-Z]" | cut -d'=' -f1
```

**Expected output (variable names only):**
```
OPENAI_API_KEY
NEXT_PUBLIC_OPENAI_API_KEY
OPENAI_MODEL
OPENAI_MAX_TOKENS
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NODE_ENV
PORT
...
```

---

## Step 6: Start Docker Services

### Navigate to project directory:

```bash
cd /opt/zaytoonz-ngo
pwd
```

**Expected output:**
```
/opt/zaytoonz-ngo
```

### Start Docker containers:

```bash
docker compose -f docker-compose.production.yml up -d
```

**Expected output (first time - images will be pulled):**
```
[+] Pulling nextjs (node:20-alpine)...
20-alpine: Pulling from library/node
...
[+] Running 4/4
 ✔ Network zaytoonz-network    Created
 ✔ Container zaytoonz-scraper                Started
 ✔ Container zaytoonz-nextjs                 Started
 ✔ Container zaytoonz-nginx                  Started
```

**Note:** The first startup may take 5-10 minutes as:
- Docker images are downloaded
- Node.js dependencies are installed (`npm install`)
- Next.js app is built (`npm run build`)
- Python scraper dependencies are installed
- Chrome/Playwright are installed in the Python container

### Verify containers are running:

```bash
docker ps
```

**Expected output (all containers should show "Up"):**
```
CONTAINER ID   IMAGE                COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   nginx:alpine         "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp      zaytoonz-nginx
def456ghi789   node:20-alpine       "sh -c 'npm install …"    2 minutes ago   Up 2 minutes   0.0.0.0:3001->3000/tcp  zaytoonz-nextjs
ghi789jkl012   python:3.11-slim    "sh -c 'apt-get updat…"   2 minutes ago   Up 2 minutes   0.0.0.0:8000->8000/tcp zaytoonz-scraper
```

**If any container shows "Exited" or "Restarting", check logs:**
```bash
docker compose -f docker-compose.production.yml logs [service-name]
```

---

## Step 7: Verify Deployment

### Check container logs:

```bash
docker compose -f docker-compose.production.yml logs -f
```

**Press `Ctrl+C` to exit log view.**

**Look for these success messages:**

**Next.js:**
```
nextjs    | ✓ Compiled successfully
nextjs    | > Ready on http://localhost:3000
```

**Python Scraper:**
```
python-scraper  | INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Nginx:**
```
nginx  | /docker-entrypoint.sh: Configuration complete; ready for start up
```

### Test services from VPS:

**Test Nginx:**
```bash
curl http://localhost
```

**Expected output:** HTML content from Next.js app

**Test Next.js directly:**
```bash
curl http://localhost:3001
```

**Expected output:** HTML content

**Test Python scraper:**
```bash
curl http://localhost:8000/docs
```

**Expected output:** FastAPI documentation page (if available)

### Test from your local browser:

**Open in browser:**
```
http://YOUR_VPS_IP
```

**Expected result:**
- You should see the Zaytoonz NGO application
- No connection errors or "502 Bad Gateway"

**If you see "502 Bad Gateway":**
- Wait 2-5 minutes for Next.js build to complete
- Check logs: `docker compose -f docker-compose.production.yml logs nextjs`

---

## Step 8: Configure Domain (Optional)

### DNS Configuration

**In your domain DNS manager (Hostinger hPanel or registrar):**

1. **Add A Record:**
   - **Name:** `@` (or leave blank)
   - **Type:** `A`
   - **Value:** Your VPS IP address (e.g., `168.231.87.171`)
   - **TTL:** `3600` (or default)

2. **Add A Record for www (optional):**
   - **Name:** `www`
   - **Type:** `A`
   - **Value:** Your VPS IP address
   - **TTL:** `3600`

### Verify DNS propagation:

**On your local machine (PowerShell):**
```powershell
nslookup yourdomain.com
```

**Expected output:**
```
Server:  UnKnown
Address:  8.8.8.8

Non-authoritative answer:
Name:    yourdomain.com
Address:  YOUR_VPS_IP
```

**Note:** DNS propagation can take 5 minutes to 48 hours.

### Test domain access:

Once DNS has propagated:
```
http://yourdomain.com
http://www.yourdomain.com
```

Both should load your application.

---

## Step 9: Common Management Tasks

### View Logs

**All services:**
```bash
cd /opt/zaytoonz-ngo
docker compose -f docker-compose.production.yml logs -f
```

**Specific service:**
```bash
docker compose -f docker-compose.production.yml logs -f nextjs
docker compose -f docker-compose.production.yml logs -f nginx
docker compose -f docker-compose.production.yml logs -f python-scraper
```

**Last 50 lines:**
```bash
docker compose -f docker-compose.production.yml logs --tail=50 nextjs
```

### Restart Services

**Restart all services:**
```bash
cd /opt/zaytoonz-ngo
docker compose -f docker-compose.production.yml restart
```

**Restart specific service:**
```bash
docker compose -f docker-compose.production.yml restart nextjs
```

### Stop Services

**Stop all services:**
```bash
docker compose -f docker-compose.production.yml down
```

**Stop and remove volumes (clean slate):**
```bash
docker compose -f docker-compose.production.yml down -v
```

### Start Services

**Start services:**
```bash
docker compose -f docker-compose.production.yml up -d
```

### Update Application

**Pull latest code and rebuild:**
```bash
cd /opt/zaytoonz-ngo

# If using Git
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

### Check Resource Usage

```bash
docker stats
```

**Expected output:**
```
CONTAINER ID   NAME                CPU %     MEM USAGE / LIMIT     MEM %     NET I/O
abc123def456   zaytoonz-nginx      0.01%     5MiB / 2GiB           0.25%     1.2kB / 648B
def456ghi789   zaytoonz-nextjs     2.5%     450MiB / 2GiB          22.5%     15.3kB / 8.1kB
ghi789jkl012   zaytoonz-scraper    1.2%     320MiB / 2GiB          16.0%     2.1kB / 1.5kB
```

### Execute Commands in Container

**Access Next.js container:**
```bash
docker exec -it zaytoonz-nextjs sh
```

**Inside container:**
```bash
# Check files
ls -la /app

# Check environment variables
env | grep -E "NODE|PORT|SUPABASE" | cut -d'=' -f1

# Exit container
exit
```

---

## Troubleshooting

### Issue 1: Container Won't Start

**Symptoms:**
- Container shows "Exited" status
- Container keeps restarting

**Solution:**
```bash
# Check logs
docker compose -f docker-compose.production.yml logs nextjs --tail=100

# Check container status
docker ps -a | grep zaytoonz

# Restart container
docker compose -f docker-compose.production.yml restart nextjs
```

### Issue 2: 502 Bad Gateway

**Symptoms:**
- Browser shows "502 Bad Gateway"
- Nginx is running but can't connect to Next.js

**Solution:**
```bash
# Check if Next.js is still building
docker compose -f docker-compose.production.yml logs nextjs -f

# Wait for "Ready on http://localhost:3000" message

# Test Next.js directly
curl http://localhost:3001

# If Next.js is running, check Nginx configuration
docker exec zaytoonz-nginx nginx -t

# Restart Nginx
docker compose -f docker-compose.production.yml restart nginx
```

### Issue 3: Port Already in Use

**Symptoms:**
- Error: "port is already allocated"
- Container fails to start

**Solution:**
```bash
# Check what's using the port
netstat -tlnp | grep 80
netstat -tlnp | grep 3001
netstat -tlnp | grep 8000

# Stop conflicting service or change port in docker-compose.production.yml
```

### Issue 4: Build Fails

**Symptoms:**
- Next.js build fails
- Missing dependencies errors

**Solution:**
```bash
# Check build logs
docker compose -f docker-compose.production.yml logs nextjs

# Rebuild without cache
docker compose -f docker-compose.production.yml build --no-cache nextjs

# Restart
docker compose -f docker-compose.production.yml up -d
```

### Issue 5: Environment Variables Not Working

**Symptoms:**
- App shows errors about missing environment variables
- API calls fail

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check .env file has all required variables
cat .env | grep -E "SUPABASE|OPENAI|PORT"

# Ensure .env is in same directory as docker-compose.production.yml
pwd
ls -la docker-compose.production.yml .env

# Restart containers
docker compose -f docker-compose.production.yml restart
```

### Issue 6: Python Scraper Not Starting

**Symptoms:**
- Python scraper container exits
- Chrome/Playwright installation fails

**Solution:**
```bash
# Check logs
docker compose -f docker-compose.production.yml logs python-scraper

# The first startup takes longer due to Chrome installation
# Wait 5-10 minutes and check again

# If still failing, check requirements.txt exists
ls -la Scrape_Master/requirements.txt

# Restart scraper
docker compose -f docker-compose.production.yml restart python-scraper
```

### Issue 7: Network Connectivity Issues

**Symptoms:**
- Containers can't communicate
- Nginx can't reach Next.js

**Solution:**
```bash
# Check Docker network
docker network ls
docker network inspect zaytoonz-network

# Verify all containers are on same network
docker ps --format "table {{.Names}}\t{{.Networks}}"

# Recreate network
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d
```

### Issue 8: Git Pull Conflicts

**Symptoms:**
- Error: "Your local changes to the following files would be overwritten by merge"
- Can't pull latest changes from GitHub

**Solution:**

**Option A: Use GitHub version (Recommended if you want the latest updates):**
```bash
cd /opt/zaytoonz-ngo

# Backup your local changes first (just in case)
cp docker-compose.production.yml docker-compose.production.yml.backup

# Discard local changes and use GitHub version
git checkout -- docker-compose.production.yml

# Now pull the latest changes
git pull origin main
```

**Option B: Stash your changes (if you want to keep them for later):**
```bash
cd /opt/zaytoonz-ngo

# Stash your local changes
git stash

# Pull the latest changes
git pull origin main

# If you want to see what you had locally later:
# git stash show -p
```

**Option C: Commit your local changes first (if they're important):**
```bash
cd /opt/zaytoonz-ngo

# See what changes you have
git diff docker-compose.production.yml

# If you want to keep them, commit first
git add docker-compose.production.yml
git commit -m "Local docker-compose changes"

# Then pull (you may need to merge)
git pull origin main
```

**After resolving, verify the file:**
```bash
# Verify the file doesn't have beta path (if that was removed)
grep -i "beta" docker-compose.production.yml

# If nothing is returned, the beta path has been removed successfully
```

### Quick Diagnostic Script

Run this to get a full status report:

```bash
cd /opt/zaytoonz-ngo
echo "=== Container Status ==="
docker ps -a | grep zaytoonz
echo ""
echo "=== Next.js Logs (last 20 lines) ==="
docker compose -f docker-compose.production.yml logs nextjs --tail=20
echo ""
echo "=== Nginx Logs (last 20 lines) ==="
docker compose -f docker-compose.production.yml logs nginx --tail=20
echo ""
echo "=== Testing Next.js Directly ==="
curl -I http://localhost:3001 2>&1 | head -5
echo ""
echo "=== Testing Nginx ==="
curl -I http://localhost 2>&1 | head -5
```

---

## Summary

### Deployment Checklist

- [ ] Connected to VPS via SSH
- [ ] Verified Docker and Docker Compose are installed
- [ ] Created project directory `/opt/zaytoonz-ngo`
- [ ] Uploaded/cloned project files
- [ ] Created `.env` file with all required variables
- [ ] Started Docker containers
- [ ] Verified all containers are running (`docker ps`)
- [ ] Tested application via IP address
- [ ] Configured DNS (if using domain)
- [ ] Tested application via domain

### Quick Reference Commands

```bash
# Navigate to project
cd /opt/zaytoonz-ngo

# Start services
docker compose -f docker-compose.production.yml up -d

# Stop services
docker compose -f docker-compose.production.yml down

# View logs
docker compose -f docker-compose.production.yml logs -f

# Restart services
docker compose -f docker-compose.production.yml restart

# Update application (if no conflicts)
git pull origin main
docker compose -f docker-compose.production.yml up -d --build

# If you get merge conflicts, see Issue 8 in Troubleshooting section
```

### Access Points

- **Web Application:** `http://YOUR_VPS_IP` or `http://yourdomain.com`
- **Next.js Direct:** `http://YOUR_VPS_IP:3001`
- **Python Scraper API:** `http://YOUR_VPS_IP:8000`
- **Scraper API Docs:** `http://YOUR_VPS_IP:8000/docs` (if available)

---

## Next Steps (Optional)

1. **Configure HTTPS/SSL:**
   - Use Let's Encrypt with Certbot
   - Or use Cloudflare for SSL termination

2. **Set up Auto-restart:**
   - Docker containers restart automatically with `restart: unless-stopped`
   - For system-level auto-start, consider adding to systemd

3. **Monitoring:**
   - Set up log rotation
   - Configure monitoring tools (e.g., Prometheus, Grafana)

4. **Backups:**
   - Regular backups of `.env` file
   - Database backups (if using local database)

5. **Firewall Configuration:**
   - Ensure ports 80, 443 are open
   - Consider closing ports 3001, 8000 from external access (use Nginx only)

---

## Support

If you encounter issues not covered in this guide:

1. Check container logs: `docker compose -f docker-compose.production.yml logs`
2. Verify all environment variables are set correctly
3. Ensure Docker has sufficient resources (CPU, RAM, disk space)
4. Check Hostinger VPS resource limits

---

**Deployment completed successfully!** 🎉

Your Zaytoonz NGO application should now be running on your Hostinger VPS.
