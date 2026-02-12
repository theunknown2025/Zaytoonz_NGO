# Web App Only - Deployment Guide

This deployment configuration includes **ONLY the Next.js web application** with Nginx reverse proxy. The Scraper and NLWEB services are excluded.

## 🎯 What's Included

✅ **Next.js App** - Your main web application  
✅ **Nginx** - Reverse proxy with proper configuration  
✅ **Certbot** - SSL certificate management (optional)  

❌ **Scraper Service** - Not included  
❌ **NLWEB Service** - Not included  

## 📋 Prerequisites

- Docker and Docker Compose installed
- Your application code in the project directory
- Environment variables configured (see below)

## 🚀 Quick Start

### 1. Stop Current Deployment (if running)

```bash
# Stop all existing containers
docker-compose -f docker-compose-hostinger.yml down

# Or stop specific containers
docker stop zaytoonz-nextjs zaytoonz-nginx zaytoonz-scraper zaytoonz-nlweb zaytoonz-certbot
docker rm zaytoonz-nextjs zaytoonz-nginx zaytoonz-scraper zaytoonz-nlweb zaytoonz-certbot
```

### 2. Create Required Directories

```bash
# Create certbot directories for SSL
mkdir -p certbot/conf certbot/www
```

### 3. Configure Environment Variables

Copy the contents from `webapp-env-vars.txt` and:

**Option A: Create `.env` file** (for local deployment)
```bash
# Copy the template
cp webapp-env-vars.txt .env

# Edit the file and add your actual OpenAI API key
# Replace: YOUR_OPENAI_API_KEY_HERE
```

**Option B: Use Hostinger's Environment Variables** (for Hostinger deployment)
1. Go to Hostinger Docker Compose panel
2. Paste all environment variables from `webapp-env-vars.txt`
3. Update `YOUR_OPENAI_API_KEY_HERE` with your actual API key

### 4. Deploy the Web App

**Local Deployment:**
```bash
docker-compose -f docker-compose-webapp.yml up -d
```

**Hostinger Deployment:**
1. Copy contents of `docker-compose-webapp.yml` into Hostinger's YAML editor
2. Paste environment variables from `webapp-env-vars.txt`
3. Click "Deploy"

### 5. Verify Deployment

```bash
# Check running containers
docker ps

# Check Next.js logs
docker logs -f zaytoonz-nextjs

# Check Nginx logs
docker logs -f zaytoonz-nginx

# Test the application
curl http://localhost
# or
curl http://your-server-ip
```

## 🔧 Configuration Details

### Port Mappings

| Service | Host Port | Container Port | Description |
|---------|-----------|----------------|-------------|
| Next.js | 3000 | 3000 | Web application |
| Nginx | 80 | 80 | HTTP access |
| Nginx | 443 | 443 | HTTPS access |

### Network

All services run on the `webapp-network` Docker bridge network.

### Volumes

- **Next.js:**
  - `./` → `/app` (application code)
  - `/app/node_modules` (anonymous volume)
  - `/app/.next` (anonymous volume)
- **Nginx:**
  - `./nginx-webapp.conf` → `/etc/nginx/nginx.conf`
  - `./certbot/conf` → `/etc/letsencrypt`
  - `./certbot/www` → `/var/www/certbot`

## 🔍 Troubleshooting

### Issue: Next.js container exits immediately

**Solution:**
```bash
# Check logs for build errors
docker logs zaytoonz-nextjs

# Common issues:
# - Missing dependencies: Run npm install locally first
# - Build errors: Check your Next.js code
# - Missing environment variables: Verify .env file
```

### Issue: Nginx shows 502 Bad Gateway

**Solution:**
```bash
# Verify Next.js is running and healthy
docker exec zaytoonz-nextjs wget -q -O- http://localhost:3000

# Check if containers are on same network
docker network inspect webapp-network

# Restart nginx
docker restart zaytoonz-nginx
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 80
netstat -tulpn | grep :80

# Stop conflicting services
sudo systemctl stop apache2  # or nginx, or other web server

# Or change port in docker-compose-webapp.yml:
# ports:
#   - "8080:80"  # Use port 8080 instead
```

