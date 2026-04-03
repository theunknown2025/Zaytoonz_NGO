# Step 7 — Verify, monitor, and operate

## Smoke tests

From the VPS (or your laptop against the public domain):

```bash
curl -I https://yourdomain.com/
curl -I https://yourdomain.com/social
curl -I https://yourdomain.com/app
```

- `/` should return **200** (Social landing).
- `/social` should return **307/308** to `/` if redirect is enabled.
- `/app` should return **200** (full landing).

```bash
curl -I https://yourdomain.com/scraper-api/health
```

(Adjust path if your Nginx location differs.)

## Project verification script

On the server, from the app directory:

```bash
bash scripts/verify-main-page.sh
```

Update `APP_DIR` inside the script if your deploy path is not `/var/www/zaytoonz-ngo`.

## Logs

```bash
docker compose -f docker-compose.production.yml logs -f nextjs
docker compose -f docker-compose.production.yml logs -f python-scraper
docker compose -f docker-compose.production.yml logs -f nginx
```

## Restarts

```bash
docker compose -f docker-compose.production.yml restart nextjs
```

## Rollback

- Check out the previous Git commit or tag.
- Rebuild and recreate: `docker compose build --no-cache nextjs && docker compose up -d`.

## Backups

- Back up `.env`, `certbot/conf`, and any persistent volumes (Compose `volumes:`).
- Supabase data lives in Supabase (use their backup/export tools for database).

## Next step

Return to the master index [README.md](README.md) for the full sequence.
