# Hosting Zaytoonz on the Hostinger VPS with Docker

| | |
|---|---|
| VPS IP | `168.231.87.171` |
| Domain | `https://zaytoonz.com` (`www.zaytoonz.com` → redirects to it) |
| Repo | `https://github.com/theunknown2025/Zaytoonz_NGO` (branch `main`) |
| App folder on VPS | `/opt/zaytoonz` |
| Compose file | `docker-compose.yml` (the default, no `-f` needed) |

## What runs on the VPS

```
Internet ──► :80 / :443  nginx (zaytoonz-nginx)
                           ├── /               ──► nextjs:3000          (zaytoonz-nextjs)
                           ├── /scraper-api/*  ──► python-scraper:8000  (zaytoonz-scraper, Scrape_Master)
                           └── /.well-known/   ──► certbot webroot      (SSL validation)
             certbot (zaytoonz-certbot) renews the Let's Encrypt certificate every 12h
             Supabase (database + auth) stays in the Supabase cloud — nothing to host
```

| Container | Built from | Port on VPS |
|---|---|---|
| `zaytoonz-nextjs` | `Dockerfile.webapp` | `127.0.0.1:3002` (local only) |
| `zaytoonz-scraper` | `Dockerfile.scraper` (copies `Scrape_Master/`, installs Chrome + Playwright) | `127.0.0.1:8000` (local only) |
| `zaytoonz-nginx` | `nginx:alpine` + `nginx-init.conf` / `nginx-webapp.conf` | `80`, `443` (public) |
| `zaytoonz-certbot` | `certbot/certbot` | none |

## Directory layout on the VPS (after setup)

```
/opt/zaytoonz/                      ← git clone of the repo
├── .env                            ← YOU create it (secrets, never committed)
├── docker-compose.yml
├── Dockerfile.webapp               ← Next.js image
├── Dockerfile.scraper              ← Scrape_Master image
├── Dockerfile.scraper.dockerignore
├── nginx-init.conf                 ← HTTP-only config (before SSL)
├── nginx-webapp.conf               ← HTTPS config (after SSL)
├── app/ public/ ...                ← Next.js source
├── Scrape_Master/                  ← scraper source (baked into the scraper image)
└── certbot/                        ← YOU create it
    ├── conf/                       ← certificates (/etc/letsencrypt)
    └── www/                        ← ACME challenge files
```

---

## Step 0 — Hostinger panel (hPanel)

1. **hPanel → VPS → OS & Panel → Operating System**: use **Ubuntu 24.04** (plain, no control panel).
   Reinstalling the OS wipes the VPS — only do it if the VPS is new or you don't need what's on it.
2. **hPanel → VPS → Settings / SSH access**: set the root password (or add your SSH public key).
3. **hPanel → VPS → Security → Firewall**: if a firewall is enabled, allow inbound **TCP 22, 80, 443**.
4. **hPanel → Domains → zaytoonz.com → DNS / Nameservers**: check you have
   - `A  @    168.231.87.171`
   - `A  www  168.231.87.171` (or `CNAME www zaytoonz.com`)
   - no `AAAA` records pointing to an old server.

   (Already verified: both names resolve to `168.231.87.171` and there are no AAAA records.)

---

## Step 1 — Connect to the VPS

From PowerShell on your PC:

```powershell
ssh root@168.231.87.171
```

Type `yes` the first time, then the root password. Everything below is run **on the VPS**.

---

## Step 2 — Update the system

```bash
apt update && apt upgrade -y
apt install -y git curl nano ufw ca-certificates
timedatectl set-timezone Africa/Casablanca     # optional, for readable log timestamps
reboot                                          # only if the upgrade installed a new kernel
```

Reconnect with `ssh root@168.231.87.171` if you rebooted.

---

## Step 3 — Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

Ports 3002 and 8000 stay closed: the compose file binds them to `127.0.0.1` only.

---

## Step 4 — Swap memory

The Next.js build and Chrome (scraper) are memory-hungry. Add 4 GB of swap (skip if `free -h` already shows swap):

```bash
free -h
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h                                         # Swap: 4.0Gi
```

---

## Step 5 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version
docker compose version
docker run --rm hello-world                     # sanity check
```

Make sure nothing else is using ports 80/443 (Hostinger images sometimes ship Apache/nginx):

```bash
systemctl disable --now apache2 nginx 2>/dev/null
ss -tlnp | grep -E ':80 |:443 ' || echo "ports 80/443 are free"
```

---

## Step 6 — Create the directory and get the code

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz
cd /opt/zaytoonz
git log --oneline -3                            # confirm you have the latest commits
```