### Issue: Can't access site from external IP

**Possible causes:**
1. **Firewall blocking ports** - Open ports 80 and 443
2. **Wrong port binding** - Check if nginx is binding to 0.0.0.0
3. **DNS not configured** - Verify domain points to correct IP

**Solution:**
```bash
# Check if nginx is listening on all interfaces
docker exec zaytoonz-nginx netstat -tlnp

# Open firewall ports (Linux)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Open firewall ports (Windows)
# Run as Administrator
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443
```

## 🔐 SSL/HTTPS Configuration

### Option 1: Let's Encrypt with Certbot (Recommended)

```bash
# First, ensure your domain points to your server IP

# Stop nginx temporarily
docker stop zaytoonz-nginx

# Obtain certificate
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  --email your-email@example.com \
  -d your-domain.com -d www.your-domain.com \
  --agree-tos

# Update nginx-webapp.conf:
# 1. Uncomment the HTTPS server block
# 2. Replace 'your-domain.com' with your actual domain

# Restart nginx
docker start zaytoonz-nginx
```

### Option 2: Cloudflare (Easy alternative)

Use Cloudflare's proxy feature for free SSL without configuring Certbot:
1. Point your domain to Cloudflare
2. Enable Cloudflare proxy (orange cloud icon)
3. SSL/TLS mode: "Full"
4. No changes needed to nginx configuration

## 📊 Monitoring

### View Logs

```bash
# Follow all logs
docker-compose -f docker-compose-webapp.yml logs -f

# Follow specific service
docker logs -f zaytoonz-nextjs
docker logs -f zaytoonz-nginx

# View last 100 lines
docker logs --tail 100 zaytoonz-nextjs
```

### Check Container Health

```bash
# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check resource usage
docker stats

# Inspect container
docker inspect zaytoonz-nextjs
```

## 🔄 Updates and Maintenance

### Update Application Code

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose-webapp.yml up -d --build nextjs
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose-webapp.yml restart

# Restart specific service
docker restart zaytoonz-nextjs
```

### Clean Up

```bash
# Stop and remove containers
docker-compose -f docker-compose-webapp.yml down

# Remove unused images and volumes
docker system prune -a --volumes
```

## 🎯 Next Steps

Once the web app is stable, you can:

1. **Add Scraper Service**: Create `docker-compose-with-scraper.yml`
2. **Add NLWEB Service**: Create `docker-compose-full.yml`
3. **Setup CI/CD**: Automate deployments
4. **Configure Monitoring**: Add health checks and alerts

## 📝 File Structure

```
project/
├── docker-compose-webapp.yml       # Web app deployment config
├── nginx-webapp.conf               # Nginx configuration
├── webapp-env-vars.txt             # Environment variables
├── WEBAPP_DEPLOYMENT_GUIDE.md      # This file
├── certbot/
│   ├── conf/                       # SSL certificates
│   └── www/                        # ACME challenges
├── app/                            # Next.js application
└── .env                            # Local environment variables (create this)
```

## ⚠️ Important Notes

1. **OpenAI API Key**: The scraper functionality is disabled in this deployment. You still need the OpenAI API key for any AI features in the web app.

2. **Supabase**: Your web app will continue to use Supabase for data storage and authentication.

3. **Features Disabled**: Any features that depend on the Scraper or NLWEB services will not work in this deployment.

4. **Port 80**: Make sure port 80 is not being used by another service (Apache, IIS, etc.)

5. **Production Use**: For production, always use HTTPS with proper SSL certificates.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs: `docker logs zaytoonz-nextjs`
3. Verify environment variables are set correctly
4. Ensure all required files are present

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Deployment Type**: Web App Only (No Scraper, No NLWEB)
