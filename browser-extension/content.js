// Content script for job detection and page analysis
(function() {
    'use strict';

    // Job detection patterns for different sites
    const JOB_SELECTORS = {
        // Generic selectors that work on most job sites
        generic: [
            '[class*="job"]',
            '[class*="vacancy"]',
            '[class*="position"]',
            '[class*="opportunity"]',
            '[class*="offer"]',
            '[class*="emploi"]', // French
            '[class*="poste"]', // French
            '[data-cy*="job"]',
            '[data-testid*="job"]'
        ],
        
        // Site-specific selectors
        'www.rekrute.com': [
            '.job-item',
            '.offer-item',
            '[class*="offre"]',
            '.list-group-item'
        ],
        
        'www.linkedin.com': [
            '.job-search-card',
            '.jobs-search__results-list li',
            '.job-card-container'
        ],
        
        'www.indeed.com': [
            '.jobsearch-SerpJobCard',
            '[data-jk]',
            '.job_seen_beacon'
        ],
        
        'emploi.ma': [
            '.job-item',
            '.offer-item',
            '.job-card'
        ],
        
        'www.bayt.com': [
            '.jb-data',
            '.job-item',
            '.job-card'
        ]
    };

    // Job listing detection
    function detectJobListings() {
        const hostname = window.location.hostname;
        let selectors = JOB_SELECTORS.generic;
        
        // Add site-specific selectors
        if (JOB_SELECTORS[hostname]) {
            selectors = [...selectors, ...JOB_SELECTORS[hostname]];
        }
        
        let jobElements = [];
        
        // Try each selector
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                jobElements = [...jobElements, ...Array.from(elements)];
            } catch (e) {
                console.debug('Selector failed:', selector, e);
            }
        }
        
        // Remove duplicates and filter valid job elements
        const uniqueJobs = Array.from(new Set(jobElements))
            .filter(isValidJobElement)
            .slice(0, 50); // Limit to 50 jobs
        
        return uniqueJobs;
    }

    // Check if element is likely a job listing
    function isValidJobElement(element) {
        if (!element || !element.textContent) return false;
        
        const text = element.textContent.toLowerCase();
        const jobKeywords = [
            'job', 'vacancy', 'position', 'career', 'opportunity',
            'emploi', 'poste', 'travail', 'offre', 'candidature',
            'وظيفة', 'عمل', 'منصب' // Arabic
        ];
        
        // Must contain job-related keywords
        const hasJobKeywords = jobKeywords.some(keyword => text.includes(keyword));
        
        // Should have reasonable content length
        const hasReasonableLength = text.length > 20 && text.length < 2000;
        
        // Should not be navigation or header elements
        const isNotNavigation = !element.closest('nav, header, footer, .nav, .header, .footer');
        
        return hasJobKeywords && hasReasonableLength && isNotNavigation;
    }

    // Extract job data from element
    function extractJobData(element) {
        const getText = (selector) => {
            const el = element.querySelector(selector);
            return el ? el.textContent.trim() : '';
        };
        
        const getLink = () => {
            const link = element.querySelector('a[href]');
            if (link) {
                const href = link.getAttribute('href');
                return href.startsWith('http') ? href : new URL(href, window.location.origin).href;
            }
            return window.location.href;
        };
        
        // Try to extract structured data
        const title = getText('h1, h2, h3, h4, h5, h6, .title, .job-title, [class*="title"]') || 
                     getText('.name, .position') ||
                     element.textContent.split('\n')[0].trim();
        
        const company = getText('.company, .employer, [class*="company"], [class*="employer"]');
        const location = getText('.location, .city, [class*="location"], [class*="city"]');
        const description = element.textContent.trim();
        
        return {
            title: title.substring(0, 200),
            company: company.substring(0, 100),
            location: location.substring(0, 100),
            description: description.substring(0, 500),
            url: getLink(),
            source: window.location.hostname,
            dateFound: new Date().toISOString(),
            element: element
        };
    }

    // Analyze current page
    function analyzePage() {
        const jobs = detectJobListings();
        const pageData = {
            url: window.location.href,
            hostname: window.location.hostname,
            title: document.title,
            jobCount: jobs.length,
            jobs: jobs.map(extractJobData),
            timestamp: new Date().toISOString(),
            isJobSite: isJobSite()
        };
        
        return pageData;
    }

    // Check if current site is a job site
    function isJobSite() {
        const hostname = window.location.hostname.toLowerCase();
        const path = window.location.pathname.toLowerCase();
        const title = document.title.toLowerCase();
        
        const jobSiteIndicators = [
            'job', 'career', 'emploi', 'recruitment', 'vacancy',
            'rekrute', 'linkedin', 'indeed', 'bayt', 'glassdoor'
        ];
        
        return jobSiteIndicators.some(indicator => 
            hostname.includes(indicator) || 
            path.includes(indicator) || 
            title.includes(indicator)
        );
    }

    // Highlight detected jobs on page
    function highlightJobs(jobs) {
        // Remove existing highlights
        document.querySelectorAll('.zaytoonz-job-highlight').forEach(el => {
            el.classList.remove('zaytoonz-job-highlight');
        });
        
        // Add new highlights
        jobs.forEach(job => {
            if (job.element) {
                job.element.classList.add('zaytoonz-job-highlight');
            }
        });
    }

    // Message handling
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            switch (request.action) {
                case 'analyzePage':
                    const analysis = analyzePage();
                    sendResponse({ success: true, data: analysis });
                    break;
                    
                case 'highlightJobs':
                    const jobs = detectJobListings();
                    highlightJobs(jobs);
                    sendResponse({ success: true, count: jobs.length });
                    break;
                    
                case 'extractJobs':
                    const extractedJobs = detectJobListings().map(extractJobData);
                    sendResponse({ success: true, jobs: extractedJobs });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ success: false, error: error.message });
        }
        
        return true; // Keep message channel open for async response
    });

    // Auto-analyze page when content script loads
    setTimeout(() => {
        try {
            const analysis = analyzePage();
            if (analysis.jobCount > 0) {
                chrome.runtime.sendMessage({
                    action: 'pageAnalyzed',
                    data: analysis
                });
            }
        } catch (error) {
            console.debug('Auto-analysis failed:', error);
        }
    }, 1000);

    console.debug('Zaytoonz RSS Creator content script loaded');
})(); 