The repo is private: when Git asks, use your GitHub username and a
**Personal Access Token** as the password (GitHub → Settings → Developer settings →
Personal access tokens → Fine-grained → read access to `Zaytoonz_NGO` contents).
To avoid retyping it on every `git pull`:

```bash
git config --global credential.helper store     # saves it in ~/.git-credentials after the next pull
```

Create the certificate directories:

```bash
mkdir -p /opt/zaytoonz/certbot/conf /opt/zaytoonz/certbot/www
```

---

## Step 7 — Create the `.env` file

```bash
nano /opt/zaytoonz/.env
```

Paste this and replace every value in `<...>`:

```env
# ── Supabase (Supabase dashboard → Project Settings → API) ──
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>

# ── OpenAI (used by the web app AND by Scrape_Master) ──
OPENAI_API_KEY=<sk-...>
NEXT_PUBLIC_OPENAI_API_KEY=<sk-...>
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# ── Optional: other LLMs the scraper can use ──
GEMINI_API_KEY=
GROQ_API_KEY=

# ── Public URLs ──
NEXT_PUBLIC_SITE_URL=https://zaytoonz.com
NEXT_PUBLIC_APP_URL=https://zaytoonz.com

# ── Scrape_Master ──
# Browser calls go to https://zaytoonz.com/scraper-api (nginx → python-scraper).
# Server-side calls go straight to http://python-scraper:8000 on the Docker network.
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=false
SCRAPER_CORS_ORIGINS=https://zaytoonz.com,https://www.zaytoonz.com

# ── Exclusive access gate (protects /, /app, /auth, /seeker, /ngo, /admin) ──
ACCESS_GATE_ENABLED=true
ACCESS_GATE_EMAIL=<admin email>
ACCESS_GATE_PASSWORD=<strong password>
ACCESS_GATE_SECRET=<output of: openssl rand -hex 32>
```

Save with `Ctrl+O`, `Enter`, exit with `Ctrl+X`. Generate the secret in another line of the terminal:

```bash
openssl rand -hex 32
```

Protect the file and check it is read correctly:

```bash
chmod 600 /opt/zaytoonz/.env
cd /opt/zaytoonz
docker compose config --quiet && echo "compose + .env OK"
```

> `NEXT_PUBLIC_*` variables are **baked into the Next.js image at build time**. Changing them
> later requires a rebuild (`docker compose up -d --build nextjs`). The other variables only
> need a container recreate (`docker compose up -d nextjs`).

---

## Step 8 — Build the images

```bash
cd /opt/zaytoonz
export BUILDKIT_PROGRESS=plain                  # stream every build step live (npm ci, next build, ...)
docker compose build python-scraper             # Scrape_Master: Chrome + Playwright (~5-10 min)
docker compose build nextjs                     # Next.js production build (~5-10 min)
docker images | grep zaytoonz                   # zaytoonz-nextjs and zaytoonz-scraper
```

If a build gets killed (`exit code 137`), it ran out of memory — check swap (Step 4) and retry.

---

## Step 9 — Start everything (HTTP first)

```bash
docker compose up -d
docker compose ps
```

Wait 1–2 minutes until `zaytoonz-nextjs` and `zaytoonz-scraper` show `(healthy)` and
`zaytoonz-nginx` is `Up`. Then:

```bash
docker compose logs --tail=20 nginx             # "No SSL certs yet — starting in HTTP-only mode"
curl -I http://localhost/health                 # 200
curl -s http://localhost:8000/health            # scraper JSON (direct)
curl -s http://zaytoonz.com/scraper-api/health  # scraper JSON (through nginx)
curl -I http://zaytoonz.com/                    # 200
```

At this point `http://zaytoonz.com` works in the browser (without the padlock).

---

## Step 10 — SSL certificate (HTTPS)

Dry run first (doesn't count against Let's Encrypt rate limits):

```bash
cd /opt/zaytoonz
docker compose run --rm --entrypoint certbot certbot certonly --webroot \
  -w /var/www/certbot \
  -d zaytoonz.com -d www.zaytoonz.com \
  --email <your-email> --agree-tos --no-eff-email --non-interactive --dry-run
```

