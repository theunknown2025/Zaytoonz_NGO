# Fix: Docker Compose Environment Variables Not Loading

## Problem

Docker Compose is showing warnings:
```
WARN[0000] The "NEXT_PUBLIC_SUPABASE_URL" variable is not set. Defaulting to a blank string.
```

This happens because Docker Compose by default looks for a `.env` file, but we're using `.env.production`.

## Solution Options

### Option 1: Use the Helper Script (Recommended)

We've created a helper script that loads `.env.production` before running docker compose:

```bash
# Make script executable
chmod +x load-env-and-compose.sh

# Use it instead of docker compose directly
./load-env-and-compose.sh up -d
./load-env-and-compose.sh down
./load-env-and-compose.sh ps
./load-env-and-compose.sh logs -f
```

### Option 2: Create a .env Symlink

Create a symlink from `.env` to `.env.production`:

```bash
cd /opt/zaytoonz-ngo
ln -sf .env.production .env

# Now docker compose will work normally
docker compose -f docker-compose-beta.yml up -d
```

### Option 3: Use --env-file Flag

Docker Compose supports `--env-file` flag:

```bash
docker compose --env-file .env.production -f docker-compose-beta.yml up -d
```

However, this only works for newer versions of Docker Compose (v2.20+).

### Option 4: Copy .env.production to .env

Simply copy the file:

```bash
cd /opt/zaytoonz-ngo
cp .env.production .env

# Now docker compose will work normally
docker compose -f docker-compose-beta.yml up -d
```

**Note:** If you use this method, make sure to update `.env` whenever you update `.env.production`.

---

## Quick Fix (On Your VPS Right Now)

Run these commands:

```bash
cd /opt/zaytoonz-ngo

# Option A: Create symlink (recommended)
ln -sf .env.production .env

# Option B: Or copy the file
# cp .env.production .env

# Verify the file exists
ls -la .env

# Now try docker compose again
docker compose -f docker-compose-beta.yml up -d
```

---

## Verify It's Working

After applying the fix, you should NOT see any warnings:

```bash
docker compose -f docker-compose-beta.yml config | grep SUPABASE
# Should show your actual values, not blank strings
```

---

## Update deploy-vps-beta.sh

The deployment script should also create the `.env` file. We'll update it in the next commit.
