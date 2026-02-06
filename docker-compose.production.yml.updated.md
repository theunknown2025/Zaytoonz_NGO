```yaml
version: '3.8'

services:
  nextjs:
    image: node:20-alpine
    container_name: zaytoonz-nextjs
    working_dir: /app
    command: sh -c "npm install --production && npm run build && npm start"
    ports:
      - "3000:3000"
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
      - NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=${NEXT_PUBLIC_EXTERNAL_SCRAPER_URL:-http://python-scraper:8000}
      - NEXT_PUBLIC_FALLBACK_TO_LOCAL=${NEXT_PUBLIC_FALLBACK_TO_LOCAL:-true}
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.next
    restart: unless-stopped
    depends_on:
      - python-scraper
    networks:
      - zaytoonz-network

  python-scraper:
    image: python:3.11-slim
    container_name: zaytoonz-scraper
    working_dir: /app/Scrape_Master
    command: sh -c "apt-get update && apt-get install -y wget gnupg && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && sh -c 'echo \"deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" >> /etc/apt/sources.list.d/google.list' && apt-get update && apt-get install -y google-chrome-stable && pip install --no-cache-dir -r requirements.txt && playwright install chromium && uvicorn api_wrapper:app --host 0.0.0.0 --port 8000"
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

  nginx:
    image: nginx:alpine
    container_name: zaytoonz-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - nextjs
    restart: unless-stopped
    networks:
      - zaytoonz-network

networks:
  zaytoonz-network:
    driver: bridge
```
