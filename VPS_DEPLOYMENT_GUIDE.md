# VPS Deployment Guide - beta-zaytoonz.pro

This guide explains how to deploy the Zaytoonz NGO application to a Hostinger VPS server.

## Prerequisites

- Hostinger VPS Server (IP: 76.13.57.178)
- Domain: beta-zaytoonz.pro (DNS configured to point to VPS IP)
- SSH access to the VPS server
- Root or sudo access on the VPS

## Quick Start

### Option 1: Automated Deployment (Recommended)

1. **SSH into your VPS:**
   ```bash
   ssh root@76.13.57.178
   ```

2. **Clone the repository:**
   ```bash
   cd /opt
   git clone <your-repo-url> zaytoonz-ngo
   cd zaytoonz-ngo
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x deploy-vps-beta.sh
   sudo ./deploy-vps-beta.sh
   ```

4. **Configure environment variables:**
   - Edit `.env.production` with your actual values
   - Required variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_OPENAI_API_KEY`

5. **Initialize SSL certificates:**
   ```bash
   chmod +x init-ssl-beta.sh
   sudo ./init-ssl-beta.sh
   ```

### Option 2: Manual Step-by-Step

1. **Install Docker and Docker Compose:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Set up Nginx configuration:**
   ```bash
   chmod +x setup-nginx-beta.sh
   ./setup-nginx-beta.sh
   ```

3. **Configure environment variables:**
   - Copy `.env.production.example` to `.env.production`
   - Fill in all required values

4. **Start services:**
   ```bash
   docker compose -f docker-compose-beta.yml up -d --build
   ```

5. **Initialize SSL:**
   ```bash
   chmod +x init-ssl-beta.sh
   ./init-ssl-beta.sh
   ```

## DNS Configuration

Before running SSL initialization, ensure your domain DNS is configured:

- **A Record:** `beta-zaytoonz.pro` → `76.13.57.178`
- **A Record:** `www.beta-zaytoonz.pro` → `76.13.57.178` (optional)

## Services

The deployment includes the following services:

- **Next.js App** - Main web application (Port 3002)
- **Python Scraper** - Web scraping service (Port 8000)
- **NLWeb** - Natural language web service (Port 8002)
- **Nginx** - Reverse proxy and SSL termination (Ports 80, 443)
- **Certbot** - SSL certificate management

## Useful Commands

### View Logs
```bash
# All services
docker compose -f docker-compose-beta.yml logs -f

# Specific service
docker compose -f docker-compose-beta.yml logs -f nextjs
docker compose -f docker-compose-beta.yml logs -f nginx
```

### Restart Services
```bash
docker compose -f docker-compose-beta.yml restart
```

### Stop Services
```bash
docker compose -f docker-compose-beta.yml down
```

### Update Application
```bash
git pull
docker compose -f docker-compose-beta.yml up -d --build
```

### Check Container Status
```bash
docker compose -f docker-compose-beta.yml ps
```

### Renew SSL Certificate Manually
```bash
docker compose -f docker-compose-beta.yml run --rm certbot renew
docker compose -f docker-compose-beta.yml exec nginx nginx -s reload
```

## Troubleshooting

### SSL Certificate Issues

If SSL certificate generation fails:

1. **Check DNS:** Ensure domain points to VPS IP
   ```bash
   dig beta-zaytoonz.pro
   ```

2. **Check Firewall:** Ensure ports 80 and 443 are open
   ```bash
   ufw status
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

3. **Check Nginx:** Ensure nginx container is running
   ```bash
   docker compose -f docker-compose-beta.yml ps nginx
   ```

### Application Not Loading

1. **Check Next.js logs:**
   ```bash
   docker compose -f docker-compose-beta.yml logs nextjs
   ```

2. **Check Nginx logs:**
   ```bash
   docker compose -f docker-compose-beta.yml logs nginx
   ```

3. **Verify environment variables:**
   ```bash
   docker compose -f docker-compose-beta.yml exec nextjs env | grep NEXT_PUBLIC
   ```

### Port Conflicts

If ports are already in use:

1. **Check what's using the ports:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Stop conflicting services or modify docker-compose-beta.yml**

## File Structure

```
/opt/zaytoonz-ngo/
├── deploy-vps-beta.sh          # Main deployment script
├── setup-nginx-beta.sh         # Nginx configuration script
├── init-ssl-beta.sh            # SSL certificate initialization
├── docker-compose-beta.yml     # Docker Compose configuration
├── nginx-beta.conf             # Nginx configuration file
├── Dockerfile.webapp           # Next.js Dockerfile
├── .env.production             # Environment variables (create this)
├── certbot/                    # SSL certificates
│   ├── conf/
│   └── www/
└── logs/                       # Application logs
```

## Security Notes

1. **Firewall:** Ensure only necessary ports are open
2. **SSH:** Use key-based authentication, disable password auth
3. **Environment Variables:** Never commit `.env.production` to git
4. **Updates:** Regularly update Docker images and system packages
5. **Backups:** Set up regular backups of important data

## Support

For issues or questions:
- Check container logs first
- Verify DNS configuration
- Ensure all environment variables are set correctly
- Check firewall and port configurations
