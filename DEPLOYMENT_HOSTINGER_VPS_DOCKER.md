## Zaytoonz-NGO Deployment to Hostinger VPS (Docker)

This guide explains how to deploy the Zaytoonz-NGO web application to a Hostinger VPS using Docker and Docker Compose, with the domain `zaytoonz.com`.

Docker is assumed to be **already installed** on the VPS.

---

### Prerequisites

- **Hostinger VPS**
  - Public IP (for example): `168.231.87.171`
  - SSH access as `root` (or another user with sudo privileges)
  - **Docker** and the **Docker Compose plugin** installed

- **Domain**
  - Domain name: `zaytoonz.com`
  - Access to the DNS manager where `zaytoonz.com` is configured (Hostinger or another registrar)

- **Project files**
  - Local copy of the `Zaytoonz_NGO` project (this repository)
  - Ability to upload files to the VPS (SFTP/FTP, Git, or similar)

---

### 1. Configure DNS for `zaytoonz.com`

- **On your domain DNS manager** (Hostinger hPanel or other registrar):
  - **A record**:
    - **Name**: `@`
    - **Value**: VPS IP, for example `168.231.87.171`
  - **A record** (optional but recommended):
    - **Name**: `www`
    - **Value**: VPS IP, for example `168.231.87.171`

- **Notes**
  - DNS propagation can take anywhere from a few minutes to several hours.
  - During propagation, some users may see the old site (or nothing) while others see the new VPS.

---

## Detailed Step-by-Step Commands with Expected Results

This section provides exact commands to run and what output you should expect at each step.

---

### Step 1: Connect to the VPS via SSH

**On your local machine (PowerShell or Command Prompt):**

```bash
ssh root@168.231.87.171
```

**Expected prompts and results:**

```
The authenticity of host '168.231.87.171 (168.231.87.171)' can't be established.
ECDSA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '168.231.87.171' (ECDSA) to the list of known hosts.
root@168.231.87.171's password: [Enter your password: dareTOLEAD@2018]
```

**After successful login, you should see:**

```
Welcome to Ubuntu 22.04 LTS (GNU/Linux 5.x.x-xx-generic x86_64)
...
root@vps-hostname:~#
```

**Verify you're in the right place:**

```bash
whoami
pwd
```

**Expected output:**

```
root
/root
```

---

### Step 2: Verify Docker Installation

**Check Docker version:**

```bash
docker --version
```

**Expected output:**

```
Docker version 24.0.x, build xxxxxxx
```

**Check Docker Compose version:**

```bash
docker compose version
```

**Expected output:**

```
Docker Compose version v2.x.x
```

**Verify Docker daemon is running:**

```bash
docker ps
```

**Expected output (if no containers are running):**

```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

**If you see an error like "Cannot connect to the Docker daemon", Docker may not be running. Start it:**

```bash
systemctl start docker
systemctl enable docker
systemctl status docker
```

**Expected output (status should show "active (running)"):**

```
● docker.service - Docker Application Container Engine
     Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

---

### Step 3: Create Project Directory and Navigate

**Create a directory for the project:**

```bash
mkdir -p /opt/zaytoonz-ngo
cd /opt/zaytoonz-ngo
pwd
```

**Expected output:**

```
/opt/zaytoonz-ngo
```

