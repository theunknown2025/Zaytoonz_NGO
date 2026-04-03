# Step 4 — Clone repository and configure `.env`

## Clone

Pick a deployment directory (example):

```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone <your-repo-url> zaytoonz-ngo
cd zaytoonz-ngo
```

Use a **release tag** or pinned commit for production.

## Environment file

1. Create `.env` in the project root (same directory as `docker-compose.production.yml`).
2. **Never commit** `.env` or paste secrets into chat logs.

### Minimum variables (see also [00-PROJECT-OVERVIEW.md](00-PROJECT-OVERVIEW.md))

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=optional-if-build-needs-it
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=https://yourdomain.com/scraper-api
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
```

### Build-time vs runtime (`Dockerfile.webapp`)

`NEXT_PUBLIC_*` variables are baked into the Next.js client bundle at **build** time when using `Dockerfile.webapp`. Pass them as **build args** in Compose (as in `docker-compose.production.yml`) so `docker compose build` receives them.

Runtime-only secrets (e.g. some server keys) can be set in `environment:` without being `NEXT_PUBLIC_*`.

## Next step

Continue to [05-COMPOSE-AND-BUILD.md](05-COMPOSE-AND-BUILD.md).
