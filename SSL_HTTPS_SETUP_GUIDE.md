# 🔒 SSL/HTTPS Setup Guide for Hostinger VPS

Complete step-by-step guide to secure your application with HTTPS using Let's Encrypt SSL certificates.

---

## ⚠️ Prerequisites

**IMPORTANT:** SSL certificates **CANNOT** be issued for IP addresses using Let's Encrypt.

You need:
- ✅ A domain name (e.g., `yourdomain.com`)
- ✅ Domain DNS pointing to your VPS IP address
- ✅ SSH access to your VPS

---

## 📋 Quick Setup Steps

### Step 1: Verify DNS Configuration

**Before starting, ensure your domain points to your VPS:**

```bash
# From your local machine or VPS
nslookup yourdomain.com
# or
dig yourdomain.com
```

**Expected result:** Should show your VPS IP address (e.g., `72.62.26.162`)

**If DNS is not configured:**
1. Go to your domain registrar
2. Add DNS A Record:
   - **Type:** A
   - **Name:** @ (or blank)
   - **Value:** `72.62.26.162`
   - **TTL:** 3600
3. Wait 15-30 minutes for DNS propagation

---

### Step 2: Install Certbot

```bash
# Update package list
apt update

# Install Certbot and Nginx plugin
apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

---

### Step 3: Update Nginx Configuration

**Edit your Nginx configuration to use your domain:**

```bash
nano /etc/nginx/sites-available/zaytoonz-ngo
```

**Find this line:**
```nginx
server_name 72.62.26.162;
```

**Change it to:**
```nginx
server_name yourdomain.com www.yourdomain.com;
```

**Replace `yourdomain.com` with your actual domain name.**

**Save and test:**
```bash
# Test configuration
nginx -t

# If successful, reload
systemctl reload nginx
```

---

### Step 4: Obtain SSL Certificate

**Run Certbot to get your free SSL certificate:**

```bash
# Replace 'yourdomain.com' with your actual domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow the prompts:**

1. **Email address:** Enter your email (for renewal notifications)
   ```
   Enter email address: your@email.com
   ```

2. **Agree to terms:** Type `A` and press Enter
   ```
   (A)gree/(C)ancel: A
   ```

3. **Share email (optional):** Type `Y` or `N`
   ```
   (Y)es/(N)o: N
   ```

4. **Redirect HTTP to HTTPS:** Type `2` (recommended)
   ```
   Please choose whether or not to redirect HTTP traffic to HTTPS
   1: No redirect
   2: Redirect - Make all requests redirect to secure HTTPS access
   Select: 2
   ```

**Certbot will automatically:**
- ✅ Obtain SSL certificate
- ✅ Update Nginx configuration
- ✅ Set up auto-renewal
- ✅ Configure HTTP → HTTPS redirect

---

### Step 5: Verify SSL is Working

**Test your SSL certificate:**

```bash
# Check certificate status
certbot certificates

# Test HTTPS connection
curl -I https://yourdomain.com

# Check Nginx is listening on port 443
netstat -tulpn | grep :443
```

**From your browser:**
- Visit `https://yourdomain.com`
- You should see a padlock icon 🔒
- HTTP should automatically redirect to HTTPS

---

### Step 6: Test Auto-Renewal

**Let's Encrypt certificates expire every 90 days. Test auto-renewal:**

```bash
# Test renewal (dry run - won't actually renew)
certbot renew --dry-run
```

**Expected output:**
```
Congratulations, all renewals succeeded.
```

If successful, your certificate will auto-renew before expiration!

---

### Step 7: Update Application URLs (If Needed)

**If your app uses absolute URLs, update environment variables:**

```bash
# Edit Next.js environment file
nano /var/www/zaytoonz-ngo/.env.local
```

**Update to use HTTPS:**
```env
# Change from HTTP to HTTPS
NEXTAUTH_URL=https://yourdomain.com
```

**Restart application:**
```bash
pm2 restart zaytoonz-app
```

---

## 🛠️ Troubleshooting

### Problem: "Failed to obtain certificate"

**Check:**
1. DNS is pointing to your IP
   ```bash
   nslookup yourdomain.com
   ```

2. Port 80 is open (required for verification)
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

3. Nginx is running
   ```bash
   systemctl status nginx
   ```

### Problem: "Too many requests" error

Let's Encrypt has rate limits. Solutions:
- Wait 1 week before trying again
- Use `--staging` flag for testing (not valid for production)

### Problem: Certificate expires soon

```bash
# Check expiration
certbot certificates

# Renew manually
certbot renew

# Force renewal (if needed)
certbot renew --force-renewal
```

### Problem: Mixed content warnings

- Update all internal URLs to HTTPS
- Check browser console for HTTP resources
- Update environment variables

---

## 📝 Manual Nginx SSL Configuration

If Certbot didn't update your config correctly, here's the manual configuration:

```nginx
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 100M;

    # Your existing location blocks...
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Test and reload:**
```bash
nginx -t
systemctl reload nginx
```

---

## ✅ Checklist

Before considering SSL setup complete:

- [ ] Domain DNS pointing to VPS IP
- [ ] Certbot installed
- [ ] Nginx config updated with domain name
- [ ] SSL certificate obtained
- [ ] HTTPS accessible in browser
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal tested
- [ ] Environment variables updated
- [ ] Application restarted

---

## 🎉 Success!

Your application is now secured with HTTPS!

**Access your application:**
- ✅ **HTTPS:** `https://yourdomain.com`
- ✅ **HTTP:** `http://yourdomain.com` (redirects to HTTPS)

**Certificate Details:**
- ✅ Free SSL from Let's Encrypt
- ✅ Auto-renewal configured
- ✅ Strong security enabled
- ✅ HTTP → HTTPS redirect active

---

## 📞 Need Help?

**Common Commands:**
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew

# Test renewal
certbot renew --dry-run

# Check Nginx config
nginx -t

# View Nginx logs
tail -f /var/log/nginx/error.log
```

**For more details, see:** `COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md` (Step 10)

---

**Last Updated:** 2025-01-15


