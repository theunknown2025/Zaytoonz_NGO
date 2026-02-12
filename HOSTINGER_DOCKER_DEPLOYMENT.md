# Hostinger Docker Compose Deployment Guide

This document contains the complete Docker Compose YAML and all environment variables needed for deployment on Hostinger.

## Docker Compose YAML (6632 characters - under 8192 limit)

Copy and paste this entire YAML into Hostinger's Docker Compose YAML editor:

```yaml
services:
  nextjs:
    image: node:20-alpine
    container_name: zaytoonz-nextjs
    working_dir: /app
    command:
      - sh
      - -c
      - |
        rm -rf .next
        grep -q "ZaytoonzSMLanding" page.tsx || exit 1
        grep -q "LandingPage" app/page.tsx || exit 1
        npm install --production
        npm run build
        npm start
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=${PORT:-3000}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}
      - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
      - OPENAI_MAX_TOKENS=${OPENAI_MAX_TOKENS:-2000}
      - NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=${NEXT_PUBLIC_USE_EXTERNAL_SCRAPER:-true}
      - NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=${NEXT_PUBLIC_EXTERNAL_SCRAPER_URL:-https://zaytoonz.com/scraper-api}
      - NEXT_PUBLIC_FALLBACK_TO_LOCAL=${NEXT_PUBLIC_FALLBACK_TO_LOCAL:-true}
      - NLWEB_URL=${NLWEB_URL:-http://nlweb:8000}
    volumes:
      - ./:/app
      - /app/node_modules
    restart: unless-stopped
    depends_on:
      - python-scraper
      - nlweb
    networks:
      - zaytoonz-network

  certbot:
    image: certbot/certbot
    container_name: zaytoonz-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - zaytoonz-network

  python-scraper:
    image: python:3.11-slim
    container_name: zaytoonz-scraper
    working_dir: /app/Scrape_Master
    command: sh -c "apt-get update && apt-get install -y wget gnupg ca-certificates && mkdir -p /etc/apt/keyrings && wget -q -O /etc/apt/keyrings/google-chrome.gpg https://dl-ssl.google.com/linux/linux_signing_key.pub && echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list && apt-get update && apt-get install -y google-chrome-stable && pip install --no-cache-dir -r requirements.txt && playwright install chromium && uvicorn api_wrapper:app --host 0.0.0.0 --port 8000"
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=${PYTHONUNBUFFERED:-1}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./Scrape_Master:/app/Scrape_Master
    restart: unless-stopped
    networks:
      - zaytoonz-network

  nlweb:
    image: python:3.13-slim
    container_name: zaytoonz-nlweb
    working_dir: /app/NLWeb-main
    command: sh -c "cd code/python && pip install --no-cache-dir -r requirements.txt && python app-file.py"
    ports:
      - "8002:8000"
    environment:
      - PYTHONUNBUFFERED=${PYTHONUNBUFFERED:-1}
      - PYTHONPATH=/app/NLWeb-main/code/python
      - PORT=8000
      - NLWEB_CONFIG_DIR=/app/NLWeb-main/config
      - NLWEB_OUTPUT_DIR=/app/NLWeb-main/data/nlweb
      - NLWEB_OUTPUT_DIR_RELATIVE=../data/nlweb
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_ENDPOINT=${OPENAI_ENDPOINT:-https://api.openai.com/v1/chat/completions}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-}
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-}
      - AZURE_VECTOR_SEARCH_ENDPOINT=${AZURE_VECTOR_SEARCH_ENDPOINT:-}
      - AZURE_VECTOR_SEARCH_API_KEY=${AZURE_VECTOR_SEARCH_API_KEY:-}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
      - INCEPTION_ENDPOINT=${INCEPTION_ENDPOINT:-}
      - INCEPTION_API_KEY=${INCEPTION_API_KEY:-}
      - SNOWFLAKE_ACCOUNT_URL=${SNOWFLAKE_ACCOUNT_URL:-}
      - SNOWFLAKE_PAT=${SNOWFLAKE_PAT:-}
      - SNOWFLAKE_EMBEDDING_MODEL=${SNOWFLAKE_EMBEDDING_MODEL:-}
      - SNOWFLAKE_CORTEX_SEARCH_SERVICE=${SNOWFLAKE_CORTEX_SEARCH_SERVICE:-}
      - MILVUS_ENDPOINT=${MILVUS_ENDPOINT:-}
      - MILVUS_TOKEN=${MILVUS_TOKEN:-}
      - QDRANT_URL=${QDRANT_URL:-}
      - QDRANT_API_KEY=${QDRANT_API_KEY:-}
      - OPENSEARCH_ENDPOINT=${OPENSEARCH_ENDPOINT:-}
      - OPENSEARCH_CREDENTIALS=${OPENSEARCH_CREDENTIALS:-}
      - OLLAMA_URL=${OLLAMA_URL:-}
      - ELASTICSEARCH_URL=${ELASTICSEARCH_URL:-}
      - ELASTICSEARCH_API_KEY=${ELASTICSEARCH_API_KEY:-}
      - POSTGRES_CONNECTION_STRING=${POSTGRES_CONNECTION_STRING:-}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-}
      - NLWEB_LOGGING_PROFILE=${NLWEB_LOGGING_PROFILE:-production}
      - HF_TOKEN=${HF_TOKEN:-}
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN:-}
      - CLOUDFLARE_RAG_ID_ENV=${CLOUDFLARE_RAG_ID_ENV:-}
      - CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:-}
    volumes:
      - ./NLWeb-main:/app/NLWeb-main
      - nlweb-data:/app/NLWeb-main/data
    restart: unless-stopped
    networks:
      - zaytoonz-network

  nginx:
    image: nginx:alpine
    container_name: zaytoonz-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    entrypoint: |
      sh -c "
        echo 'Waiting for services to be ready...'
        sleep 5
        echo 'events{worker_connections 1024;}http{resolver 127.0.0.11 valid=30s;include /etc/nginx/mime.types;default_type application/octet-stream;upstream nextjs_backend{server nextjs:3000 max_fails=3 fail_timeout=30s;}upstream python_backend{server python-scraper:8000 max_fails=3 fail_timeout=30s;}server{listen 80;server_name _;client_max_body_size 100M;location /.well-known/acme-challenge/{root /var/www/certbot;try_files \$uri =404;}location /{proxy_pass http://nextjs_backend;proxy_http_version 1.1;proxy_set_header Upgrade \$http_upgrade;proxy_set_header Connection upgrade;proxy_set_header Host \$host;proxy_set_header X-Real-IP \$remote_addr;proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;proxy_set_header X-Forwarded-Proto \$scheme;proxy_cache_bypass \$http_upgrade;proxy_read_timeout 300s;proxy_connect_timeout 75s;}location /scraper-api/{proxy_pass http://python_backend/;proxy_http_version 1.1;proxy_set_header Host \$host;proxy_set_header X-Real-IP \$remote_addr;proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;proxy_set_header X-Forwarded-Proto \$scheme;proxy_read_timeout 600s;proxy_connect_timeout 75s;}}}' > /etc/nginx/nginx.conf && nginx -g 'daemon off;'
      "
    depends_on:
      - nextjs
      - python-scraper
    restart: unless-stopped
    networks:
      - zaytoonz-network

networks:
  zaytoonz-network:
    driver: bridge

volumes:
  nlweb-data:
```

