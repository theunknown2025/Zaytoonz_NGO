# Diagnosing zaytoonz.com Connection Refused Error

## Quick Diagnostic Commands

Run these commands on your server to diagnose the issue:

### 1. Check if nginx is actually listening on port 80:
```bash
docker exec zaytoonz-nginx netstat -tlnp | grep :80
# OR
docker exec zaytoonz-nginx ss -tlnp | grep :80
```

### 2. Check nginx logs for errors:
```bash
docker logs zaytoonz-nginx --tail 50
```

### 3. Check if nginx process is running:
```bash
docker exec zaytoonz-nginx ps aux | grep nginx
```

### 4. Test nginx configuration:
```bash
docker exec zaytoonz-nginx nginx -t
```

### 5. Check if nextjs is responding:
```bash
docker exec zaytoonz-nginx wget -O- http://nextjs:3000 2>&1 | head -20
# OR
curl -v http://nextjs:3000
```

### 6. Check if port 80 is accessible from host:
```bash
curl -v http://localhost:80
# OR
wget -O- http://localhost:80 2>&1 | head -20
```

### 7. Check firewall status:
```bash
ufw status
# OR
iptables -L -n | grep 80
```

### 8. Check if Hostinger has port 80 open:
- Go to Hostinger's firewall/security settings
- Ensure port 80 (HTTP) is open

### 9. Check nginx configuration inside container:
```bash
docker exec zaytoonz-nginx cat /etc/nginx/nginx.conf
```

### 10. Test direct connection to nextjs:
```bash
docker exec zaytoonz-nextjs wget -O- http://localhost:3000 2>&1 | head -20
```

## Common Issues and Fixes

### Issue 1: Nginx not listening on port 80
**Symptom**: `netstat` shows no process on port 80
**Fix**: Nginx might have failed to start. Check logs and restart:
```bash
docker restart zaytoonz-nginx
docker logs zaytoonz-nginx --tail 50
```

### Issue 2: Firewall blocking port 80
**Symptom**: Port 80 is closed in firewall
**Fix**: Open port 80 in Hostinger's firewall settings or:
```bash
ufw allow 80/tcp
ufw reload
```

### Issue 3: Nginx configuration error
**Symptom**: `nginx -t` shows errors
**Fix**: Check the nginx.conf file and fix syntax errors

### Issue 4: Next.js not responding
**Symptom**: Can't connect to nextjs:3000 from nginx
**Fix**: Check nextjs logs:
```bash
docker logs zaytoonz-nextjs --tail 50
```

### Issue 5: Hostinger port mapping issue
**Symptom**: Container shows running but port not accessible
**Fix**: Check Hostinger's port mapping configuration in Docker Manager

## Next Steps

1. Run the diagnostic commands above
2. Share the output of:
   - `docker logs zaytoonz-nginx --tail 50`
   - `docker exec zaytoonz-nginx nginx -t`
   - `docker exec zaytoonz-nginx netstat -tlnp | grep :80`
3. Check Hostinger's firewall/security settings for port 80
