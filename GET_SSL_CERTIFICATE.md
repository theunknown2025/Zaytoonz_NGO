# Getting SSL Certificate for beta-zaytoonz.pro

## Quick Start

Since your domain is already connected to your VPS, you can get the SSL certificate by running one of these scripts on your VPS:

### Option 1: Simple SSL Setup (Recommended)
```bash
# SSH into your VPS, then:
cd /opt/zaytoonz-ngo  # or wherever your project is located
sudo bash init-ssl-beta.sh
```

### Option 2: Complete Setup (Includes DNS verification)
```bash
# SSH into your VPS, then:
cd /opt/zaytoonz-ngo  # or wherever your project is located
sudo bash setup-domain-and-ssl.sh
```

### Option 3: Manual Step-by-Step
```bash
# SSH into your VPS, then:
cd /opt/zaytoonz-ngo  # or wherever your project is located
sudo bash manual-ssl-setup.sh
```

## Prerequisites

Before running the SSL setup, make sure:

1. ✅ **DNS is configured**: `beta-zaytoonz.pro` points to `76.13.57.178`
   - Check: `dig beta-zaytoonz.pro +short` (should return `76.13.57.178`)

2. ✅ **Ports are open**: Ports 80 and 443 must be accessible from the internet
   - Check firewall: `sudo ufw status`
   - If needed: `sudo ufw allow 80/tcp` and `sudo ufw allow 443/tcp`

3. ✅ **Docker is running**: Your containers should be up
   - Check: `docker compose -f docker-compose-beta.yml ps`

4. ✅ **Nginx config exists**: `nginx-beta.conf` should be in your project directory

## What the Script Does

1. Creates temporary SSL certificate (so nginx can start)
2. Starts nginx container
3. Removes temporary certificate
4. Requests real Let's Encrypt certificate
5. Reloads nginx with the real certificate

## Troubleshooting

### DNS Not Resolving
```bash
# Wait 5-30 minutes after DNS changes, then verify:
dig beta-zaytoonz.pro +short
```

### Port 80 Not Accessible
```bash
# Check if nginx is listening:
sudo netstat -tlnp | grep :80

# Check firewall:
sudo ufw status
sudo ufw allow 80/tcp
```

### Certificate Request Fails
- Make sure DNS is fully propagated (can take up to 48 hours)
- Ensure port 80 is accessible from the internet
- Check nginx logs: `docker compose -f docker-compose-beta.yml logs nginx`

### Nginx Won't Start
- Check nginx config: `docker compose -f docker-compose-beta.yml exec nginx nginx -t`
- Check logs: `docker compose -f docker-compose-beta.yml logs nginx`

## Verify SSL After Setup

```bash
# Test HTTPS connection
curl -I https://beta-zaytoonz.pro

# Check certificate details
openssl s_client -connect beta-zaytoonz.pro:443 -servername beta-zaytoonz.pro < /dev/null | openssl x509 -noout -dates
```

## Automatic Renewal

The certbot container in `docker-compose-beta.yml` is configured to automatically renew certificates every 12 hours. No manual action needed!

## Need Help?

If you encounter issues:
1. Check nginx logs: `docker compose -f docker-compose-beta.yml logs nginx`
2. Check certbot logs: `docker compose -f docker-compose-beta.yml logs certbot`
3. Verify DNS: `dig beta-zaytoonz.pro +short`
4. Test port accessibility: `curl -I http://beta-zaytoonz.pro`
