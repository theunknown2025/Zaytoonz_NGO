# Step 6 — TLS (SSL) and Nginx

## HTTP first

Ensure the app responds on port **80** through Nginx before requesting certificates.

```bash
curl -I http://YOUR_DOMAIN/
```

## Let’s Encrypt (Certbot)

The Compose files include a **certbot** service and volume mounts such as:

- `./certbot/conf` → `/etc/letsencrypt`
- `./certbot/www` → `/var/www/certbot`

The **first certificate** is usually obtained with a **standalone** or **webroot** `certbot certonly` run **once** on the host or in a one-off container, while Nginx serves `/.well-known/acme-challenge/` from `certbot/www`.

Example webroot flow (adapt domain and email):

```bash
mkdir -p certbot/conf certbot/www
docker compose -f docker-compose.production.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email you@example.com --agree-tos --non-interactive
```

Then ensure the **Nginx** container loads certificates from `/etc/letsencrypt` (read-only mount is already in compose files). The **inline nginx config** in `docker-compose-hostinger.yml` is minimal (HTTP only); for HTTPS you typically add a `server { listen 443 ssl; ... }` block that references `fullchain.pem` and `privkey.pem` under `/etc/letsencrypt/live/yourdomain/`.

## server_name

Replace placeholder `_` or default server names with your real **`server_name`** so TLS SNI and routing match your domain.

## Renewal

The certbot sidecar in Compose often runs `certbot renew` on a loop. Confirm renewal with:

```bash
docker compose logs certbot
```

## Next step

Continue to [07-VERIFY-AND-OPS.md](07-VERIFY-AND-OPS.md).
