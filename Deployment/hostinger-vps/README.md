# Hostinger VPS — Docker deployment (master index)

Use this file as the **single entry point**. Follow the numbered steps in order.

| Step | Document | What it covers |
|------|----------|----------------|
| 0 | [00-PROJECT-OVERVIEW.md](00-PROJECT-OVERVIEW.md) | Architecture, routes, env vars, repo layout |
| 1 | [01-PREREQUISITES.md](01-PREREQUISITES.md) | VPS, DNS, SSH, secrets checklist |
| 2 | [02-SERVER-BASELINE.md](02-SERVER-BASELINE.md) | Updates, sudo user, firewall |
| 3 | [03-DOCKER-INSTALL.md](03-DOCKER-INSTALL.md) | Docker Engine + Compose plugin |
| 4 | [04-CLONE-AND-ENV.md](04-CLONE-AND-ENV.md) | Git clone, `.env`, build-time vars |
| 5 | [05-COMPOSE-AND-BUILD.md](05-COMPOSE-AND-BUILD.md) | `docker-compose.production.yml` vs `docker-compose-hostinger.yml` |
| 6 | [06-SSL-AND-NGINX.md](06-SSL-AND-NGINX.md) | TLS, Certbot, Nginx notes |
| 7 | [07-VERIFY-AND-OPS.md](07-VERIFY-AND-OPS.md) | curl checks, logs, rollback |

## Quick reference (after setup)

Production stack (typical):

```bash
cd /var/www/zaytoonz-ngo   # or your path
docker compose -f docker-compose.production.yml --env-file .env up -d
```

Verify root page configuration (on server, path may need editing in script):

```bash
bash scripts/verify-main-page.sh
```

## Executable checklist

[deploy-hostinger.sh](deploy-hostinger.sh) runs a non-destructive sequence: prints the doc order, optionally builds and starts the production compose file. It does **not** replace reading the step files (especially SSL and first-time Certbot).

## Compose files (repo root)

| File | Use case |
|------|----------|
| `docker-compose.production.yml` | Image build via `Dockerfile.webapp`, recommended for production |
| `docker-compose-hostinger.yml` | Bind-mount + in-container `npm build` (quick iterations) |
| `docker-compose-beta.yml` | Beta/staging variant |

## Support

- Scraper code path: **`python_scraper/`** (mounted into containers as `/app/python_scraper`).
- Social home: **`/`** serves `ZaytoonzSMLanding`; **`/social`** redirects to **`/`**.
