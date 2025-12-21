# RSS.app Integration Guide

This guide explains how to set up and use the RSS.app integration in your Zaytoonz NGO scraper.

## 🔗 What is RSS.app?

[RSS.app](https://rss.app) is a service that automatically converts websites into RSS feeds. It can create feeds from:
- Job boards (Indeed, LinkedIn, etc.)
- News websites
- Google News searches
- Social media platforms
- E-commerce sites
- And many more!

## 🚀 Features

Our RSS integration provides:

✅ **Automatic Feed Creation** - Convert any job website into an RSS feed
✅ **Job Import** - Import jobs from RSS feeds directly into your scraper
✅ **Real-time Updates** - Get the latest opportunities automatically
✅ **Smart Parsing** - AI-powered extraction of job details
✅ **Feed Management** - Create, manage, and delete RSS feeds
✅ **Source Tracking** - See which jobs came from which feeds

## 📋 Setup Instructions

### 1. Get RSS.app API Credentials

1. Visit [RSS.app](https://rss.app) and create an account
2. Go to your [Dashboard](https://rss.app/dashboard)
3. Navigate to API settings to get your API key and secret
4. Note: RSS.app offers a free tier with limited requests

### 2. Configure Environment Variables

Add these to your `.env` file:

```bash
# RSS.app Integration
RSS_APP_API_KEY="your_api_key_here"
RSS_APP_API_SECRET="your_api_secret_here"

# Optional Configuration
RSS_FEED_AUTO_REFRESH_INTERVAL=3600000  # 1 hour
RSS_FEED_MAX_ITEMS_PER_IMPORT=50
```

### 3. Restart Your Application

```bash
npm run dev
```

## 🎯 How to Use

### Step 1: Access RSS Feed Manager

1. Go to Admin Panel → Scraper
2. Click on the "RSS Feeds" tab
3. You'll see the RSS Feed Manager interface

### Step 2: Create RSS Feeds

1. Click "Create Feed"
2. Enter a job website URL (e.g., `https://example.com/jobs`)
3. Optionally add a title and description
4. Click "Create Feed"

RSS.app will automatically:
- Analyze the website structure
- Create an RSS feed
- Start monitoring for new content

### Step 3: Import Jobs

1. Once feeds are created, click "Import Jobs" on any feed
2. The system will:
   - Fetch the latest items from the RSS feed
   - Convert them to job format using AI parsing
   - Add them to your scraper results
   - Mark them with an RSS badge

### Step 4: Manage Your Jobs

Imported jobs will appear in:
- **Scraper → Jobs** section
- Marked with a 📡 RSS Feed badge
- Include the source feed name
- Can be saved to database like regular scraped jobs

## 🔧 Supported Job Sites

RSS.app can create feeds from most job websites including:

- **Job Boards**: Indeed, LinkedIn, Monster, Glassdoor
- **Company Pages**: Career pages of individual companies
- **Government Sites**: Public sector job postings
- **NGO Sites**: Non-profit organization job boards
- **Specialized Sites**: Tech, healthcare, education job sites

## 📊 RSS Feed Examples

Here are some examples of URLs you can convert to RSS feeds:

```
# Company career pages
https://company.com/careers
https://company.com/jobs

# Job board searches
https://indeed.com/jobs?q=developer&l=Morocco
https://linkedin.com/jobs/search/?keywords=NGO

# Google News job searches
https://news.google.com/search?q=job+opportunities+Morocco

# Specific job categories
https://jobsite.com/jobs/category/technology
```

## 🎨 User Interface Features

### RSS Feed Manager
- **Feed Statistics**: Total feeds, active feeds, last sync time
- **Create Form**: Easy feed creation with URL validation
- **Feed List**: All your feeds with import/delete actions
- **Help Section**: Built-in guidance and tips

### Job Display
- **RSS Badges**: Clear indicators for RSS-imported jobs
- **Source Attribution**: Shows which feed imported each job
- **Integrated Workflow**: RSS jobs work with existing scraper features

## 🔄 API Endpoints

The integration adds these API endpoints:

```
GET  /api/scraper/rss-feeds     # Get all feeds
POST /api/scraper/rss-feeds     # Create feed or import jobs
DELETE /api/scraper/rss-feeds   # Delete feed
```

## 🛠️ Troubleshooting

### Common Issues

**"RSS.app API credentials not found"**
- Check your `.env` file has `RSS_APP_API_KEY` and `RSS_APP_API_SECRET`
- Restart your development server

**"Failed to create RSS feed"**
- Ensure the URL is accessible and contains content
- Some sites block automated access
- Try a different URL or contact RSS.app support

**"No items found in RSS feed"**
- New feeds may take time to populate
- Try refreshing the feed after a few minutes
- Check if the original website has recent content

**API Rate Limits**
- RSS.app has rate limits on free accounts
- Consider upgrading for higher limits
- Implement retry logic for production use

### Debug Mode

To debug RSS integration:

1. Check browser console for errors
2. Look at network requests in DevTools
3. Verify API responses in the Network tab

## 📈 Best Practices

### Feed Management
1. **Use Descriptive Titles**: Name feeds clearly (e.g., "Tech Jobs - Company X")
2. **Regular Cleanup**: Delete unused feeds to stay within limits
3. **Monitor Performance**: Check feed update frequency

### Job Import Strategy
1. **Batch Imports**: Import from multiple feeds at once
2. **Regular Schedule**: Set up a routine for checking new jobs
3. **Quality Control**: Review imported jobs before saving to database

### Performance Optimization
1. **Limit Items**: Don't import too many jobs at once
2. **Cache Results**: Use local storage for temporary results
3. **Error Handling**: Handle API failures gracefully

## 🔗 Useful Links

- [RSS.app Documentation](https://rss.app/docs/api/feeds/create)
- [RSS.app Dashboard](https://rss.app/dashboard)
- [RSS.app Pricing](https://rss.app/pricing)
- [RSS.app Support](https://rss.app/help)

## 🆘 Support

If you need help with the RSS integration:

1. Check this documentation first
2. Look at the built-in help section in the RSS Feed Manager
3. Review RSS.app's official documentation
4. Contact your development team

---

**Note**: This integration requires an active RSS.app account and valid API credentials. The free tier has limitations on the number of feeds and requests per month. 