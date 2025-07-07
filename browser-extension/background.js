// Background service worker for Zaytoonz RSS Creator
(function() {
    'use strict';

    // Extension state
    let jobSiteAnalysis = new Map();
    let activeTabs = new Set();

    // Initialize extension
    chrome.runtime.onInstalled.addListener((details) => {
        console.log('Zaytoonz RSS Creator installed');
        
        if (details.reason === 'install') {
            // Set default settings
            chrome.storage.sync.set({
                zaytoonzUrl: 'http://localhost:3000',
                autoDetection: true,
                notificationsEnabled: true
            });
            
            // Open welcome page
            chrome.tabs.create({
                url: 'https://github.com/your-org/zaytoonz-rss-creator#welcome'
            });
        }
    });

    // Tab change detection
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        try {
            const tab = await chrome.tabs.get(activeInfo.tabId);
            if (tab.url && isValidUrl(tab.url)) {
                activeTabs.add(activeInfo.tabId);
                schedulePageAnalysis(activeInfo.tabId);
            }
        } catch (error) {
            console.debug('Failed to handle tab activation:', error);
        }
    });

    // URL change detection
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && isValidUrl(tab.url)) {
            schedulePageAnalysis(tabId);
        }
    });

    // Tab removal cleanup
    chrome.tabs.onRemoved.addListener((tabId) => {
        activeTabs.delete(tabId);
        jobSiteAnalysis.delete(tabId);
    });

    // Message handling from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            switch (message.action) {
                case 'pageAnalyzed':
                    handlePageAnalysis(sender.tab.id, message.data);
                    sendResponse({ success: true });
                    break;
                    
                case 'getJobSiteAnalysis':
                    const analysis = jobSiteAnalysis.get(sender.tab?.id);
                    sendResponse({ success: true, analysis });
                    break;
                    
                case 'createFeedFromJobs':
                    createFeedFromJobs(message.jobs, message.feedData)
                        .then(result => sendResponse({ success: true, result }))
                        .catch(error => sendResponse({ success: false, error: error.message }));
                    return true; // Async response
                    
                case 'importToZaytoonz':
                    importToZaytoonz(message.feedUrl, message.zaytoonzUrl)
                        .then(result => sendResponse({ success: true, result }))
                        .catch(error => sendResponse({ success: false, error: error.message }));
                    return true; // Async response
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ success: false, error: error.message });
        }
        
        return false;
    });

    // Schedule page analysis with debouncing
    const analysisTimeouts = new Map();
    function schedulePageAnalysis(tabId, delay = 2000) {
        // Clear existing timeout
        if (analysisTimeouts.has(tabId)) {
            clearTimeout(analysisTimeouts.get(tabId));
        }
        
        // Schedule new analysis
        const timeout = setTimeout(() => {
            analyzeTab(tabId);
            analysisTimeouts.delete(tabId);
        }, delay);
        
        analysisTimeouts.set(tabId, timeout);
    }

    // Analyze tab for job listings
    async function analyzeTab(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'analyzePage' });
            
            if (response && response.success) {
                handlePageAnalysis(tabId, response.data);
            }
        } catch (error) {
            console.debug('Tab analysis failed:', error);
        }
    }

    // Handle page analysis results
    function handlePageAnalysis(tabId, analysisData) {
        jobSiteAnalysis.set(tabId, analysisData);
        
        // Update badge if jobs found
        updateBadge(tabId, analysisData.jobCount);
        
        // Show notification for significant job sites
        if (analysisData.jobCount > 5) {
            showJobNotification(analysisData);
        }
        
        // Auto-highlight jobs if enabled
        chrome.storage.sync.get(['autoHighlight']).then(result => {
            if (result.autoHighlight !== false) {
                chrome.tabs.sendMessage(tabId, { action: 'highlightJobs' });
            }
        });
    }

    // Update extension badge
    function updateBadge(tabId, jobCount) {
        if (jobCount > 0) {
            chrome.action.setBadgeText({
                text: jobCount.toString(),
                tabId: tabId
            });
            chrome.action.setBadgeBackgroundColor({
                color: '#556B2F',
                tabId: tabId
            });
        } else {
            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    }

    // Show job notification
    async function showJobNotification(analysisData) {
        try {
            const settings = await chrome.storage.sync.get(['notificationsEnabled']);
            if (settings.notificationsEnabled === false) return;
            
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Jobs Found!',
                message: `Found ${analysisData.jobCount} jobs on ${analysisData.hostname}. Click to create RSS feed.`,
                contextMessage: 'Zaytoonz RSS Creator'
            });
        } catch (error) {
            console.debug('Notification failed:', error);
        }
    }

    // Handle notification clicks
    chrome.notifications.onClicked.addListener((notificationId) => {
        // Open extension popup or create new tab
        chrome.action.openPopup();
    });

    // Create RSS feed from jobs data
    async function createFeedFromJobs(jobs, feedData) {
        try {
            const settings = await chrome.storage.sync.get(['rssApiKey', 'rssApiSecret']);
            
            if (!settings.rssApiKey || !settings.rssApiSecret) {
                throw new Error('RSS.app API credentials not configured');
            }
            
            // Create feed using RSS.app API
            const response = await fetch('https://api.rss.app/feeds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.rssApiKey}:${settings.rssApiSecret}`
                },
                body: JSON.stringify({
                    name: feedData.title,
                    description: feedData.description,
                    url: feedData.sourceUrl,
                    category: 'jobs',
                    isPublic: false,
                    items: jobs.map(job => ({
                        title: job.title,
                        description: job.description,
                        link: job.url,
                        pubDate: job.dateFound,
                        author: job.company,
                        category: ['job', job.location, job.company].filter(Boolean)
                    }))
                })
            });
            
            if (!response.ok) {
                throw new Error(`RSS.app API error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Feed creation failed:', error);
            throw error;
        }
    }

    // Import feed to Zaytoonz
    async function importToZaytoonz(feedUrl, zaytoonzUrl) {
        try {
            const response = await fetch(`${zaytoonzUrl}/api/scraper/rss-feeds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'import-from-url',
                    url: feedUrl,
                    source: 'browser-extension'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Zaytoonz import failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Zaytoonz import failed:', error);
            throw error;
        }
    }

    // Utility functions
    function isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    // Context menu setup
    chrome.runtime.onInstalled.addListener(() => {
        chrome.contextMenus.create({
            id: 'createRSSFeed',
            title: 'Create RSS Feed for Jobs',
            contexts: ['page'],
            documentUrlPatterns: ['http://*/*', 'https://*/*']
        });
        
        chrome.contextMenus.create({
            id: 'highlightJobs',
            title: 'Highlight Job Listings',
            contexts: ['page'],
            documentUrlPatterns: ['http://*/*', 'https://*/*']
        });
    });

    // Context menu handling
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        try {
            switch (info.menuItemId) {
                case 'createRSSFeed':
                    // Open popup or trigger feed creation
                    chrome.action.openPopup();
                    break;
                    
                case 'highlightJobs':
                    await chrome.tabs.sendMessage(tab.id, { action: 'highlightJobs' });
                    break;
            }
        } catch (error) {
            console.error('Context menu action failed:', error);
        }
    });

    // Alarm handling for periodic tasks
    chrome.alarms.onAlarm.addListener((alarm) => {
        switch (alarm.name) {
            case 'cleanupAnalysis':
                // Clean up old analysis data
                const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
                for (const [tabId, data] of jobSiteAnalysis.entries()) {
                    if (new Date(data.timestamp).getTime() < cutoff) {
                        jobSiteAnalysis.delete(tabId);
                    }
                }
                break;
        }
    });

    // Set up periodic cleanup
    chrome.alarms.create('cleanupAnalysis', { 
        delayInMinutes: 60, 
        periodInMinutes: 60 
    });

    console.log('Zaytoonz RSS Creator background script loaded');

})(); 