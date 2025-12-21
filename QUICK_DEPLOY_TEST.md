# Quick Deploy to /Test Subdirectory - VPS

## Step 1: Create Deployment Package (On Windows)

Run the PowerShell script to create the deployment archive:

```powershell
.\create-sub-deploy-archive.ps1
```

This will:
- Build your Next.js app with `basePath=/Test`
- Create `sub-deploy-vps.tar.gz` with all necessary files
- The script `vps-deploy-sub.sh` is already created

## Step 2: Upload to VPS (Using WinSCP)

1. Open WinSCP
2. Connect to your VPS: `168.231.87.171`
3. Navigate to `/tmp/` directory
4. Upload these two files:
   - `sub-deploy-vps.tar.gz`
   - `vps-deploy-sub.sh`

## Step 3: Deploy on VPS (SSH)

1. SSH into your VPS:
   ```bash
   ssh root@168.231.87.171
   ```

2. Make script executable and run:
   ```bash
   chmod +x /tmp/vps-deploy-sub.sh
   bash /tmp/vps-deploy-sub.sh
   ```

The script will:
- ✅ Extract the archive
- ✅ Copy files to `/var/www/zaytoonz-ngo`
- ✅ Install/update dependencies
- ✅ Configure environment variables
- ✅ Start the app with PM2 on port 3001
- ✅ Help configure Nginx

## Step 4: Configure Nginx

The script will prompt you, or manually:

1. Edit Nginx config:
   ```bash
   nano /etc/nginx/sites-available/zaytoonz-ngo
   ```

2. Update the path to your "Coming Soon" page directory

3. Test and reload:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

## Step 5: Verify

```bash
# Check PM2 status
pm2 status zaytoonz-test

# View logs
pm2 logs zaytoonz-test

# Test locally
curl http://localhost:3001/Test
```

## Access Your App

Visit: **https://zaytoonz.com/Test**

## Troubleshooting

- **App not starting**: Check `pm2 logs zaytoonz-test`
- **404 errors**: Verify `NEXT_PUBLIC_BASE_PATH=/Test` in `.env.local`
- **Nginx issues**: Check `nginx -t` and `/var/log/nginx/error.log`

## Files Included in Archive

- `.next/` - Built Next.js application
- `public/` - Static assets
- `server.js` - Custom server for basePath
- `next.config.js` - Next.js configuration
- `package.json` - Dependencies
- `ecosystem.test.config.js` - PM2 configuration
- `nginx-test-subdirectory.conf` - Nginx template
- `.env.local.template` - Environment variables template

