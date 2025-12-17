# Local Testing Guide

## 🚀 Quick Start - Running Your Scraper Locally

### Option 1: Python Scraper as API (Recommended for Integration Testing)

1. **Start the Python API Server**:
   ```bash
   cd Scrape_Master
   python -m uvicorn api_wrapper:app --reload --port 8000
   ```

2. **Update Next.js Environment** (in Zaytoonz_NGO/.env):
   ```env
   NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
   NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
   NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
   ```

3. **Start Next.js Frontend**:
   ```bash
   cd Zaytoonz_NGO
   npm run dev
   ```

4. **Test Integration**: Go to `http://localhost:3000/admin/scraper` and try scraping a URL!

### Option 2: Streamlit UI (Original Interface)

```bash
cd Scrape_Master
streamlit run streamlit_app.py
```

### Option 3: Next.js with Local TypeScript Scraper

Keep the environment as:
```env
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=false
```

Then just run:
```bash
cd Zaytoonz_NGO
npm run dev
```

## 🧪 Testing the API Directly

### Test Health Check:
```bash
curl http://localhost:8000/health
```

### Test Scraping:
```bash
curl -X POST "http://localhost:8000/api/scrape" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://tanmia.ma/emplois", "fields": ["title", "company", "location"]}'
```

### Test Models:
```bash
curl http://localhost:8000/models
```

## 📋 What Each Option Gives You

| Option | Best For | Features |
|--------|----------|----------|
| **API Mode** | Integration testing | ✅ AI extraction ✅ Pagination ✅ Cost tracking ✅ Next.js integration |
| **Streamlit UI** | Manual scraping | ✅ AI extraction ✅ Pagination ✅ Download options ✅ Visual interface |
| **TypeScript Scraper** | Quick testing | ✅ Fast ✅ No API costs ✅ Built-in Puppeteer |

## 🎯 Recommended Workflow

1. **Start with API Mode** to test the full integration
2. **Use Streamlit UI** for manual testing and data exploration  
3. **Fall back to TypeScript** if you need quick results without AI costs

Your scraper is now ready to run locally in multiple ways! 🎉 