# 🎯 Zaytoonz RSS Creator - Browser Extension

A powerful browser extension that automatically detects job listings on any website and creates RSS feeds that integrate seamlessly with your Zaytoonz NGO scraper.

## ✨ Features

### 🔍 **Smart Job Detection**
- Automatically detects job listings on any website
- Works with popular job sites: ReKrute, LinkedIn, Indeed, Bayt, etc.
- Supports French, English, and Arabic content
- Highlights detected jobs with visual indicators

### 📡 **RSS Feed Creation**
- One-click RSS feed generation via RSS.app API
- Customizable feed titles and descriptions
- Private feeds for your organization
- Recent feeds management and tracking

### 🔗 **Seamless Integration**
- Direct import to Zaytoonz NGO scraper
- Real-time connection status monitoring
- Automatic navigation to scraper interface
- Local storage for imported jobs

### 🌐 **Multi-Site Support**
- **ReKrute.com** - Morocco's leading job platform
- **LinkedIn** - Global professional network
- **Indeed** - Worldwide job search engine
- **Bayt.com** - Middle East job portal
- **Emploi.ma** - Moroccan employment site
- **Generic support** - Works on any job site

## 🚀 Installation

### Prerequisites
1. **RSS.app Account**: Sign up at [rss.app](https://rss.app) for API credentials
2. **Zaytoonz NGO Project**: Running locally or deployed

### Install Extension

#### Chrome/Edge
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `browser-extension` folder
5. Pin the extension to your toolbar

#### Firefox
1. Navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file

## ⚙️ Configuration

### 1. RSS.app API Setup
1. Visit [rss.app](https://rss.app) and create an account
2. Navigate to API settings and generate:
   - **API Key**
   - **API Secret**
3. Open the extension popup
4. Click "⚙️ Settings"
5. Enter your RSS.app credentials

### 2. Zaytoonz Integration
1. Ensure your Zaytoonz project is running
2. In extension settings, set the Zaytoonz URL:
   - Local: `http://localhost:3000`
   - Production: `https://your-zaytoonz-domain.com`
3. Click "Save Settings"
4. Verify the "✅ Connected to Zaytoonz" status

## 📖 How to Use

### Creating RSS Feeds

1. **Visit a Job Site**
   - Navigate to any job listing page (ReKrute, LinkedIn, etc.)
   - The extension will automatically detect job listings
   - Look for the job count badge on the extension icon

2. **Open Extension Popup**
   - Click the Zaytoonz extension icon
   - View detected jobs count and site analysis
   - The feed title will be auto-generated

3. **Create RSS Feed**
   - Customize the feed title if needed
   - Add an optional description
   - Click "Create RSS Feed"
   - Feed will be created and saved to recent feeds

4. **Import to Zaytoonz**
   - Click "Import to Zaytoonz Scraper"
   - Jobs will be imported and processed
   - Extension will open the Zaytoonz scraper interface

### Visual Job Detection

- **Green borders**: Jobs detected by the extension
- **Job count badge**: Number on extension icon shows detected jobs
- **Floating action button**: Quick access to create feeds (appears on job sites)

### Context Menu Options

Right-click on any page:
- **"Create RSS Feed for Jobs"** - Opens extension popup
- **"Highlight Job Listings"** - Visually highlights detected jobs

## 🔧 Advanced Features

### Automatic Detection
- Jobs are automatically highlighted on page load
- Extension badge shows job count in real-time
- Notifications for pages with many jobs (configurable)

### Recent Feeds Management
- View recently created feeds
- Copy feed URLs to clipboard
- Quick import to Zaytoonz
- Feed statistics and metadata

### Settings & Preferences
```javascript
{
  "rssApiKey": "your-rss-app-api-key",
  "rssApiSecret": "your-rss-app-secret", 
  "zaytoonzUrl": "http://localhost:3000",
  "autoDetection": true,
  "notificationsEnabled": true,
  "autoHighlight": true
}
```

## 🌍 Supported Sites

### Tier 1 Support (Optimized)
- **ReKrute.com** - Comprehensive selectors for Moroccan market
- **LinkedIn.com** - Professional job listings
- **Indeed.com** - Global job search platform
- **Bayt.com** - Middle East employment hub

### Tier 2 Support (Generic)
- **Emploi.ma** - Moroccan employment
- **Glassdoor.com** - Company reviews and jobs
- **Monster.com** - Career opportunities
- **CareerBuilder.com** - Job search engine

### Universal Support
The extension works on any website with job listings using:
- Generic CSS selectors for common patterns
- Keyword detection in multiple languages
- Smart content analysis and validation

## 🔌 API Integration

### RSS.app Integration
```javascript
// Create feed
POST https://api.rss.app/feeds
Authorization: Bearer {apiKey}:{apiSecret}
{
  "name": "Jobs from ReKrute - Béni Mellal",
  "description": "Latest job opportunities",
  "url": "https://rekrute.com/offres",
  "category": "jobs",
  "isPublic": false
}
```

### Zaytoonz Integration  
```javascript
// Import jobs
POST http://localhost:3000/api/scraper/rss-feeds
{
  "action": "import-from-url",
  "url": "https://rss.app/feeds/v1.1/abc123.json",
  "source": "browser-extension"
}
```

## 🐛 Troubleshooting

### Common Issues

**"No jobs detected"**
- Ensure you're on a job listing page
- Try refreshing the page
- Check if site uses dynamic loading (scroll down)

**"Cannot connect to Zaytoonz"**
- Verify Zaytoonz is running on specified URL
- Check CORS settings in Zaytoonz
- Ensure API endpoints are accessible

**"RSS feed creation failed"**
- Verify RSS.app API credentials
- Check API quota and limits
- Ensure internet connection

### Debug Mode
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for "Zaytoonz RSS Creator" messages
4. Check for error messages and API responses

## 🔄 Updates & Changelog

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ Multi-site job detection
- ✅ RSS.app integration
- ✅ Zaytoonz scraper integration
- ✅ Visual job highlighting
- ✅ Recent feeds management

### Planned Features
- 🔮 Automatic feed monitoring
- 🔮 Job alert notifications
- 🔮 Batch operations
- 🔮 Advanced filtering options
- 🔮 Multi-language support expansion

## 📝 License

MIT License - Feel free to use and modify for your organization's needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple job sites
5. Submit a pull request

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-org/zaytoonz-rss-creator/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/zaytoonz-rss-creator/issues)
- **Email**: support@zaytoonz.org

---

**Built with ❤️ for the NGO community to streamline opportunity discovery and management.** 