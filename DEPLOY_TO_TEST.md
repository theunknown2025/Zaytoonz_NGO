# 🚀 Deploy to zaytoonz.com/test - Complete Guide

## ✅ Changes Pushed to GitHub

All deployment files have been committed and pushed to your repository:
- ✅ Next.js configured with `basePath: '/test'`
- ✅ Deployment scripts created
- ✅ PM2 configuration for port 3001
- ✅ Nginx configuration template
- ✅ All files pushed to GitHub

## 📋 Deployment Steps

### Step 1: Create Deployment Package (On Your Windows Machine)

1. **Open PowerShell** in your project directory:
   ```powershell
   cd C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO
   ```

2. **Run the archive creation script**:
   ```powershell
   .\create-sub-deploy-archive.ps1
   ```

   This will:
   - Build your Next.js app with `basePath=/test`
   - Create `sub-deploy-vps.tar.gz` archive
   - Include all necessary files

3. **Verify files created**:
   - ✅ `sub-deploy-vps.tar.gz` (deployment archive)
   - ✅ `vps-deploy-sub.sh` (deployment script - already exists)

### Step 2: Upload to VPS (Using WinSCP)

1. **Open WinSCP** and connect to your VPS:
   - **Host**: `168.231.87.171`
   - **Username**: `root`
   - **Password**: (your VPS password)

2. **Navigate to `/tmp/` directory** on the VPS

3. **Upload these 2 files**:
   - `sub-deploy-vps.tar.gz`
   - `vps-deploy-sub.sh`

   Drag and drop both files into `/tmp/` directory in WinSCP.

### Step 3: Deploy on VPS (SSH)

1. **SSH into your VPS**:
   ```bash
   ssh root@168.231.87.171
   ```

2. **Make script executable and run**:
   ```bash
   chmod +x /tmp/vps-deploy-sub.sh
   bash /tmp/vps-deploy-sub.sh
   ```

   The script will automatically:
   - ✅ Extract the archive
   - ✅ Copy files to `/var/www/zaytoonz-ngo`
   - ✅ Install/update npm dependencies
   - ✅ Configure environment variables
   - ✅ Start the app with PM2 on port 3001
   - ✅ Guide you through Nginx configuration

### Step 4: Configure Environment Variables

1. **Edit the environment file**:
   ```bash
   nano /var/www/zaytoonz-ngo/.env.local
   ```

2. **Update with your actual values**:
   ```env
   # Base path for subdirectory deployment
   NEXT_PUBLIC_BASE_PATH=/test

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_key

   # Environment
   NODE_ENV=production
   PORT=3001

   # Add other environment variables as needed
   ```

3. **Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

4. **Restart PM2** to load new environment:
   ```bash
   pm2 restart zaytoonz-test
   ```

### Step 5: Configure Nginx

1. **Edit Nginx configuration**:
   ```bash
   nano /etc/nginx/sites-available/zaytoonz-ngo
   ```

2. **Update the configuration** to handle both root (Coming Soon page) and `/test`:

   ```nginx
   server {
       listen 80;
       server_name zaytoonz.com www.zaytoonz.com;

       client_max_body_size 100M;

       # Root - Serve "Coming Soon" page (static files)
       # UPDATE THIS PATH to where your Coming Soon page is located
       location = / {
           root /var/www/zaytoonz-coming-soon;  # ⚠️ UPDATE THIS PATH
           index index.html;
           try_files $uri /index.html;
       }

       # Serve other static files from Coming Soon directory
       location ~ ^/(?!test)(.*)$ {
           root /var/www/zaytoonz-coming-soon;  # ⚠️ UPDATE THIS PATH
           try_files $uri =404;
       }

       # /test - Next.js application
       location /test {
           proxy_pass http://localhost:3001/test;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           proxy_read_timeout 300s;
           proxy_connect_timeout 75s;
           proxy_set_header X-Forwarded-Prefix /test;
       }

       # Handle Next.js static files
       location /test/_next/static/ {
           proxy_pass http://localhost:3001/test/_next/static/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       # Handle Next.js API routes
       location /test/api/ {
           proxy_pass http://localhost:3001/test/api/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 300s;
           proxy_connect_timeout 75s;
       }

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

3. **Important**: Update the path to your "Coming Soon" page directory (replace `/var/www/zaytoonz-coming-soon` with the actual path)

4. **Test Nginx configuration**:
   ```bash
   nginx -t
   ```

5. **If test passes, reload Nginx**:
   ```bash
   systemctl reload nginx
   ```

### Step 6: Verify Deployment

1. **Check PM2 status**:
   ```bash
   pm2 status zaytoonz-test
   ```
   Should show `online` status

2. **View logs**:
   ```bash
   pm2 logs zaytoonz-test
   ```

3. **Test locally on VPS**:
   ```bash
   curl http://localhost:3001/test
   ```

4. **Test via domain** (after Nginx is configured):
   ```bash
   curl http://zaytoonz.com/test
   ```

5. **Access in browser**:
   Open: **https://zaytoonz.com/test**

## 🔧 Troubleshooting

### App not starting
```bash
# Check PM2 logs
pm2 logs zaytoonz-test --lines 50

# Check if port 3001 is in use
netstat -tulpn | grep 3001

# Restart the app
pm2 restart zaytoonz-test
```

### 404 errors on routes
- Verify `NEXT_PUBLIC_BASE_PATH=/test` in `.env.local`
- Check that the app is running: `pm2 status zaytoonz-test`
- Verify Nginx is proxying correctly

### Static assets not loading
- Check browser console for 404 errors
- Verify `basePath` is set correctly
- Check Nginx is handling `/_next/static/` correctly

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status zaytoonz-test

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx config
nginx -t
```

## 📝 Useful Commands

```bash
# PM2 Management
pm2 status                    # Check all services
pm2 logs zaytoonz-test        # View logs
pm2 restart zaytoonz-test      # Restart app
pm2 stop zaytoonz-test         # Stop app
pm2 monit                     # Monitor resources

# Nginx
nginx -t                      # Test configuration
systemctl reload nginx        # Reload Nginx
systemctl status nginx        # Check Nginx status
tail -f /var/log/nginx/error.log  # View error logs

# Application
cd /var/www/zaytoonz-ngo      # Navigate to app directory
npm run build                 # Rebuild (if needed)
```

## ✅ Success Checklist

- [ ] Deployment package created (`sub-deploy-vps.tar.gz`)
- [ ] Files uploaded to VPS `/tmp/` directory
- [ ] Deployment script executed successfully
- [ ] Environment variables configured in `.env.local`
- [ ] PM2 shows `zaytoonz-test` running on port 3001
- [ ] Nginx configured and reloaded
- [ ] App accessible at `https://zaytoonz.com/test`
- [ ] API routes working (test `/test/api/opportunities`)
- [ ] Static assets loading correctly

## 🎉 You're Done!

Your app should now be accessible at:
**https://zaytoonz.com/test**

The "Coming Soon" page remains at:
**https://zaytoonz.com**

---

## 📞 Need Help?

- Check PM2 logs: `pm2 logs zaytoonz-test`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Verify environment: `cat /var/www/zaytoonz-ngo/.env.local`
- Test locally: `curl http://localhost:3001/test`

