# Manual SSL Certificate Setup Guide

This guide walks you through setting up SSL certificates manually for `beta-zaytoonz.pro`.

## Prerequisites

- Domain `beta-zaytoonz.pro` is pointing to VPS IP `76.13.57.178`
- Docker and Docker Compose are installed
- Ports 80 and 443 are open in firewall
- You're in the application directory: `/opt/zaytoonz-ngo`

---

## Step 1: Verify DNS Configuration

```bash
# Check if DNS is pointing correctly
dig beta-zaytoonz.pro +short
# Should return: 76.13.57.178

# Or use nslookup
nslookup beta-zaytoonz.pro
```

**If DNS is not correct, wait 5-30 minutes for propagation before continuing.**

---

## Step 2: Ensure Environment is Set Up

```bash
cd /opt/zaytoonz-ngo

# Ensure .env file exists (symlink to .env.production)
if [ ! -f ".env" ]; then
    ln -sf .env.production .env
fi

# Verify environment variables are loaded
source .env.production 2>/dev/null || true
```

---

## Step 3: Ensure Nginx Configuration Exists

```bash
# Check if nginx config exists
ls -la nginx-beta.conf

# If it doesn't exist, create it
if [ ! -f "nginx-beta.conf" ]; then
    ./setup-nginx-beta.sh
fi
```

---

## Step 4: Create Certbot Directories

```bash
# Create necessary directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Set proper permissions
chmod -R 755 certbot/
```

---

## Step 5: Download TLS Parameters

```bash
# Download recommended TLS parameters
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem

# Verify files were downloaded
ls -la certbot/conf/
```

---

## Step 6: Create Temporary SSL Certificate

This allows nginx to start before we get the real certificate:

```bash
# Create temporary certificate directory
mkdir -p certbot/conf/live/beta-zaytoonz.pro

# Create temporary certificate using certbot container
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/beta-zaytoonz.pro/privkey.pem' \
    -out '/etc/letsencrypt/live/beta-zaytoonz.pro/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# Verify certificate was created
ls -la certbot/conf/live/beta-zaytoonz.pro/
```

---

## Step 7: Start Nginx with Temporary Certificate

```bash
# Start nginx container
docker compose -f docker-compose-beta.yml up -d nginx

# Wait a few seconds
sleep 5

# Check if nginx is running
docker compose -f docker-compose-beta.yml ps nginx

# Check nginx logs
docker compose -f docker-compose-beta.yml logs nginx --tail=20
```

**If nginx fails to start, check the logs:**
```bash
docker compose -f docker-compose-beta.yml logs nginx
```

**Common issues:**
- Port 80/443 already in use: `netstat -tulpn | grep -E ":80|:443"`
- Config error: `docker compose -f docker-compose-beta.yml exec nginx nginx -t`
- Missing config file: Ensure `nginx-beta.conf` exists

---

## Step 8: Delete Temporary Certificate

```bash
# Remove temporary certificate
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/beta-zaytoonz.pro && \
  rm -Rf /etc/letsencrypt/archive/beta-zaytoonz.pro && \
  rm -Rf /etc/letsencrypt/renewal/beta-zaytoonz.pro.conf" certbot

# Verify it's deleted
ls -la certbot/conf/live/beta-zaytoonz.pro/ 2>/dev/null || echo "Directory removed (good)"
```

---

## Step 9: Request Let's Encrypt Certificate

```bash
# Request the certificate
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    -m support@zaytoonz.com \
    -d beta-zaytoonz.pro \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot
```

**What this does:**
- Uses webroot method (nginx serves the challenge)
- Requests certificate for `beta-zaytoonz.pro`
- Uses email `support@zaytoonz.com` for notifications
- Agrees to Let's Encrypt terms

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/beta-zaytoonz.pro/fullchain.pem
```

**If it fails:**
- Check DNS: `dig beta-zaytoonz.pro +short`
- Check port 80: `curl -I http://beta-zaytoonz.pro`
- Check nginx is running: `docker compose -f docker-compose-beta.yml ps nginx`
- Check firewall: `ufw status`

---

## Step 10: Verify Certificate Was Created

```bash
# Check certificate files exist
ls -la certbot/conf/live/beta-zaytoonz.pro/

# Should show:
# - fullchain.pem
# - privkey.pem
# - (and possibly chain.pem, cert.pem)

# Check certificate details
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  openssl x509 -in /etc/letsencrypt/live/beta-zaytoonz.pro/fullchain.pem -text -noout | grep -E 'Subject:|Issuer:|Not Before|Not After'" certbot
```