If it says `The dry run was successful`, run it for real (same command without `--dry-run`):

```bash
docker compose run --rm --entrypoint certbot certbot certonly --webroot \
  -w /var/www/certbot \
  -d zaytoonz.com -d www.zaytoonz.com \
  --email <your-email> --agree-tos --no-eff-email --non-interactive

ls certbot/conf/live/zaytoonz.com/              # fullchain.pem  privkey.pem ...
docker compose restart nginx
docker compose logs --tail=20 nginx             # "SSL certs found — starting in HTTPS mode"
docker compose exec nginx nginx -t              # syntax is ok / test is successful
```

Renewal: the `certbot` container renews automatically. nginx loads a renewed certificate
on restart, so add a weekly restart (Mondays 04:00):

```bash
(crontab -l 2>/dev/null; echo "0 4 * * 1 cd /opt/zaytoonz && docker compose restart nginx >/dev/null 2>&1") | crontab -
crontab -l
```

---

## Step 11 — Verify the deployment

```bash
curl -I https://zaytoonz.com/                       # 200
curl -I http://zaytoonz.com/                        # 301 → https://zaytoonz.com/
curl -I https://www.zaytoonz.com/                   # 301 → https://zaytoonz.com/
curl -s https://zaytoonz.com/scraper-api/health     # scraper JSON
docker compose ps                                   # all Up / healthy
```

In the browser:

1. `https://zaytoonz.com` → padlock, social landing page with the access-gate login.
2. Log in with `ACCESS_GATE_EMAIL` / `ACCESS_GATE_PASSWORD` → `/app`.
3. Sign in as an admin → **Admin → Scraper**, scrape a test URL → confirms Scrape_Master works end to end.
4. Sign in as an NGO → create an opportunity with qualification groups, export CVs as PDF.

---

## Step 12 — Supabase settings (one time)

Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://zaytoonz.com`
- **Redirect URLs**: add `https://zaytoonz.com/**`; remove `beta-zaytoonz` and old-IP entries.

Supabase dashboard → **SQL Editor**: run `database/migrations/create_opportunity_qualification_groups.sql`
if you haven't already (required by the qualification groups feature).

---

## Step 13 — Deploying updates later

On your PC: commit and push to `main`. Then on the VPS:

```bash
cd /opt/zaytoonz
./deploy.sh                                     # git pull + build (live progress) + restart + health check
```

Only the web app changed? `./deploy.sh nextjs`. Only the scraper? `./deploy.sh python-scraper`.
Each build step is printed as it runs (with its duration), and the full output is saved in
`logs/deploy-<timestamp>.log`. The first time, run `chmod +x deploy.sh` if Git didn't keep the
executable bit.

---

## Everyday commands

```bash
cd /opt/zaytoonz
docker compose ps                               # status
docker compose logs -f nextjs                   # web app logs (Ctrl+C to quit)
docker compose logs -f python-scraper           # Scrape_Master logs
docker compose logs -f nginx                    # proxy logs
docker compose restart python-scraper           # restart one service
docker compose down                             # stop everything
docker compose up -d                            # start everything
docker stats                                    # live CPU / RAM per container
df -h && docker system df                       # disk usage
```

## Troubleshooting

| Symptom | What to check |
|---|---|
| `502 Bad Gateway` on the site | `docker compose logs nextjs` — still starting, or crashed (missing env var). |
| `502` only on scraper pages | `docker compose logs python-scraper`; `curl -s http://localhost:8000/health`. |
| nginx keeps restarting | `docker compose logs nginx` — config error, or port 80/443 used by another program (Step 5). |
| Build killed / `exit code 137` | Out of memory → swap (Step 4), then rebuild. |
| Scraper fails with Chrome/Playwright errors | `docker compose build --no-cache python-scraper && docker compose up -d python-scraper`. |
| Certbot "connection refused / timeout" | Port 80 closed in hPanel firewall or ufw; `curl -I http://zaytoonz.com/health` from your PC must return 200. |
| Certbot "too many failed authorizations" | Rate-limited: wait 1 hour, always use `--dry-run` first. |
| Access-gate login rejected | Check `ACCESS_GATE_*` in `.env`, then `docker compose up -d nextjs`. |
| Changed a `NEXT_PUBLIC_*` value, no effect | Needs rebuild: `docker compose up -d --build nextjs`. |
