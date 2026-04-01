# Scraper 502 Bad Gateway – Troubleshooting

If you get **502** when using `/scraper-api/api/scrape`, Nginx cannot reach the scraper backend.

## Supabase env (python-scraper container)

The API reads `SUPABASE_URL` / `SUPABASE_ANON_KEY` **or** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If none are set, scraping returns **Supabase not configured**. Ensure your `.env` or compose passes these into the `python-scraper` service.

## Docker deployment

1. **Confirm python-scraper is running**
   ```bash
   docker compose -f docker-compose-beta.yml ps python-scraper
   ```

2. **Inspect scraper logs**
   ```bash
   docker compose -f docker-compose-beta.yml logs python-scraper
   ```
   If it fails during startup (e.g. installing Playwright), fix those errors first.

3. **Restart scraper and nginx**
   ```bash
   docker compose -f docker-compose-beta.yml restart python-scraper nginx
   ```

4. **Check scraper health**
   ```bash
   docker compose -f docker-compose-beta.yml exec python-scraper curl -s http://localhost:8000/health
   ```

## PM2 deployment (nginx on host)

Use `nginx-beta-pm2.conf`, which proxies `/scraper-api/` to `127.0.0.1:8000`.

1. Ensure the PM2 config matches the nginx upstream:
   - Next.js on port 3000
   - Python scraper on port 8000

2. Confirm scraper is running:
   ```bash
   pm2 status python-scraper
   pm2 logs python-scraper
   ```

3. Test the scraper locally:
   ```bash
   curl -s http://127.0.0.1:8000/health
   ```

4. If using Hostinger and the wrong nginx config:
   - Docker: keep `nginx-beta.conf` (uses `python-scraper:8000`)
   - PM2: switch to `nginx-beta-pm2.conf` (uses `127.0.0.1:8000`)
