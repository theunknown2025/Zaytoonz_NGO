// Popup script for Zaytoonz RSS Creator extension
(function() {
    'use strict';

    // State management
    let currentPageData = null;
    let settings = {};
    let recentFeeds = [];

    // DOM elements
    const elements = {
        currentUrl: document.getElementById('currentUrl'),
        detectionStatus: document.getElementById('detectionStatus'),
        feedTitle: document.getElementById('feedTitle'),
        feedDescription: document.getElementById('feedDescription'),
        jobCount: document.getElementById('jobCount'),
        createFeedBtn: document.getElementById('createFeedBtn'),
        recentFeeds: document.getElementById('recentFeeds'),
        integrationStatus: document.getElementById('integrationStatus'),
        importToZaytoonz: document.getElementById('importToZaytoonz'),
        rssApiKey: document.getElementById('rssApiKey'),
        rssApiSecret: document.getElementById('rssApiSecret'),
        zaytoonzUrl: document.getElementById('zaytoonzUrl'),
        saveSettings: document.getElementById('saveSettings')
    };

    // RSS.app API wrapper
    class RSSAppAPI {
        constructor(apiKey, apiSecret) {
            this.apiKey = apiKey;
            this.apiSecret = apiSecret;
            this.baseUrl = 'https://api.rss.app';
        }

        async createFeed(feedData) {
            try {
                const response = await fetch(`${this.baseUrl}/feeds`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}:${this.apiSecret}`
                    },
                    body: JSON.stringify(feedData)
                });

                if (!response.ok) {
                    throw new Error(`RSS.app API error: ${response.status} ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('RSS.app API error:', error);
                throw error;
            }
        }

        async getFeeds() {
            try {
                const response = await fetch(`${this.baseUrl}/feeds`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}:${this.apiSecret}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`RSS.app API error: ${response.status} ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('RSS.app API error:', error);
                throw error;
            }
        }
    }

    // Initialize popup
    async function initialize() {
        await loadSettings();
        await loadRecentFeeds();
        await checkZaytoonzConnection();
        await analyzeCurrentPage();
        bindEvents();
        updateUI();
    }

    // Load settings from storage
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['rssApiKey', 'rssApiSecret', 'zaytoonzUrl']);
            settings = {
                rssApiKey: result.rssApiKey || '',
                rssApiSecret: result.rssApiSecret || '',
                zaytoonzUrl: result.zaytoonzUrl || 'http://localhost:3000'
            };

            // Update form fields
            elements.rssApiKey.value = settings.rssApiKey;
            elements.rssApiSecret.value = settings.rssApiSecret;
            elements.zaytoonzUrl.value = settings.zaytoonzUrl;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Load recent feeds from storage
    async function loadRecentFeeds() {
        try {
            const result = await chrome.storage.local.get(['recentFeeds']);
            recentFeeds = result.recentFeeds || [];
            updateRecentFeedsUI();
        } catch (error) {
            console.error('Failed to load recent feeds:', error);
        }
    }

    // Check connection to Zaytoonz
    async function checkZaytoonzConnection() {
        try {
            elements.integrationStatus.textContent = '🔗 Checking connection...';
            
            const response = await fetch(`${settings.zaytoonzUrl}/api/scraper/rss-feeds`, {
                method: 'HEAD',
                mode: 'cors'
            });

            if (response.ok) {
                elements.integrationStatus.textContent = '✅ Connected to Zaytoonz';
                elements.integrationStatus.className = 'integration-status success';
                elements.importToZaytoonz.disabled = false;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            elements.integrationStatus.textContent = '❌ Cannot connect to Zaytoonz';
            elements.integrationStatus.className = 'integration-status error';
            elements.importToZaytoonz.disabled = true;
        }
    }

    // Analyze current page
    async function analyzeCurrentPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            elements.currentUrl.textContent = shortenUrl(tab.url);
            elements.detectionStatus.textContent = '🔍 Analyzing page...';

            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });
            
            if (response && response.success) {
                currentPageData = response.data;
                updatePageAnalysis();
            } else {
                throw new Error(response?.error || 'Failed to analyze page');
            }
        } catch (error) {
            console.error('Page analysis failed:', error);
            elements.detectionStatus.textContent = '❌ Analysis failed';
            elements.detectionStatus.className = 'status error';
        }
    }

    // Update page analysis UI
    function updatePageAnalysis() {
        if (!currentPageData) return;

        const jobCount = currentPageData.jobCount;
        
        if (jobCount > 0) {
            elements.detectionStatus.textContent = `✅ Job site detected`;
            elements.detectionStatus.className = 'status success';
            elements.jobCount.textContent = `📊 Found ${jobCount} job listings`;
            elements.jobCount.className = 'job-count success';
            elements.createFeedBtn.disabled = false;
            
            // Auto-fill feed title
            if (!elements.feedTitle.value) {
                elements.feedTitle.value = generateFeedTitle(currentPageData);
            }
        } else if (currentPageData.isJobSite) {
            elements.detectionStatus.textContent = '⚠️ Job site but no listings found';
            elements.detectionStatus.className = 'status warning';
            elements.jobCount.textContent = '📊 No job listings detected';
            elements.jobCount.className = 'job-count warning';
        } else {
            elements.detectionStatus.textContent = 'ℹ️ Not a job site';
            elements.detectionStatus.className = 'status';
            elements.jobCount.textContent = '📊 No job listings found';
            elements.jobCount.className = 'job-count';
        }
    }

    // Generate feed title
    function generateFeedTitle(pageData) {
        const hostname = pageData.hostname.replace(/^www\./, '');
        const title = pageData.title;
        
        if (title.toLowerCase().includes('job')) {
            return `Jobs from ${hostname}`;
        } else {
            return `${title} - ${hostname}`;
        }
    }

    // Bind event listeners
    function bindEvents() {
        // Create RSS feed
        elements.createFeedBtn.addEventListener('click', createRSSFeed);
        
        // Import to Zaytoonz
        elements.importToZaytoonz.addEventListener('click', importToZaytoonz);
        
        // Save settings
        elements.saveSettings.addEventListener('click', saveSettings);
        
        // Help and feedback links
        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://github.com/your-org/zaytoonz-rss-creator#readme' });
        });
        
        document.getElementById('feedbackLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'mailto:support@zaytoonz.org?subject=RSS Creator Feedback' });
        });
    }

    // Create RSS feed
    async function createRSSFeed() {
        if (!currentPageData || currentPageData.jobCount === 0) {
            showError('No jobs detected on this page');
            return;
        }

        if (!settings.rssApiKey || !settings.rssApiSecret) {
            showError('Please configure RSS.app API credentials in settings');
            return;
        }

        try {
            showLoading(elements.createFeedBtn, true);
            
            const rssApi = new RSSAppAPI(settings.rssApiKey, settings.rssApiSecret);
            
            const feedData = {
                name: elements.feedTitle.value || generateFeedTitle(currentPageData),
                description: elements.feedDescription.value || `Job listings from ${currentPageData.hostname}`,
                url: currentPageData.url,
                category: 'jobs',
                tags: ['jobs', 'careers', currentPageData.hostname],
                isPublic: false
            };

            const result = await rssApi.createFeed(feedData);
            
            // Save to recent feeds
            const feedInfo = {
                id: result.id,
                name: feedData.name,
                url: result.feedUrl,
                sourceUrl: currentPageData.url,
                createdAt: new Date().toISOString(),
                jobCount: currentPageData.jobCount
            };
            
            recentFeeds.unshift(feedInfo);
            if (recentFeeds.length > 10) recentFeeds.pop();
            
            await chrome.storage.local.set({ recentFeeds });
            updateRecentFeedsUI();
            
            showSuccess('RSS feed created successfully!');
            
        } catch (error) {
            console.error('Failed to create RSS feed:', error);
            showError(`Failed to create RSS feed: ${error.message}`);
        } finally {
            showLoading(elements.createFeedBtn, false);
        }
    }

    // Import to Zaytoonz
    async function importToZaytoonz() {
        if (recentFeeds.length === 0) {
            showError('No feeds to import. Create a feed first.');
            return;
        }

        try {
            showLoading(elements.importToZaytoonz, true);
            
            const latestFeed = recentFeeds[0];
            
            const response = await fetch(`${settings.zaytoonzUrl}/api/scraper/rss-feeds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'import-from-url',
                    url: latestFeed.url,
                    source: 'browser-extension'
                })
            });

            if (!response.ok) {
                throw new Error(`Import failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            showSuccess(`Imported ${result.count || 0} jobs to Zaytoonz!`);
            
            // Open Zaytoonz scraper page
            setTimeout(() => {
                chrome.tabs.create({ url: `${settings.zaytoonzUrl}/admin/scraper` });
            }, 1000);
            
        } catch (error) {
            console.error('Failed to import to Zaytoonz:', error);
            showError(`Import failed: ${error.message}`);
        } finally {
            showLoading(elements.importToZaytoonz, false);
        }
    }

    // Save settings
    async function saveSettings() {
        try {
            const newSettings = {
                rssApiKey: elements.rssApiKey.value.trim(),
                rssApiSecret: elements.rssApiSecret.value.trim(),
                zaytoonzUrl: elements.zaytoonzUrl.value.trim()
            };

            await chrome.storage.sync.set(newSettings);
            settings = newSettings;
            
            showSuccess('Settings saved!');
            await checkZaytoonzConnection();
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            showError('Failed to save settings');
        }
    }

    // Update recent feeds UI
    function updateRecentFeedsUI() {
        if (recentFeeds.length === 0) {
            elements.recentFeeds.innerHTML = '<div class="no-feeds">No feeds created yet</div>';
            return;
        }

        elements.recentFeeds.innerHTML = recentFeeds.map(feed => `
            <div class="feed-item">
                <h4>${escapeHtml(feed.name)}</h4>
                <div class="feed-url">${escapeHtml(feed.url)}</div>
                <div class="feed-actions">
                    <button class="copy-btn" onclick="copyFeedUrl('${feed.url}')">Copy URL</button>
                    <button class="import-feed-btn" onclick="importFeedToZaytoonz('${feed.url}')">Import</button>
                </div>
            </div>
        `).join('');
    }

    // Utility functions
    function shortenUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + urlObj.pathname;
        } catch {
            return url;
        }
    }

    function showLoading(button, loading) {
        const textEl = button.querySelector('.btn-text');
        const loaderEl = button.querySelector('.btn-loader');
        
        if (loading) {
            textEl.style.display = 'none';
            loaderEl.style.display = 'inline';
            button.disabled = true;
        } else {
            textEl.style.display = 'inline';
            loaderEl.style.display = 'none';
            button.disabled = false;
        }
    }

    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showError(message) {
        showNotification(message, 'error');
    }

    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 12px 16px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'success' ? '#059669' : '#dc2626'};
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateUI() {
        // Update button states based on current state
        elements.createFeedBtn.disabled = !currentPageData || currentPageData.jobCount === 0;
        elements.importToZaytoonz.disabled = recentFeeds.length === 0;
    }

    // Global functions for event handlers
    window.copyFeedUrl = function(url) {
        navigator.clipboard.writeText(url).then(() => {
            showSuccess('Feed URL copied to clipboard!');
        }).catch(() => {
            showError('Failed to copy URL');
        });
    };

    window.importFeedToZaytoonz = async function(url) {
        try {
            const response = await fetch(`${settings.zaytoonzUrl}/api/scraper/rss-feeds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'import-from-url',
                    url: url,
                    source: 'browser-extension'
                })
            });

            if (!response.ok) {
                throw new Error(`Import failed: ${response.status}`);
            }

            const result = await response.json();
            showSuccess(`Imported ${result.count || 0} jobs!`);
            
        } catch (error) {
            showError(`Import failed: ${error.message}`);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})(); 