# Python Scraper Integration Setup

## 🚀 Quick Setup Guide

Your Python scraper is now integrated with your Next.js admin interface! Here's how to get it running:

### 1. Move Scrape_Master folder (if not already done)

```bash
# Move the Scrape_Master folder into your Zaytoonz_NGO project
mv Scrape_Master Zaytoonz_NGO/
```

### 2. Start the Python API Server

```bash
cd Zaytoonz_NGO/Scrape_Master
python -m uvicorn api_wrapper:app --reload --port 8000
```

### 3. Configure Your Next.js App

Update your `.env` file in `Zaytoonz_NGO/.env`:

```env
# Enable Python scraper
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# AI Model preferences
NEXT_PUBLIC_PREFERRED_AI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ENABLE_PAGINATION=true
```

### 4. Start Your Next.js App

```bash
cd Zaytoonz_NGO
npm run dev
```

### 5. Access the New Python Scraper

1. Go to `http://localhost:3000/admin/signin`
2. Sign in with your admin account
3. Click **"Python Scraper"** in the sidebar
4. Start scraping with AI power! 🤖

## 🎯 What You Get

### ✨ New "Python Scraper" Interface
- **AI-powered extraction** with multiple models (GPT-4O Mini, Gemini, DeepSeek)
- **Smart field selection** - choose what data to extract
- **Pagination detection** - automatically find more pages
- **Cost tracking** - monitor API usage
- **Real-time results** - see extracted data immediately

### 🔄 Fallback System
- If Python API is down, automatically falls back to your existing TypeScript scraper
- Both scrapers save to the same Supabase database

### 📊 Features
- **Multiple AI Models**: Choose the best model for cost/quality
- **Dynamic Fields**: Extract any fields you want
- **Pagination URLs**: Discover additional pages automatically
- **Cost Monitoring**: Track AI API costs in real-time
- **Database Integration**: Save results to your existing system

## 🧪 Testing

1. **Test Python API directly**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test through Next.js**: Use the admin interface

3. **Test fallback**: Stop Python API and try scraping (should use TypeScript scraper)

## 🎉 You're Ready!

Your powerful Python scraper is now seamlessly integrated with your Next.js admin interface. You get the best of both worlds:

- **Beautiful Next.js frontend** hosted on Netlify
- **Powerful Python AI scraper** for intelligent data extraction
- **Shared Supabase database** for unified data storage

Enjoy your new AI-powered scraping capabilities! 🚀 