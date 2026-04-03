# Step 5 — Docker Compose: build and run

This project ships multiple Compose files at the repo root. Choose one stack for the VPS.

## Option A — Production image (`docker-compose.production.yml`) — recommended

- Builds Next.js with **`Dockerfile.webapp`** (multi-stage build).
- Mounts only `./public` read-only into the app container; `.next` lives in the image.
- **`python_scraper`** volume: `./python_scraper:/app/python_scraper:ro`.

From the project root:

```bash
docker compose -f docker-compose.production.yml --env-file .env build
docker compose -f docker-compose.production.yml --env-file .env up -d
docker compose -f docker-compose.production.yml ps
```

Ports (typical in file): Next.js **3002**→3000, scraper **8000**, NLWeb **8002**→8000, Nginx **80/443**. Adjust host firewall if you expose extra ports only for debugging.

## Option B — Hostinger bind-mount build (`docker-compose-hostinger.yml`)

- Mounts the **full repo** into the `nextjs` service and runs `npm install`, `npm run build`, `npm start` inside the container on startup.
- Useful for quick iteration; slower restarts and heavier disk I/O than Option A.
- Validates that `app/page.tsx` contains `ZaytoonzSMLanding` (Social home).

```bash
docker compose -f docker-compose-hostinger.yml --env-file .env up -d --build
```

## Service dependencies

- `nextjs` may `depends_on` `nlweb` and/or `python-scraper` depending on the file.
- First boot of **python-scraper** can take several minutes (Chrome + Playwright install).

## Internal URLs

Inside the Docker network, services resolve by name (e.g. `http://python-scraper:8000`, `http://nextjs:3000`). Nginx uses these names in `proxy_pass`.

## Next step

Continue to [06-SSL-AND-NGINX.md](06-SSL-AND-NGINX.md).
