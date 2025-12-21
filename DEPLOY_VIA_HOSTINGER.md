# 🚀 Deploy to zaytoonz.com/test via Hostinger VPS

This guide shows how to deploy your app using the automated PowerShell script that connects to your Hostinger VPS via SSH.

## ✅ Prerequisites

- Windows PowerShell
- OpenSSH client (included in Windows 10/11)
- Git installed
- VPS SSH access credentials

## 📋 Quick Deployment

### Step 1: Run the Deployment Script

Open PowerShell in your project directory:

```powershell
cd C:\Users\Dell\Desktop\Sora_digital\projects\Zaytoonz_NGO
.\deploy-via-hostinger.ps1
```

The script will:
1. ✅ Build your Next.js app locally with `basePath=/test`
2. ✅ Connect to your VPS via SSH
3. ✅ Pull latest code from GitHub
4. ✅ Install dependencies
5. ✅ Build the application
6. ✅ Configure PM2
7. ✅ Set up Nginx

### Step 2: Enter VPS Password

When prompted, enter your VPS root password.

### Step 3: Configure Environment Variables (First Time)

If this is your first deployment, the script will create a `.env.local` template. You'll need to update it with your API keys:

```bash
# SSH into VPS
ssh root@168.231.87.171

# Edit environment file
nano /var/www/zaytoonz-ngo/.env.local
```

Update with your actual values, then run the deployment script again.

### Step 4: Configure Nginx

The script will prompt you to configure Nginx. Or do it manually:

```bash
ssh root@168.231.87.171
nano /etc/nginx/sites-available/zaytoonz-ngo
```

Update the path to your "Coming Soon" page directory, then:

```bash
nginx -t
systemctl reload nginx
```

## 🔧 Advanced Options

### Using SSH Key (Recommended)

If you have an SSH key set up:

```powershell
.\deploy-via-hostinger.ps1 -SSHKey "C:\path\to\your\private_key"
```

### Skip Local Build

If you want to build only on the VPS:

```powershell
.\deploy-via-hostinger.ps1 -SkipBuild
```

### Custom VPS IP

```powershell
.\deploy-via-hostinger.ps1 -VPS_IP "your.vps.ip.address"
```

## 🔄 Updating Your App

After making changes and pushing to GitHub:

```powershell
.\deploy-via-hostinger.ps1
```

That's it! The script will pull the latest code and redeploy.

## ✅ Verify Deployment

```powershell
# Check PM2 status
ssh root@168.231.87.171 "pm2 status zaytoonz-test"

# View logs
ssh root@168.231.87.171 "pm2 logs zaytoonz-test"

# Test locally on VPS
ssh root@168.231.87.171 "curl http://localhost:3001/test"
```

## 🌐 Access Your App

Once deployed:
- **Main site**: https://zaytoonz.com (Coming Soon page)
- **Your app**: https://zaytoonz.com/test

## 🔧 Troubleshooting

### SSH Connection Fails

1. Verify VPS IP: `168.231.87.171`
2. Check if SSH is enabled on VPS
3. Verify your password is correct
4. Try connecting manually: `ssh root@168.231.87.171`

### Build Fails on VPS

```bash
# SSH into VPS and check
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
npm run build
```

### PM2 Not Starting

```bash
# Check logs
ssh root@168.231.87.171 "pm2 logs zaytoonz-test --lines 50"

# Check environment
ssh root@168.231.87.171 "cat /var/www/zaytoonz-ngo/.env.local"
```

### Nginx 502 Error

```bash
# Check if app is running
ssh root@168.231.87.171 "pm2 status zaytoonz-test"

# Check Nginx logs
ssh root@168.231.87.171 "tail -f /var/log/nginx/error.log"
```

## 📝 What Gets Deployed

- ✅ Latest code from GitHub (main branch)
- ✅ Next.js app built with `basePath=/test`
- ✅ PM2 running on port 3001
- ✅ Nginx configuration for `/test` subdirectory
- ✅ Environment variables from `.env.local`

## 🎉 You're Done!

Your app is now deployed and accessible at **https://zaytoonz.com/test**

---

**Note**: Make sure your `.env.local` file on the VPS has all the correct environment variables before deploying.