## Environment Variables (1877 characters)

Copy and paste all of these environment variables into Hostinger's Environment Variables section:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
NEXT_PUBLIC_OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
NLWEB_URL=http://nlweb:8000
PYTHONUNBUFFERED=1
PYTHONPATH=/app/NLWeb-main/code/python
NLWEB_CONFIG_DIR=/app/NLWeb-main/config
NLWEB_OUTPUT_DIR=/app/NLWeb-main/data/nlweb
NLWEB_OUTPUT_DIR_RELATIVE=../data/nlweb
OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_VECTOR_SEARCH_ENDPOINT=
AZURE_VECTOR_SEARCH_API_KEY=
ANTHROPIC_API_KEY=
INCEPTION_ENDPOINT=https://api.inceptionlabs.ai/v1/chat/completions
INCEPTION_API_KEY=
SNOWFLAKE_ACCOUNT_URL=
SNOWFLAKE_PAT=
SNOWFLAKE_EMBEDDING_MODEL=snowflake-arctic-embed-l-v2.0
SNOWFLAKE_CORTEX_SEARCH_SERVICE=
MILVUS_ENDPOINT=
MILVUS_TOKEN=
QDRANT_URL=
QDRANT_API_KEY=
OPENSEARCH_ENDPOINT=
OPENSEARCH_CREDENTIALS=
OLLAMA_URL=http://localhost:11434
ELASTICSEARCH_URL=
ELASTICSEARCH_API_KEY=
POSTGRES_CONNECTION_STRING=
POSTGRES_PASSWORD=
NLWEB_LOGGING_PROFILE=production
HF_TOKEN=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_RAG_ID_ENV=
CLOUDFLARE_ACCOUNT_ID=
```

## Important Notes

1. **Nginx Configuration**: The nginx service generates its configuration file inside the container using a compact format, so you don't need to upload `nginx.conf` to Hostinger. This fixes the mounting error and keeps the YAML under 8192 characters.

2. **File Sizes**: 
   - Docker Compose YAML: **6632 characters** (under 8192 limit ✓)
   - Environment Variables: **1877 characters**

3. **Environment Variables**: Replace the placeholder API keys with your actual keys. The OpenAI API key shown is an example - make sure to use your real key.

4. **Service Dependencies**: 
   - Next.js depends on `python-scraper` and `nlweb`
   - Nginx depends on `nextjs`
   - All services are on the same Docker network (`zaytoonz-network`)

5. **Ports**:
   - Next.js: 3002 (host) → 3000 (container)
   - Python Scraper: 8000 (host) → 8000 (container)
   - NLWeb: 8002 (host) → 8000 (container)
   - Nginx: 80 (HTTP) and 443 (HTTPS)

6. **SSL Certificates**: SSL certificates will be managed by Certbot. Once certificates are obtained, you can update the nginx entrypoint to include HTTPS configuration.

7. **Volumes**: 
   - Application code is mounted from the host
   - Certbot certificates are stored in `./certbot/conf` and `./certbot/www`
   - NLWeb data is stored in a Docker volume `nlweb-data`

## Deployment Steps

1. Copy the Docker Compose YAML into Hostinger's YAML editor
2. Copy all environment variables into Hostinger's Environment Variables section
3. Update any API keys with your actual values
4. Deploy the stack
5. Monitor the logs to ensure all services start correctly

## Troubleshooting

- If nginx fails to start, check the container logs: `docker logs zaytoonz-nginx`
- If Next.js build fails, check the container logs: `docker logs zaytoonz-nextjs`
- If Python scraper fails, check the container logs: `docker logs zaytoonz-scraper`
- If NLWeb fails, check the container logs: `docker logs zaytoonz-nlweb`

## Alternative Files

For easier copy-paste, you can also use the separate files:
- `docker-compose-hostinger.yml` - Contains just the YAML
- `hostinger-env-vars.txt` - Contains just the environment variables
