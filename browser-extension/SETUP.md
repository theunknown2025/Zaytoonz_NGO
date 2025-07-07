# 🚀 Quick Setup Guide - Zaytoonz RSS Creator Extension

## 📋 Prerequisites Checklist

- [ ] **RSS.app Account** - [Sign up here](https://rss.app)
- [ ] **Zaytoonz NGO** - Project running locally or deployed
- [ ] **Chrome/Firefox** - Modern browser with developer mode

## ⚡ 5-Minute Setup

### Step 1: Get RSS.app Credentials
1. Visit [rss.app](https://rss.app) and create account
2. Go to **API Settings** → Generate **API Key** and **Secret**
3. Save these credentials (you'll need them in Step 4)

### Step 2: Install Extension
```bash
# Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the browser-extension folder

# Firefox  
1. Open about:debugging
2. Click "This Firefox" 
3. Click "Load Temporary Add-on"
4. Select manifest.json
```

### Step 3: Verify Zaytoonz Connection
```bash
# Make sure your Zaytoonz project is running
cd Zaytoonz_NGO
npm run dev
# Should be accessible at http://localhost:3000
```

### Step 4: Configure Extension
1. Click the Zaytoonz extension icon
2. Click "⚙️ Settings"
3. Enter your RSS.app credentials:
   - **API Key**: `your-api-key-here`
   - **API Secret**: `your-api-secret-here`
4. Set Zaytoonz URL: `http://localhost:3000`
5. Click "Save Settings"
6. Verify "✅ Connected to Zaytoonz" status

## 🎯 Test It Out

### Try with ReKrute (Moroccan Jobs)
1. Visit: https://www.rekrute.com/offres-emploi-beni-mellal.html
2. Extension should show job count badge
3. Click extension → "Create RSS Feed"
4. Click "Import to Zaytoonz Scraper"
5. Check your Zaytoonz scraper for imported jobs!

### Try with LinkedIn
1. Visit: https://linkedin.com/jobs/
2. Search for any jobs
3. Extension will detect and highlight listings
4. Create feed and import as above

## 🔧 Troubleshooting

**No jobs detected?**
- Make sure you're on a job listing page
- Try refreshing the page
- Scroll down to load more jobs

**Connection failed?**
- Check if Zaytoonz is running on http://localhost:3000
- Verify no firewall blocking requests
- Check browser console for errors

**RSS creation failed?**
- Verify RSS.app API credentials are correct
- Check your RSS.app account quota
- Ensure internet connection

## 📱 Usage Tips

- **Badge numbers** show detected jobs count
- **Right-click** → "Highlight Job Listings" to see detection
- **Recent feeds** section shows your created feeds
- **Context menu** gives quick access to features

## 🔄 Updates

The extension auto-updates job detection as you browse. Settings are synced across browser sessions.

## 📞 Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Open GitHub issues for bugs or feature requests
- Email: support@zaytoonz.org

---

**Ready to streamline your job opportunity discovery! 🎉** 