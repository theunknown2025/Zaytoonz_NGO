# Deployment Guide: Zaytoonz NGO to Hostinger VPS

This guide explains how to deploy your Next.js application to your Hostinger VPS using the Hostinger MCP server and SSH.

## Prerequisites

1. **Hostinger VPS** - You already have one running (ID: 1182909)
   - IP: `168.231.87.171`
   - Hostname: `srv1182909.hstgr.cloud`
   - Template: Ubuntu 24.04 LTS

2. **SSH Access** - You need SSH credentials to access your VPS

3. **Node.js & PM2** - Should be installed on the VPS

4. **Hostinger MCP Server** - Already configured in `.cursor/mcp.json`

## Deployment Options

### Option 1: Using Hostinger MCP + SSH (Recommended)

The Hostinger MCP server can help you:
- **Manage VPS resources** (start/stop/restart, check status)
- **Monitor VPS health**
- **Get VPS information** (IPs, status, etc.)

However, for deploying the actual application code, you'll need SSH access.

#### Steps:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Create deployment archive:**
   ```bash
   tar --exclude='node_modules' \
       --exclude='.next' \
       --exclude='.git' \
       --exclude='.env.local' \
       -czf deploy.tar.gz .
   ```

3. **Upload to VPS:**
   ```bash
   scp deploy.tar.gz root@168.231.87.171:/tmp/
   ```

4. **SSH into VPS and deploy:**
   ```bash
   ssh root@168.231.87.171
   cd /var/www/zaytoonz-ngo
   tar -xzf /tmp/deploy.tar.gz
   npm install --production
   npm run build
   pm2 restart zaytoonz-ngo
   ```

### Option 2: Using Automated Script

Use the provided deployment script:

**Linux/Mac:**
```bash
chmod +x deploy-to-hostinger.sh
./deploy-to-hostinger.sh
```

**Windows (PowerShell):**
```powershell
.\deploy-to-hostinger.ps1
```

### Option 3: Using Git (Recommended for Production)

1. **Push code to GitHub** (already done)

2. **SSH into VPS:**
   ```bash
   ssh root@168.231.87.171
   ```

3. **Clone/Pull repository:**
   ```bash
   cd /var/www/zaytoonz-ngo
   git pull origin main
   npm install --production
   npm run build
   pm2 restart zaytoonz-ngo
   ```

## Using Hostinger MCP Tools

After restarting Cursor, you can use the Hostinger MCP to:

### Check VPS Status
Ask Cursor: "Check the status of my Hostinger VPS"

### Manage VPS
- Start/Stop/Restart VPS
- Get VPS information
- Monitor resources

### Example MCP Commands (via Cursor)
- "What's the status of my Hostinger VPS?"
- "Get information about my VPS"
- "List all my virtual machines"

## Initial VPS Setup

If this is your first deployment, you'll need to set up the VPS:

1. **SSH into VPS:**
   ```bash
   ssh root@168.231.87.171
   ```

2. **Install Node.js 20+:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   ```

3. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

4. **Install Nginx (for reverse proxy):**
   ```bash
   apt-get update
   apt-get install -y nginx
   ```

5. **Clone repository:**
   ```bash
   cd /var/www
   git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo
   cd zaytoonz-ngo
   ```

6. **Install dependencies:**
   ```bash
   npm install
   ```

7. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   nano .env.local  # Edit with your actual values
   ```

8. **Build and start:**
   ```bash
   npm run build
   pm2 start npm --name "zaytoonz-ngo" -- start
   pm2 save
   pm2 startup  # Enable PM2 to start on boot
   ```

9. **Configure Nginx (optional):**
   ```bash
   nano /etc/nginx/sites-available/zaytoonz-ngo
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name srv1182909.hstgr.cloud;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

## Environment Variables

Make sure to set these in `.env.local` on your VPS:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://168.231.87.171:3000
NODE_ENV=production
```

## Monitoring

### View PM2 logs:
```bash
pm2 logs zaytoonz-ngo
```

### View PM2 status:
```bash
pm2 status
```

### Restart application:
```bash
pm2 restart zaytoonz-ngo
```

## Troubleshooting

### Application won't start:
1. Check PM2 logs: `pm2 logs zaytoonz-ngo`
2. Check if port 3000 is available: `netstat -tulpn | grep 3000`
3. Verify environment variables are set correctly

### Build fails:
1. Check Node.js version: `node --version` (should be 20+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check for missing dependencies

### Can't connect via SSH:
1. Verify IP address is correct
2. Check firewall settings on Hostinger
3. Ensure SSH service is running: `systemctl status ssh`

## Security Recommendations

1. **Use SSH keys instead of passwords**
2. **Set up firewall (UFW):**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

3. **Keep system updated:**
   ```bash
   apt-get update && apt-get upgrade -y
   ```

4. **Use HTTPS** (set up SSL certificate with Let's Encrypt)

## Next Steps

1. Set up domain name (if you have one)
2. Configure SSL certificate
3. Set up automated backups
4. Configure monitoring and alerts