**Verify the directory is empty (or doesn't exist yet):**

```bash
ls -la
```

**Expected output (if directory is new):**

```
total 8
drwxr-xr-x  2 root root 4096 Jan 15 10:00 .
drwxr-xr-x  3 root root 4096 Jan 15 10:00 ..
```

---

### Step 4: Upload Project Files

**Option A: Using SFTP from local machine (recommended for ZIP upload)**

**On your local Windows machine (PowerShell), navigate to your project folder:**

```powershell
cd "C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO"
```

**Create a ZIP file of the project (excluding node_modules and other build artifacts):**

```powershell
Compress-Archive -Path * -DestinationPath zaytoonz-ngo-deploy.zip -Force
```

**Expected output:**

```
(No output, but file should be created)
```

**Verify ZIP was created:**

```powershell
ls zaytoonz-ngo-deploy.zip
```

**Expected output:**

```
    Directory: C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         1/15/2025  10:05 AM     12345678 zaytoonz-ngo-deploy.zip
```

**Upload using WinSCP, FileZilla, or PowerShell SCP:**

**Using PowerShell (if you have SCP available):**

```powershell
scp zaytoonz-ngo-deploy.zip root@168.231.87.171:/opt/zaytoonz-ngo/
```

**Expected prompts:**

```
root@168.231.87.171's password: [Enter password: dareTOLEAD@2018]
zaytoonz-ngo-deploy.zip                    100%   12MB  2.5MB/s   00:05
```

**Back on the VPS (SSH session), verify the file was uploaded:**

```bash
cd /opt/zaytoonz-ngo
ls -lh
```

**Expected output:**

```
total 12M
-rw-r--r-- 1 root root 12M Jan 15 10:10 zaytoonz-ngo-deploy.zip
```

**Extract the ZIP file:**

```bash
unzip zaytoonz-ngo-deploy.zip
```

**Expected output (sample):**

```
Archive:  zaytoonz-ngo-deploy.zip
   creating: app/
   creating: app/admin/
   creating: app/api/
   inflating: docker-compose.production.yml
   inflating: package.json
   inflating: nginx.conf
   ...
```

**Verify key files are present:**

```bash
ls -la | grep -E "(docker-compose|nginx|package.json)"
```

**Expected output:**

```
-rw-r--r--  1 root root  1234 Jan 15 10:00 docker-compose.production.yml
-rw-r--r--  1 root root   567 Jan 15 10:00 nginx.conf
-rw-r--r--  1 root root  8901 Jan 15 10:00 package.json
```

**Remove the ZIP file to save space:**

```bash
rm zaytoonz-ngo-deploy.zip
ls -lh
```

---

### Step 5: Create and Configure `.env` File

**Create the `.env` file:**

```bash
cd /opt/zaytoonz-ngo
nano .env
```

**In the nano editor, paste the following (replace with your actual keys):**

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
PYTHONUNBUFFERED=1
```

**To save in nano:**
- Press `Ctrl + O` (write out)
- Press `Enter` to confirm filename
- Press `Ctrl + X` to exit

**Expected output after saving:**

```
[ Wrote 16 lines ]
```

**Verify the `.env` file was created:**

```bash
ls -la .env
```

**Expected output:**

```
-rw-r--r-- 1 root root 567 Jan 15 10:15 .env
```

**Secure the `.env` file (restrict permissions):**

```bash
chmod 600 .env
ls -la .env
```

**Expected output:**

```
-rw------- 1 root root 567 Jan 15 10:15 .env
```

**Verify the file contents (without exposing keys):**

```bash
cat .env | grep -E "^[A-Z]" | cut -d'=' -f1
```

**Expected output (just variable names):**

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

### Step 6: Update `docker-compose.production.yml` (Optional but Recommended)

**If you want to use environment variables, edit the compose file:**

```bash
nano docker-compose.production.yml
```

**Update the `nextjs` service environment section to use variables (see detailed instructions in section 4.2 above).**

**After making changes, verify the syntax:**

```bash
docker compose -f docker-compose.production.yml config
```

**Expected output (should show parsed configuration without errors):**

```
services:
  nextjs:
    container_name: zaytoonz-nextjs
    environment:
      NODE_ENV: production
      PORT: '3000'
      OPENAI_API_KEY: sk-proj-your-actual-openai-api-key-here
      ...
  ...
```

**If you see errors, check the YAML syntax and variable names.**

---

### Step 7: Start the Docker Stack

**Navigate to the project directory:**

```bash
cd /opt/zaytoonz-ngo
pwd
```

**Expected output:**

```
/opt/zaytoonz-ngo
```

**Start the containers in detached mode:**

```bash
docker compose -f docker-compose.production.yml up -d
```

**Expected output (first time - images will be pulled):**

```
[+] Running 4/4
 ✔ Network zaytoonz-ngo_zaytoonz-network    Created
 ✔ Container zaytoonz-scraper                Started
 ✔ Container zaytoonz-nextjs                 Started
 ✔ Container zaytoonz-nginx                  Started
```

**Or if images need to be pulled:**

```
[+] Pulling nextjs (node:20-alpine)...
20-alpine: Pulling from library/node
...
[+] Building 0.0s (0/0) finished in 0.0s
[+] Running 4/4
 ✔ Network zaytoonz-ngo_zaytoonz-network    Created
 ✔ Container zaytoonz-scraper                Started
 ✔ Container zaytoonz-nextjs                 Started
 ✔ Container zaytoonz-nginx                  Started
```

**Note:** The first startup may take several minutes as:
- Docker images are downloaded
- Node.js dependencies are installed (`npm install`)
- The Next.js app is built (`npm run build`)
- Python scraper dependencies are installed
- Chrome/Playwright are installed in the Python container

---

### Step 8: Verify Containers Are Running

**Check container status:**

```bash
docker ps
```

**Expected output (all containers should show "Up" status):**

```
CONTAINER ID   IMAGE                COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   nginx:alpine         "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp      zaytoonz-nginx
def456ghi789   node:20-alpine       "sh -c 'npm install …"    2 minutes ago   Up 2 minutes   0.0.0.0:3000->3000/tcp   zaytoonz-nextjs
ghi789jkl012   python:3.11-slim    "sh -c 'apt-get updat…"   2 minutes ago   Up 2 minutes   0.0.0.0:8000->8000/tcp   zaytoonz-scraper
```

**If a container shows "Exited" or "Restarting", check the logs (see Step 9).**

**Check container health (more detailed):**

```bash
docker ps -a
```

**Expected output (STATUS column should show "Up X minutes" for all):**

```
CONTAINER ID   IMAGE                STATUS
abc123def456   nginx:alpine         Up 2 minutes
def456ghi789   node:20-alpine       Up 2 minutes
ghi789jkl012   python:3.11-slim    Up 2 minutes
```

---

### Step 9: Check Container Logs

**View logs for all services (follow mode - press Ctrl+C to exit):**

```bash
docker compose -f docker-compose.production.yml logs -f
```

**Expected output (sample from Next.js container):**

```
nextjs    | > zaytoonz-ngo@1.0.0 build
nextjs    | > next build
nextjs    | 
nextjs    | ▲ Next.js 14.x.x
nextjs    | - Creating an optimized production build
nextjs    | ...
nextjs    | ✓ Compiled successfully
nextjs    | > Ready on http://localhost:3000
```

**Expected output (sample from Python scraper):**

```
python-scraper  | [INFO] Starting uvicorn server
python-scraper  | INFO:     Started server process [1]
python-scraper  | INFO:     Waiting for application startup.
python-scraper  | INFO:     Application startup complete.
python-scraper  | INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Expected output (sample from Nginx):**

```
nginx  | /docker-entrypoint.sh: Configuration complete; ready for start up
nginx  | 2025/01/15 10:20:00 [notice] 1#1: using the "epoll" event method
nginx  | 2025/01/15 10:20:00 [notice] 1#1: nginx/1.25.x
nginx  | 2025/01/15 10:20:00 [notice] 1#1: start worker processes
```

**View logs for a specific service:**

```bash
docker compose -f docker-compose.production.yml logs nextjs
```

**View last 50 lines of logs:**

```bash
docker compose -f docker-compose.production.yml logs --tail=50 nextjs
```

**If you see errors, common issues:**

- **"Cannot find module"** → Dependencies not installed, check `npm install` completed
- **"Port already in use"** → Another service is using port 80/3000/8000
- **"Connection refused"** → Service dependency issue, check `depends_on` in compose file
- **"Permission denied"** → File permission issues, check volume mounts

---

### Step 10: Test the Application

**Test via VPS IP address:**

**On your local machine, open a browser and visit:**

```
http://168.231.87.171
```

**Expected result:**
- You should see the Zaytoonz-NGO landing page
- No connection errors or "This site can't be reached"

**If you see "502 Bad Gateway" or "Connection refused":**
- The Next.js app may still be building (wait 2-5 minutes)
- Check logs: `docker compose logs nextjs`
- Verify Nginx is proxying correctly: `docker compose logs nginx`

**Test individual services (from VPS):**

**Test Nginx directly:**

```bash
curl http://localhost
```

**Expected output (should return HTML):**

```
<!DOCTYPE html>
<html>
<head>...
```

**Test Next.js app directly:**

```bash
curl http://localhost:3000
```

**Expected output (should return HTML or JSON response):**

```
<!DOCTYPE html>
...
```

**Test Python scraper API:**

```bash
curl http://localhost:8000/docs
```

**Expected output (if FastAPI/Uvicorn docs are enabled):**

```
<!DOCTYPE html>
<html>
  <head>
    <title>FastAPI - Swagger UI</title>
...
```

---

### Step 11: Verify Domain Access (After DNS Propagation)

**Check if DNS has propagated:**

**On your local machine (PowerShell):**

```powershell
nslookup zaytoonz.com
```

**Expected output:**

```
Server:  UnKnown
Address:  8.8.8.8

Non-authoritative answer:
Name:    zaytoonz.com
Address:  168.231.87.171
```

**If DNS hasn't propagated yet, you'll see a different IP or "can't find zaytoonz.com".**

**Once DNS is ready, test in browser:**

```
http://zaytoonz.com
http://www.zaytoonz.com
```

**Both should load the application.**

---

### Step 12: Common Management Commands

**Restart all services:**

```bash
cd /opt/zaytoonz-ngo
docker compose -f docker-compose.production.yml restart
```

**Expected output:**

```
[+] Running 3/3
 ✔ Container zaytoonz-nginx      Restarted
 ✔ Container zaytoonz-nextjs     Restarted
 ✔ Container zaytoonz-scraper    Restarted
```

**Stop all services:**

```bash
docker compose -f docker-compose.production.yml down
```

**Expected output:**

```
[+] Running 4/4
 ✔ Container zaytoonz-nginx      Stopped
 ✔ Container zaytoonz-nextjs     Stopped
 ✔ Container zaytoonz-scraper    Stopped
 ✔ Network zaytoonz-ngo_zaytoonz-network    Removed
```

**Start services again:**

```bash
docker compose -f docker-compose.production.yml up -d
```

**Restart a single service:**

```bash
docker compose -f docker-compose.production.yml restart nextjs
```

**View resource usage:**

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

---

### Troubleshooting Commands

**If a container keeps restarting:**

```bash
docker compose -f docker-compose.production.yml logs nextjs --tail=100
```

**Check container exit code:**

```bash
docker ps -a | grep zaytoonz
```

**Inspect a container:**

```bash
docker inspect zaytoonz-nextjs
```

**Execute a command inside a running container:**

```bash
docker exec -it zaytoonz-nextjs sh
```

**Inside the container, you can:**

```bash
# Check if files exist
ls -la /app

# Check environment variables (without exposing secrets)
env | grep -E "NODE|PORT|SUPABASE" | cut -d'=' -f1

# Check if Next.js is running
ps aux | grep node

# Exit container
exit
```

**Check Docker network:**

```bash
docker network ls
docker network inspect zaytoonz-ngo_zaytoonz-network
```

**Expected output should show all three containers connected:**

```
"Containers": {
    "abc123def456...": {
        "Name": "zaytoonz-nginx",
        ...
    },
    "def456ghi789...": {
        "Name": "zaytoonz-nextjs",
        ...
    },
    "ghi789jkl012...": {
        "Name": "zaytoonz-scraper",
        ...
    }
}
```

---

## 🔧 Troubleshooting: 502 Bad Gateway Error

If you're seeing **"502 Bad Gateway"** from Nginx, it means Nginx is running but cannot connect to the Next.js application. Follow these steps to diagnose and fix:

### Step 1: Check Container Status

**On your VPS, check if all containers are running:**

```bash
cd /opt/zaytoonz-ngo
docker ps -a
```

**Expected output (all should show "Up"):**

```
CONTAINER ID   IMAGE                STATUS
abc123def456   nginx:alpine         Up 2 minutes
def456ghi789   node:20-alpine       Up 2 minutes
ghi789jkl012   python:3.11-slim    Up 2 minutes
```

**If `zaytoonz-nextjs` shows "Exited" or "Restarting":**
- The Next.js app failed to start or crashed
- Proceed to Step 2 to check logs

**If `zaytoonz-nextjs` is not in the list:**
- The container never started
- Run: `docker compose -f docker-compose.production.yml up -d`

---

### Step 2: Check Next.js Container Logs

**View the Next.js container logs to see what's wrong:**

```bash
docker compose -f docker-compose.production.yml logs nextjs --tail=100
```

**Common issues and solutions:**

#### Issue A: "npm install" is still running or failed

**Expected log output (if still building):**
```
nextjs    | npm WARN deprecated...
nextjs    | npm install --production
nextjs    | [still installing packages...]
```

**Solution:** Wait 2-5 minutes for `npm install` to complete. Check logs again:
```bash
docker compose -f docker-compose.production.yml logs nextjs -f
```

**If npm install failed:**
- Check for network issues or package registry problems
- Verify the `package.json` file is present: `ls -la package.json`

#### Issue B: "npm run build" failed

**Expected log output (build error):**
```
nextjs    | > next build
nextjs    | Error: Cannot find module 'xyz'
nextjs    | or
nextjs    | Error: ENOENT: no such file or directory
```

**Solution:**
1. Check if all dependencies are in `package.json`
2. Try rebuilding:
   ```bash
   docker compose -f docker-compose.production.yml restart nextjs
   docker compose -f docker-compose.production.yml logs nextjs -f
   ```

#### Issue C: Next.js app started but on wrong port

**Expected log output (if running):**
```
nextjs    | > Ready on http://localhost:3000
nextjs    | or
nextjs    | > Ready on http://0.0.0.0:3000
```

**If you see a different port or "EADDRINUSE" error:**
- Check the `PORT` environment variable in `.env` file
- Verify it's set to `3000`

#### Issue D: Environment variables missing

**Expected log output (missing env vars):**
```
nextjs    | Error: NEXT_PUBLIC_SUPABASE_URL is not defined
nextjs    | or
nextjs    | Error: OPENAI_API_KEY is required
```

**Solution:**
1. Verify `.env` file exists: `ls -la .env`
2. Check `.env` file has all required variables:
   ```bash
   cat .env | grep -E "SUPABASE|OPENAI|PORT"
   ```
3. Ensure `.env` file is in the same directory as `docker-compose.production.yml`
4. Restart the container:
   ```bash
   docker compose -f docker-compose.production.yml restart nextjs
   ```

---

### Step 3: Test Next.js App Directly

**From inside the VPS, test if Next.js is responding on port 3000:**

```bash
curl http://localhost:3000
```

**Expected output (if working):**
```
<!DOCTYPE html>
<html>
<head>...
```

**If you get "Connection refused":**
- Next.js is not running or not listening on port 3000
- Check logs (Step 2) to see why it didn't start

**If you get HTML response:**
- Next.js is working correctly
- The issue is with Nginx configuration or network connectivity
- Proceed to Step 4

---

### Step 4: Check Nginx Configuration

**Verify Nginx can reach the Next.js container:**

```bash
docker exec zaytoonz-nginx ping -c 2 zaytoonz-nextjs
```

**Expected output:**
```
PING zaytoonz-nextjs (172.x.x.x): 56 data bytes
64 bytes from 172.x.x.x: seq=0 ttl=64 time=0.xxx ms
64 bytes from 172.x.x.x: seq=1 ttl=64 time=0.xxx ms
```

**If ping fails:**
- Network connectivity issue between containers
- Check Docker network: `docker network inspect zaytoonz-ngo_zaytoonz-network`

**Test if Nginx can proxy to Next.js:**

```bash
docker exec zaytoonz-nginx wget -O- http://nextjs:3000 2>&1 | head -20
```

**Expected output (if working):**
```
Connecting to nextjs:3000...
<!DOCTYPE html>
...
```

**If this fails:**
- Check `nginx.conf` file for correct upstream configuration
- Verify the upstream is set to `nextjs:3000` (not `localhost:3000`)

---

### Step 5: Check Nginx Logs

**View Nginx error logs:**

```bash
docker compose -f docker-compose.production.yml logs nginx --tail=50
```

**Common Nginx error messages:**

**"upstream timed out":**
- Next.js is taking too long to respond
- Next.js might still be building
- Solution: Wait for build to complete, then restart Nginx:
  ```bash
  docker compose -f docker-compose.production.yml restart nginx
  ```

**"connect() failed (111: Connection refused)":**
- Nginx cannot connect to Next.js
- Next.js container is not running or not listening
- Solution: Check Step 2 (Next.js logs)

**"upstream prematurely closed connection":**
- Next.js crashed or restarted
- Solution: Check Next.js logs and restart:
  ```bash
  docker compose -f docker-compose.production.yml restart nextjs
  ```

---

### Step 6: Verify Docker Network

**Check if all containers are on the same network:**

```bash
docker network inspect zaytoonz-ngo_zaytoonz-network
```

**Expected output should show all three containers:**

```json
"Containers": {
    "abc123...": {
        "Name": "zaytoonz-nginx"
    },
    "def456...": {
        "Name": "zaytoonz-nextjs"
    },
    "ghi789...": {
        "Name": "zaytoonz-scraper"
    }
}
```

**If a container is missing:**
- Recreate the stack:
  ```bash
  docker compose -f docker-compose.production.yml down
  docker compose -f docker-compose.production.yml up -d
  ```

---

### Step 7: Quick Fix - Restart Everything

**If you're still getting 502 after checking the above, try a full restart:**

```bash
cd /opt/zaytoonz-ngo
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d
```

**Wait 2-3 minutes for the Next.js build to complete, then check logs:**

```bash
docker compose -f docker-compose.production.yml logs nextjs -f
```

**Look for:**
- `✓ Compiled successfully`
- `> Ready on http://localhost:3000` or `> Ready on http://0.0.0.0:3000`

**Once you see "Ready", test in browser:**
- Visit `http://168.231.87.171` or `http://zaytoonz.com`

---

### Step 8: Verify Nginx Configuration File

**Check if `nginx.conf` exists and is correct:**

```bash
ls -la nginx.conf
cat nginx.conf
```

**The nginx.conf should have an upstream pointing to `nextjs:3000`:**

```nginx
upstream nextjs {
    server nextjs:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://nextjs;
        ...
    }
}
```

**If the upstream is set to `localhost:3000` or `127.0.0.1:3000`:**
- This is wrong for Docker containers
- Update it to `nextjs:3000` (the container name)
- Restart Nginx:
  ```bash
  docker compose -f docker-compose.production.yml restart nginx
  ```

---

### Common Solutions Summary

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| 502 Bad Gateway | Next.js still building | Wait 2-5 minutes, check logs |
| 502 Bad Gateway | Next.js container exited | Check logs, fix errors, restart |
| 502 Bad Gateway | Wrong Nginx upstream | Update `nginx.conf` to use `nextjs:3000` |
| 502 Bad Gateway | Missing environment variables | Verify `.env` file exists and has all keys |
| 502 Bad Gateway | Network connectivity issue | Recreate Docker network, restart stack |
| 502 Bad Gateway | Port conflict | Check if port 3000 is already in use |

---

### Still Getting 502?

**Run this diagnostic script on your VPS:**

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
curl -I http://localhost:3000 2>&1 | head -5
echo ""
echo "=== Testing Nginx ==="
curl -I http://localhost 2>&1 | head -5
```

**Share the output** and we can diagnose further.

---

### 2. Connect to the VPS via SSH

- From your local machine (PowerShell, terminal, etc.):

  ```bash
  ssh root@168.231.87.171
  ```

- Verify Docker is available:

  ```bash
  docker --version
  docker compose version
  ```

If both commands work, Docker and Docker Compose are correctly installed.

---

### 3. Upload the project to the VPS

You can either **clone from Git** (if the project is in a repository) or **upload a ZIP**.

- **Option A: Git (if applicable)**
  - On the VPS:

    ```bash
    cd /opt
    git clone <YOUR_REPOSITORY_URL> zaytoonz-ngo
    cd zaytoonz-ngo
    ```

- **Option B: ZIP upload (works with the existing local project folder)**
  - On your local machine:
    - Compress the `Zaytoonz_NGO` folder into a `.zip` file.
  - Use an SFTP/FTP client (e.g. WinSCP, FileZilla) to connect:
    - **Host**: `168.231.87.171`
    - **User**: `root`
    - **Password**: (your VPS root password)
  - Upload the ZIP file to a directory on the VPS, for example:
    - `/opt/zaytoonz-ngo.zip`
  - On the VPS:

    ```bash
    cd /opt
    mkdir -p zaytoonz-ngo
    mv zaytoonz-ngo.zip zaytoonz-ngo/
    cd zaytoonz-ngo
    unzip zaytoonz-ngo.zip
    ```

- **Target directory**
  - After upload/extraction, ensure that the directory where you end up has:
    - `docker-compose.production.yml`
    - `nginx.conf`
    - `package.json`
    - The `app/` folder and other project files

This directory will be used as the working directory for Docker Compose.

---

### 4. Configure environment variables and secrets

The `docker-compose.production.yml` file defines services such as:

- **Next.js application** (`nextjs`)
- **Python scraper** (`python-scraper`)
- **Nginx reverse proxy** (`nginx`)

**Important**: The application requires several API keys, including:
- **OpenAI API key** (`OPENAI_API_KEY` and `NEXT_PUBLIC_OPENAI_API_KEY`)
- **Supabase URL and keys** (already in the compose file, but should be moved to `.env` for security)

#### Step 4.1: Create a `.env` file on the VPS

**Do NOT hardcode API keys directly in `docker-compose.production.yml`**. Instead, use a `.env` file:

1. **On the VPS**, in the project directory (e.g., `/opt/zaytoonz-ngo`), create a `.env` file:

   ```bash
   cd /opt/zaytoonz-ngo   # adjust path if different
   nano .env
   ```

2. **Add the following environment variables** (replace placeholder values with your actual keys):

   ```bash
   # OpenAI API Configuration
   OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
   NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_MAX_TOKENS=2000

   # Supabase Configuration (move from docker-compose.production.yml for better security)
   NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

   # Application Configuration
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
   NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
   NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
   ```

3. **Save the file** (in `nano`: press `Ctrl+X`, then `Y`, then `Enter`).

4. **Secure the `.env` file** (restrict read access):

   ```bash
   chmod 600 .env
   ```

#### Step 4.2: Update `docker-compose.production.yml` to use the `.env` file

**Current state**: The compose file has some values hardcoded. For better security, you should:

- **Option A (Recommended)**: Update `docker-compose.production.yml` to reference environment variables from the `.env` file using `${VARIABLE_NAME}` syntax.

- **Option B (Quick start)**: Keep the current hardcoded values for now, but add the OpenAI keys to the `.env` file and reference them in the compose file.

---

##### Option A: Full migration to environment variables (Recommended)

This approach moves all sensitive values from the compose file to the `.env` file, making the compose file safe to commit to version control.

**How Docker Compose reads `.env` files:**

- Docker Compose automatically looks for a `.env` file in the same directory as `docker-compose.production.yml`.
- Variables defined in `.env` can be referenced in the compose file using `${VARIABLE_NAME}` syntax.
- You can also provide default values using `${VARIABLE_NAME:-default_value}` syntax.

**Step-by-step changes to `docker-compose.production.yml`:**

1. **Update the `nextjs` service environment section:**

   **Before (hardcoded values):**
   ```yaml
   environment:
     - NODE_ENV=production
     - PORT=3000
     - NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     - NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
     - NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
     - NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
   ```

   **After (using environment variables):**
   ```yaml
   environment:
     - NODE_ENV=${NODE_ENV:-production}
     - PORT=${PORT:-3000}
     - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
     - OPENAI_API_KEY=${OPENAI_API_KEY}
     - NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}
     - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
     - OPENAI_MAX_TOKENS=${OPENAI_MAX_TOKENS:-2000}
     - NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=${NEXT_PUBLIC_USE_EXTERNAL_SCRAPER:-true}
     - NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=${NEXT_PUBLIC_EXTERNAL_SCRAPER_URL:-http://python-scraper:8000}
     - NEXT_PUBLIC_FALLBACK_TO_LOCAL=${NEXT_PUBLIC_FALLBACK_TO_LOCAL:-true}
   ```

   **Explanation:**
   - `${VARIABLE_NAME}` reads the value from `.env` (required).
   - `${VARIABLE_NAME:-default}` uses the default if the variable is missing (optional with fallback).

2. **Update the `python-scraper` service environment section:**

   **Before (hardcoded values):**
   ```yaml
   environment:
     - PYTHONUNBUFFERED=1
     - NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **After (using environment variables):**
   ```yaml
   environment:
     - PYTHONUNBUFFERED=${PYTHONUNBUFFERED:-1}
     - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
     - OPENAI_API_KEY=${OPENAI_API_KEY}
   ```

   **Note:** The Python scraper may also need the OpenAI API key if it uses OpenAI models. Check your `Scrape_Master/assets.py` or scraper code to confirm which environment variables it expects.

3. **Complete example of updated `docker-compose.production.yml`:**

   Here's what the full updated environment sections would look like:

   ```yaml
   services:
     nextjs:
       # ... other configuration ...
       environment:
         - NODE_ENV=${NODE_ENV:-production}
         - PORT=${PORT:-3000}
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}
         - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
         - OPENAI_MAX_TOKENS=${OPENAI_MAX_TOKENS:-2000}
         - NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=${NEXT_PUBLIC_USE_EXTERNAL_SCRAPER:-true}
         - NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=${NEXT_PUBLIC_EXTERNAL_SCRAPER_URL:-http://python-scraper:8000}
         - NEXT_PUBLIC_FALLBACK_TO_LOCAL=${NEXT_PUBLIC_FALLBACK_TO_LOCAL:-true}
       # ... rest of configuration ...

     python-scraper:
       # ... other configuration ...
       environment:
         - PYTHONUNBUFFERED=${PYTHONUNBUFFERED:-1}
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - OPENAI_API_KEY=${OPENAI_API_KEY}
       # ... rest of configuration ...
   ```

**Benefits of this approach:**

- ✅ **Security**: No secrets in version control - the compose file can be safely committed.
- ✅ **Flexibility**: Change API keys or configuration without editing the compose file.
- ✅ **Environment-specific**: Use different `.env` files for development, staging, and production.
- ✅ **Maintainability**: Clear separation between configuration (compose file) and secrets (`.env` file).

**Important notes:**

- The `.env` file must be in the same directory as `docker-compose.production.yml`.
- Variable names in `.env` are case-sensitive and should match exactly (e.g., `OPENAI_API_KEY` not `openai_api_key`).
- If a variable is missing from `.env` and no default is provided (e.g., `${OPENAI_API_KEY}`), Docker Compose will substitute an empty string, which may cause errors.
- Use defaults (e.g., `${PORT:-3000}`) for non-sensitive values that rarely change.

---

##### Option B: Quick start (minimal changes)

If you want to deploy quickly and only add the OpenAI API key for now:

1. **Add only the OpenAI variables to the `nextjs` service:**

   ```yaml
   environment:
     - NODE_ENV=production
     - PORT=3000
     - OPENAI_API_KEY=${OPENAI_API_KEY}
     - NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}
     - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
     - NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     # ... rest of existing variables
   ```

2. **Keep other values hardcoded** (you can migrate them later for better security).

**Note**: Docker Compose automatically loads variables from a `.env` file in the same directory, so `${OPENAI_API_KEY}` will be replaced with the value from your `.env` file.

#### Step 4.3: Verify your `.env` file is not committed to Git

- Ensure `.env` is listed in `.gitignore` (it should be by default).
- Never commit `.env` files containing real API keys to version control.

**Summary**: Create the `.env` file with your OpenAI API key and other secrets, then reference them in `docker-compose.production.yml` using `${VARIABLE_NAME}` syntax. This keeps secrets out of version control and makes them easier to manage.

---

### 5. Start the Docker stack

From the project directory on the VPS (the one containing `docker-compose.production.yml`):

- **Option 1 – Use the production file directly**

  ```bash
  cd /opt/zaytoonz-ngo   # adjust path if different
  docker compose -f docker-compose.production.yml up -d
  ```

- **Option 2 – Rename to the default filename**
  - Rename `docker-compose.production.yml` to `docker-compose.yml`:

    ```bash
    mv docker-compose.production.yml docker-compose.yml
    docker compose up -d
    ```

- **What this does**
  - Pulls or builds the necessary Docker images.
  - Starts the:
    - Next.js app container
    - Python scraper container
    - Nginx container
  - Runs them in the background (`-d` = detached mode).

- **Verify containers are running**

  ```bash
  docker ps
  ```

You should see containers for the Next.js app, Python scraper, and Nginx all in the `Up` state.

---

### 6. Verify the application

- **Via VPS IP**
  - In a browser, open:
    - `http://168.231.87.171`
  - If Nginx is configured correctly, you should see the Zaytoonz-NGO application.

- **Via domain**
  - Once DNS has propagated and the A records point to the VPS:
    - `http://zaytoonz.com`
    - `http://www.zaytoonz.com`
  - Both should resolve to the VPS and serve the application via Nginx.

If you see errors:

- Check container logs (see next section).
- Ensure the Nginx configuration matches the actual domain and upstream ports used by the Next.js app.

---

### 7. Checking logs and managing containers

- **View logs for all services** (foreground, streaming):

  ```bash
  cd /opt/zaytoonz-ngo   # adjust path if needed
  docker compose logs -f
  ```

- **View logs for a specific service** (for example, the Next.js app):

  ```bash
  docker compose logs -f nextjs
  ```

- **Restart the stack**:

  ```bash
  docker compose down
  docker compose up -d
  ```

- **Restart a single service** (example: Nginx):

  ```bash
  docker compose restart nginx
  ```

These commands are useful if you change configuration, update images, or need to troubleshoot issues.

---

### 8. HTTPS / SSL (recommended)

Serving the site over HTTPS is strongly recommended for production.

There are multiple ways to add HTTPS:

- **Use a reverse proxy or CDN in front of the VPS**
  - For example, Cloudflare can terminate HTTPS and forward traffic to the VPS over HTTP.

- **Extend the Nginx Docker setup to use Let’s Encrypt**
  - This typically involves:
    - Adding Certbot or a Let’s Encrypt companion container.
    - Updating Nginx configuration to use the generated certificates.

The exact HTTPS setup depends on your preferred tooling and is not fully covered in this document, but once SSL is configured correctly you should be able to access:

- `https://zaytoonz.com`
- `https://www.zaytoonz.com`

---

### 9. Updating the application

To deploy a new version of the application:

- **Step 1: Update the project files**
  - Pull the latest changes from Git **or**
  - Upload an updated ZIP and extract/overwrite the existing project directory.

- **Step 2: Rebuild and restart containers**

  ```bash
  cd /opt/zaytoonz-ngo   # adjust path if needed
  docker compose down
  docker compose -f docker-compose.production.yml up -d --build
  ```

- **Step 3: Verify**
  - Check logs and open `https://zaytoonz.com` (or `http://` if HTTPS is not yet configured) to confirm the new version is live.

---

### Summary

- **DNS**: Point `zaytoonz.com` (and optionally `www.zaytoonz.com`) to the Hostinger VPS IP.
- **VPS**: Connect via SSH, ensure Docker and Docker Compose are installed.
- **Project**: Upload or clone `Zaytoonz_NGO` to the VPS.
- **Docker**: Use `docker-compose.production.yml` (or renamed `docker-compose.yml`) to start the Next.js, Python scraper, and Nginx services.
- **Access**: Test via IP, then via `zaytoonz.com` once DNS has propagated.

This document should be enough to repeatedly deploy and manage the Zaytoonz-NGO application on the Hostinger VPS using Docker.