---

## Step 11: Reload Nginx with Real Certificate

```bash
# Test nginx configuration
docker compose -f docker-compose-beta.yml exec nginx nginx -t

# If test passes, reload nginx
docker compose -f docker-compose-beta.yml exec nginx nginx -s reload

# Or restart nginx container
docker compose -f docker-compose-beta.yml restart nginx
```

---

## Step 12: Test SSL Certificate

```bash
# Test HTTP redirect (should redirect to HTTPS)
curl -I http://beta-zaytoonz.pro
# Should return: HTTP/1.1 301 Moved Permanently

# Test HTTPS connection
curl -I https://beta-zaytoonz.pro
# Should return: HTTP/1.1 200 OK (or similar)

# Test SSL certificate details
openssl s_client -connect beta-zaytoonz.pro:443 -servername beta-zaytoonz.pro < /dev/null 2>/dev/null | openssl x509 -noout -dates
# Should show certificate validity dates
```

---

## Step 13: Verify in Browser

1. Open: `https://beta-zaytoonz.pro`
2. Check browser address bar for padlock icon
3. Click padlock to view certificate details
4. Verify certificate is valid and issued by "Let's Encrypt"

---

## Troubleshooting

### Issue: Certificate request fails with "Connection refused"

**Solution:**
```bash
# Check nginx is running
docker compose -f docker-compose-beta.yml ps nginx

# Check port 80 is accessible
curl -I http://beta-zaytoonz.pro

# Check firewall
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Issue: Certificate request fails with "DNS problem"

**Solution:**
```bash
# Verify DNS
dig beta-zaytoonz.pro +short
# Should return: 76.13.57.178

# Wait for DNS propagation (can take 5-30 minutes)
# Check from multiple locations:
dig @8.8.8.8 beta-zaytoonz.pro +short
```

### Issue: Nginx won't start

**Solution:**
```bash
# Check nginx logs
docker compose -f docker-compose-beta.yml logs nginx

# Test nginx config
docker compose -f docker-compose-beta.yml run --rm nginx nginx -t

# Check if config file exists
ls -la nginx-beta.conf

# Recreate config if needed
./setup-nginx-beta.sh
```

### Issue: Certificate exists but nginx shows errors

**Solution:**
```bash
# Verify certificate files exist
ls -la certbot/conf/live/beta-zaytoonz.pro/

# Check certificate permissions
docker compose -f docker-compose-beta.yml exec nginx ls -la /etc/letsencrypt/live/beta-zaytoonz.pro/

# Reload nginx
docker compose -f docker-compose-beta.yml exec nginx nginx -s reload
```

---

## Renewal Setup

Certificates auto-renew via the certbot container, but you can manually renew:

```bash
# Manual renewal
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  certbot renew" certbot

# Then reload nginx
docker compose -f docker-compose-beta.yml exec nginx nginx -s reload
```

---

## Quick Reference Commands

```bash
# Check certificate status
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  certbot certificates" certbot

# Test renewal (dry run)
docker compose -f docker-compose-beta.yml run --rm --entrypoint "\
  certbot renew --dry-run" certbot

# View nginx logs
docker compose -f docker-compose-beta.yml logs nginx -f

# Restart nginx
docker compose -f docker-compose-beta.yml restart nginx

# Check all containers
docker compose -f docker-compose-beta.yml ps
```

---

## Success Checklist

- [ ] DNS points to 76.13.57.178
- [ ] Nginx container is running
- [ ] Certificate files exist in `certbot/conf/live/beta-zaytoonz.pro/`
- [ ] HTTPS works: `curl -I https://beta-zaytoonz.pro`
- [ ] Browser shows valid SSL certificate
- [ ] HTTP redirects to HTTPS
- [ ] Application loads correctly at `https://beta-zaytoonz.pro`

---

## Need Help?

If you encounter issues:

1. **Check logs:**
   ```bash
   docker compose -f docker-compose-beta.yml logs nginx
   docker compose -f docker-compose-beta.yml logs certbot
   ```

2. **Run diagnostics:**
   ```bash
   ./diagnose-nginx.sh
   ```

3. **Verify each step:** Go through each step above and verify the output matches expectations.
