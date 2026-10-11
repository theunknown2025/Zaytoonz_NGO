# Deploying Zaytoonz on the new server (Docker)

| | |
|---|---|
| Server IP | `168.231.87.171` |
| Domain | `https://zaytoonz.com` (`www.zaytoonz.com` redirects to it) |
| Stack | `docker-compose.yml` → `nextjs` + `python-scraper` + `nginx` + `certbot` |
| App folder on server | `/opt/zaytoonz` |

DNS is already correct: `zaytoonz.com` and `www.zaytoonz.com` resolve to `168.231.87.171`.

---

## 1. Connect to the server

From PowerShell (or PuTTY):

```bash
ssh root@168.231.87.171
```

## 2. Prepare the server (one time)

```bash
# System updates
apt update && apt upgrade -y
apt install -y git curl ufw

# Firewall: only SSH + HTTP + HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Swap (the Next.js build needs ~3-4 GB of memory; skip if the server has 8 GB+ RAM)
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

If something else (Apache, a host-level nginx) already uses ports 80/443, stop it:

```bash
systemctl disable --now nginx apache2 2>/dev/null; ss -tlnp | grep -E ':80|:443' || echo "ports free"
```

## 3. Get the code

The repo is `theunknown2025/Zaytoonz_NGO`. If it is private, create a GitHub
[Personal Access Token](https://github.com/settings/tokens) (scope `repo`) and use it as the password when prompted.

```bash
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git /opt/zaytoonz
cd /opt/zaytoonz
mkdir -p certbot/conf certbot/www
```

## 4. Create the `.env` file

```bash
nano /opt/zaytoonz/.env
```

Paste and fill in your real values:

```env
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── OpenAI ──
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# ── Public URLs ──
NEXT_PUBLIC_SITE_URL=https://zaytoonz.com
NEXT_PUBLIC_APP_URL=https://zaytoonz.com

# ── Scraper (browser goes through https://zaytoonz.com/scraper-api) ──
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=false

# ── Exclusive access gate (protects /, /app, /auth, /seeker, /ngo, /admin) ──
ACCESS_GATE_ENABLED=true
ACCESS_GATE_EMAIL=admin@zaytoonz.com
ACCESS_GATE_PASSWORD=choose-a-strong-password
ACCESS_GATE_SECRET=paste-output-of-openssl-rand-hex-32
```

Generate the gate secret with `openssl rand -hex 32`. Then lock the file down:

```bash
chmod 600 /opt/zaytoonz/.env
```

> `NEXT_PUBLIC_*` values are baked into the Next.js build. If you change them later, you must rebuild (step 9), not just restart.

## 5. Build and start (HTTP first)

```bash
cd /opt/zaytoonz
docker compose build          # 5-15 min the first time
docker compose up -d
docker compose ps             # wait until nextjs shows "healthy" (~1-2 min)
docker compose logs nginx     # should say "No SSL certs yet — starting in HTTP-only mode"
```

Check it answers over HTTP:

```bash
curl -I http://zaytoonz.com/health      # → 200
curl -I http://zaytoonz.com/            # → 200
```

## 6. Get the SSL certificate

```bash
docker compose run --rm --entrypoint certbot certbot certonly --webroot \
  -w /var/www/certbot \
  -d zaytoonz.com -d www.zaytoonz.com \
  --email YOUR_EMAIL@example.com --agree-tos --no-eff-email --non-interactive

docker compose restart nginx
docker compose logs --tail=20 nginx     # should say "SSL certs found — starting in HTTPS mode"
```

The `certbot` container renews the certificate automatically every 12h. After a renewal, nginx
picks up the new certificate on its next restart; add a monthly cron for that:

```bash
(crontab -l 2>/dev/null; echo "0 4 1 * * cd /opt/zaytoonz && docker compose restart nginx") | crontab -
```

## 7. Verify

```bash
curl -I https://zaytoonz.com/                     # → 200
curl -I https://www.zaytoonz.com/                 # → 301 to https://zaytoonz.com/
curl -I http://zaytoonz.com/                      # → 301 to https://zaytoonz.com/
curl -s https://zaytoonz.com/scraper-api/health   # → scraper JSON
```

Then open https://zaytoonz.com in a browser, log in through the access gate, and test `/app`.

## 8. Supabase settings (one time)

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://zaytoonz.com`
- **Redirect URLs**: add `https://zaytoonz.com/**`, remove old `beta-zaytoonz` / old-IP entries.

Also make sure the migration `database/migrations/create_opportunity_qualification_groups.sql`
has been run in the Supabase SQL editor (needed by the qualification groups feature).

## 9. Deploying updates later

On your PC: commit and push to `main`. Then on the server:

```bash
cd /opt/zaytoonz
git pull
docker compose up -d --build
docker image prune -f
```

## 10. Useful commands

```bash
docker compose ps                         # status of all containers
docker compose logs -f nextjs             # live Next.js logs
docker compose logs -f python-scraper     # live scraper logs
docker compose logs -f nginx              # live nginx logs
docker compose restart nextjs             # restart one service
docker compose exec nginx nginx -t        # validate nginx config
docker stats                              # CPU / memory per container
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `502 Bad Gateway` | `docker compose logs nextjs` — the app is still starting or crashed. |
| nginx keeps restarting | `docker compose logs nginx` — usually a config error or port 80/443 already in use (step 2). |
| Build killed / `exit code 137` | Out of memory: add swap (step 2), then `docker compose build nextjs` again. |
| Certbot fails | Check `curl -I http://zaytoonz.com/.well-known/acme-challenge/test` returns 404 (not a timeout) and that ports 80/443 are open in the Hostinger firewall panel too. |
| Scraper page errors | `curl -s https://zaytoonz.com/scraper-api/health` and `docker compose logs python-scraper`. |
| Login gate uses old credentials | `ACCESS_GATE_*` are runtime vars: `docker compose up -d nextjs` after editing `.env`. |
