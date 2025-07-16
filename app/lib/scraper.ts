import puppeteer, { Browser, Page } from 'puppeteer';
import { JSDOM } from 'jsdom';

export interface JobData {
  title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  salary_range?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  tags?: string[];
  experience_level?: string;
  remote_work?: boolean;
  source_url?: string;
  scraped_at?: string;
  id?: string;
}

export interface JobListResult {
  jobs: JobData[];
  summary: {
    totalFound: number;
    source: string;
    pageTitle: string;
  };
}

// Configuration for external Python scraper
const EXTERNAL_SCRAPER_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_USE_EXTERNAL_SCRAPER === 'true',
  baseUrl: process.env.NEXT_PUBLIC_EXTERNAL_SCRAPER_URL || 'https://your-streamlit-app.streamlit.app',
  apiKey: process.env.NEXT_PUBLIC_EXTERNAL_SCRAPER_API_KEY
};

// Add this interface for external scraper response
export interface ExternalScraperResponse {
  success: boolean;
  data?: JobData | JobListResult;
  jobs?: any[];
  error?: string;
  message?: string;
  metadata?: {
    total_cost?: number;
  };
}

export async function scrapeJobData(url: string): Promise<JobData | JobListResult | null> {
  // Check if external scraper is enabled
  if (EXTERNAL_SCRAPER_CONFIG.enabled) {
    console.log('🐍 Using external Python scraper');
    return await scrapeWithExternalPython(url);
  }
  
  // Fall back to current implementation
  console.log('🌐 Using local TypeScript scraper');
  return await scrapeWithPuppeteer(url);
}

// New function for external Python scraper
async function scrapeWithExternalPython(url: string): Promise<JobData | JobListResult | null> {
  try {
    // Enhanced request with configurable fields and model
    const requestBody = {
      url,
      fields: ["title", "company", "location", "job_type", "salary_range", "description", "requirements", "benefits", "tags", "experience_level", "remote_work"],
      model: process.env.NEXT_PUBLIC_PREFERRED_AI_MODEL || "gpt-4o-mini",
      use_pagination: process.env.NEXT_PUBLIC_ENABLE_PAGINATION === 'true',
      pagination_details: process.env.NEXT_PUBLIC_PAGINATION_DETAILS || ""
    };

    console.log(`🐍 Calling Python scraper for: ${url}`);
    console.log(`📊 Using AI model: ${requestBody.model}`);
    
    const response = await fetch(`${EXTERNAL_SCRAPER_CONFIG.baseUrl}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(EXTERNAL_SCRAPER_CONFIG.apiKey && {
          'Authorization': `Bearer ${EXTERNAL_SCRAPER_CONFIG.apiKey}`
        })
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ExternalScraperResponse = await response.json();
    
    if (result.success) {
      // Log cost information if available
      if (result.metadata?.total_cost) {
        console.log(`💰 Scraping cost: $${result.metadata.total_cost.toFixed(4)}`);
      }
      
      // Handle multiple jobs response format
      if (result.jobs && Array.isArray(result.jobs)) {
        return {
          jobs: result.jobs.map(job => ({
            ...job,
            source_url: url,
            scraped_at: new Date().toISOString(),
            id: `python-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })),
          summary: {
            totalFound: result.jobs.length,
            source: url,
            pageTitle: "AI-Scraped Jobs"
          }
        } as JobListResult;
      }
      
      // Handle single job response
      if (result.data) {
        const jobData = result.data as JobData;
        return {
          ...jobData,
          source_url: url,
          scraped_at: new Date().toISOString(),
          id: `python-${Date.now()}`
        };
      }
      
      return result.data || null;
    } else {
      console.error('External scraper error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error calling external Python scraper:', error);
    // Optionally fall back to local scraper
    if (process.env.NEXT_PUBLIC_FALLBACK_TO_LOCAL === 'true') {
      console.log('🔄 Falling back to local scraper');
      return await scrapeWithPuppeteer(url);
    }
    return null;
  }
}

// Rename existing function
async function scrapeWithPuppeteer(url: string): Promise<JobData | JobListResult | null> {
  let browser: Browser | null = null;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set additional headers to prevent redirects
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    
        // Navigate to the page with specific options to prevent redirects
    console.log(`🌐 Navigating to: ${url}`);
    
    // Block unnecessary requests and unwanted redirects
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if(['stylesheet', 'font', 'image'].includes(resourceType)){
        req.abort();
      } else {
        // Check for potential redirects that change the domain/path significantly
        const requestUrl = req.url();
        const originalDomain = new URL(url).hostname;
        
        try {
          const requestDomain = new URL(requestUrl).hostname;
          // Allow requests to the same domain and subdomains
          if (requestDomain === originalDomain || requestDomain.endsWith('.' + originalDomain)) {
            req.continue();
          } else {
            console.log(`🚫 Blocking potential redirect to different domain: ${requestDomain}`);
            req.continue(); // Still continue but log it
          }
        } catch {
          req.continue();
        }
      }
    });

    const response = await page.goto(url, { 
      waitUntil: ['domcontentloaded', 'networkidle2'],
      timeout: 30000 
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check the final URL and validate it's correct
    const currentUrl = page.url();
    const targetUrlObj = new URL(url);
    const currentUrlObj = new URL(currentUrl);
    
    console.log(`📍 Target URL: ${url}`);
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📄 Page Title: ${await page.title()}`);
    
    // Check if we're on the same domain and path
    const sameDomain = targetUrlObj.hostname === currentUrlObj.hostname;
    const samePath = targetUrlObj.pathname === currentUrlObj.pathname;
    
    // Determine which URL to use for extraction
    let urlForExtraction = url; // Default to original URL
    
    if (!sameDomain) {
      console.log(`⚠️  WARNING: Domain changed from ${targetUrlObj.hostname} to ${currentUrlObj.hostname}`);
      console.log('🚫 Using original URL for extraction to respect user input');
    } else if (!samePath && !currentUrl.includes(targetUrlObj.pathname)) {
      console.log(`⚠️  WARNING: Path changed from ${targetUrlObj.pathname} to ${currentUrlObj.pathname}`);
      
      // If it's just a minor redirect within the same domain (e.g., adding trailing slash, www, etc.)
      // we can use the current URL, otherwise stick to original
      const isMinorRedirect = Math.abs(targetUrlObj.pathname.length - currentUrlObj.pathname.length) <= 2;
      
      if (isMinorRedirect) {
        console.log('🔄 Minor redirect detected - using current URL');
        urlForExtraction = currentUrl;
      } else {
        console.log('🔄 Major redirect detected - using original URL to respect user intent');
        urlForExtraction = url;
      }
    } else {
      console.log('✅ URL matches expectation - using current URL');
      urlForExtraction = currentUrl;
    }
    
    console.log(`🎯 Using URL for extraction: ${urlForExtraction}`);
    
    // Get page content
    const htmlContent = await page.content();
    console.log(`📄 Page content length: ${htmlContent.length} characters`);
    console.log(`📄 Page title: ${await page.title()}`);
    
    // Log some basic page structure
    const bodyText = await page.$eval('body', el => el.innerText?.substring(0, 500) || '');
    console.log(`📝 First 500 chars of body text: ${bodyText}`);
    
    // Parse with Cheerio
    const $ = cheerio.load(htmlContent);
    
        // Check if this is a job listing page (multiple jobs) or single job
    const isJobListingPage = checkIfJobListingPage($, urlForExtraction);

    let jobData;
    if (isJobListingPage) {
      console.log(`🔍 Detected job listing page - extracting multiple jobs from: ${urlForExtraction}`);
      const jobListResult = extractFromJobListingPage($, urlForExtraction);
      // Return the job list result directly
      return jobListResult;
    } else {
      console.log(`🔍 Detected individual job page - extracting single job from: ${urlForExtraction}`);
      jobData = extractJobInformation($, urlForExtraction);
    }
    
    return jobData;
    
  } catch (error) {
    console.error('Error scraping job data:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function extractJobInformation($: cheerio.Root, url: string): JobData {
  const jobData: JobData = {};
  
  // Common selectors for job sites
  const titleSelectors = [
    'h1[data-testid="job-title"]',
    '.job-title',
    '[data-cy="job-title"]',
    'h1.jobTitle',
    '.jobsearch-JobInfoHeader-title',
    'h1',
    '[class*="title"]',
    '[class*="heading"]'
  ];
  
  const companySelectors = [
    '[data-testid="company-name"]',
    '.company-name',
    '[data-cy="company-name"]',
    '.jobsearch-CompanyInfoContainer',
    '[class*="company"]',
    '[class*="employer"]'
  ];
  
  const locationSelectors = [
    '[data-testid="job-location"]',
    '.job-location',
    '[data-cy="location"]',
    '.jobsearch-JobInfoHeader-subtitle',
    '[class*="location"]'
  ];
  
  const descriptionSelectors = [
    '[data-testid="job-description"]',
    '.job-description',
    '[data-cy="job-description"]',
    '.jobsearch-jobDescriptionText',
    '[class*="description"]',
    '[class*="content"]'
  ];
  
  // Extract title
  jobData.title = extractTextFromSelectors($, titleSelectors);
  
  // Extract company
  jobData.company = extractTextFromSelectors($, companySelectors);
  
  // Extract location
  jobData.location = extractTextFromSelectors($, locationSelectors);
  
  // Extract description
  jobData.description = extractTextFromSelectors($, descriptionSelectors);
  
  // Extract salary if available
  const salaryText = $('body').text();
  const salaryMatch = salaryText.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*(?:hour|year|month))?/i);
  if (salaryMatch) {
    jobData.salary_range = salaryMatch[0];
  }
  
  // Detect remote work
  const remoteKeywords = ['remote', 'work from home', 'telecommute', 'wfh'];
  const fullText = $('body').text().toLowerCase();
  jobData.remote_work = remoteKeywords.some(keyword => fullText.includes(keyword));
  
  // Extract job type
  const jobTypeKeywords = {
    'full-time': ['full time', 'full-time', 'fulltime'],
    'part-time': ['part time', 'part-time', 'parttime'],
    'contract': ['contract', 'contractor', 'freelance'],
    'temporary': ['temporary', 'temp', 'seasonal'],
    'internship': ['internship', 'intern']
  };
  
  for (const [type, keywords] of Object.entries(jobTypeKeywords)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      jobData.job_type = type;
      break;
    }
  }
  
  // Extract experience level
  const experienceKeywords = {
    'Entry': ['entry level', 'junior', 'graduate', 'trainee'],
    'Mid': ['mid level', 'experienced', '2-5 years', '3-7 years'],
    'Senior': ['senior', 'lead', 'principal', '5+ years', '7+ years']
  };
  
  for (const [level, keywords] of Object.entries(experienceKeywords)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      jobData.experience_level = level;
      break;
    }
  }
  
  // Extract tags/skills
  const skillsText = jobData.description || '';
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'TypeScript', 'Angular', 'Vue.js', 'PHP', 'C++', 'C#', '.NET', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Git', 'Linux'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    skillsText.toLowerCase().includes(skill.toLowerCase())
  );
  
  if (foundSkills.length > 0) {
    jobData.tags = foundSkills;
  }
  
  return jobData;
}

function checkIfJobListingPage($: cheerio.Root, url: string): boolean {
  // Check if this is a job listing page (contains multiple job postings)
  const jobListingIndicators = [
    '.job-listing',
    '.job-item', 
    '.post-item',
    'article[class*="post"]',
    '[class*="job-list"]',
    'h3 a[href*="job"]',
    'h3 a[href*="emploi"]',
    'h3 a[href*="opportunity"]',
    'h3 a[href*="career"]',
    'h3 a[href*="position"]',
    '.entry-title a',
    '.job-title a',
    'a[href*="apply"]',
    '.listing-item',
    '.opportunity-item'
  ];
  
  // Check URL patterns for various job sites
  const urlPatterns = [
    '/jobs',
    '/emploi',
    '/offres-demploi',
    '/careers',
    '/opportunities',
    '/positions',
    '/vacancies',
    '/openings',
    'category',
    'listing',
    'search'
  ];
  
  // Check page content for multiple job indicators
  const pageText = $('body').text().toLowerCase();
  const multipleJobKeywords = [
    'job opportunities',
    'career opportunities', 
    'open positions',
    'available jobs',
    'job listings',
    'employment opportunities',
    'offres d\'emploi',
    'opportunités'
  ];
  
  const hasUrlIndicator = urlPatterns.some(pattern => url.toLowerCase().includes(pattern));
  const hasMultipleJobs = jobListingIndicators.some(selector => $(selector).length > 1);
  const hasMultipleJobText = multipleJobKeywords.some(keyword => pageText.includes(keyword));
  
  // Count potential job links
  const jobLinkCount = $('a').filter((_, element) => {
    const href = $(element).attr('href') || '';
    const text = $(element).text().trim();
    return (href.includes('job') || href.includes('emploi') || href.includes('career') || 
            href.includes('position') || href.includes('opportunity')) && 
           text.length > 10 && text.length < 100;
  }).length;
  
  console.log(`🔍 Job listing detection:`);
  console.log(`   URL indicators: ${hasUrlIndicator}`);
  console.log(`   Multiple job elements: ${hasMultipleJobs}`);
  console.log(`   Multiple job text: ${hasMultipleJobText}`);
  console.log(`   Job link count: ${jobLinkCount}`);
  console.log(`   Page text sample: ${pageText.substring(0, 200)}...`);
  
  const isJobListing = hasUrlIndicator || hasMultipleJobs || hasMultipleJobText || jobLinkCount > 2;
  console.log(`🎯 Final decision: ${isJobListing ? 'JOB LISTING PAGE' : 'SINGLE JOB PAGE'}`);
  
  return isJobListing;
}

function extractFromJobListingPage($: cheerio.Root, url: string): JobListResult {
  const jobs: JobData[] = [];
  const jobTitles: string[] = [];
  
  // Log page info for debugging
  const pageTitle = $('title').text() || 'Unknown Page';
  const domain = new URL(url).hostname;
  
  console.log(`🏷️  Page title: ${pageTitle}`);
  console.log(`🔗 Processing URL: ${url}`);
  console.log(`🌐 Domain: ${domain}`);
  
  // Comprehensive selectors for job listings from various sites
  const jobSelectors = [
    // Title-based selectors
    'h1 a', 'h2 a', 'h3 a', 'h4 a',
    '.entry-title a', '.post-title a', '.job-title a',
    '.title a', '.heading a',
    
    // Article and post selectors  
    'article h1', 'article h2', 'article h3',
    'article .title', 'article .entry-title',
    
    // Job-specific selectors
    '.job-listing a', '.job-item a', '.opportunity a',
    '.position a', '.career a', '.vacancy a',
    
    // Generic content selectors
    '.content a', '.main a', '.posts a',
    '.list-item a', '.item a',
    
    // Link-based selectors for job-related URLs
    'a[href*="job"]', 'a[href*="emploi"]', 'a[href*="career"]',
    'a[href*="position"]', 'a[href*="opportunity"]', 'a[href*="vacancy"]'
  ];
  
  console.log(`🔍 Trying ${jobSelectors.length} different selectors...`);
  console.log(`📊 Total elements on page: ${$('*').length}`);
  console.log(`📊 Total links on page: ${$('a').length}`);
  console.log(`📊 Total headings on page: ${$('h1, h2, h3, h4, h5, h6').length}`);
  
  for (const selector of jobSelectors) {
    let foundWithThisSelector = 0;
    
    $(selector).each((_, element) => {
      let jobTitle = '';
      let jobUrl = '';
      
      if ($(element).is('a')) {
        jobTitle = $(element).text().trim();
        jobUrl = $(element).attr('href') || '';
      } else {
        // For non-link elements, look for links inside
        const link = $(element).find('a').first();
        if (link.length) {
          jobTitle = link.text().trim() || $(element).text().trim();
          jobUrl = link.attr('href') || '';
        } else {
          jobTitle = $(element).text().trim();
        }
      }
      
      // Filter criteria for valid job titles
      if (jobTitle && 
          jobTitle.length > 8 && 
          jobTitle.length < 200 &&
          !jobTitles.includes(jobTitle) &&
          !isNavigationItem(jobTitle)) {
        
        jobTitles.push(jobTitle);
        foundWithThisSelector++;
        
        console.log(`✅ Job ${jobTitles.length}: "${jobTitle}"`);
        
        // Extract additional context from parent element
        const parentElement = $(element).closest('article, .post, .job-item, .item, div, li');
        const contextText = parentElement.text();
        
        // Try to extract company, date, location from context
        const companyText = extractCompanyFromContext(parentElement, $);
        const locationText = extractLocationFromContext(parentElement, $);
        const dateText = extractDateFromContext(parentElement, $);
        
        // Create individual job entry
        const jobEntry: JobData = {
          title: jobTitle,
          company: companyText || extractDomainName(domain),
          location: locationText || 'Location not specified',
          description: contextText.length > 100 ? 
            contextText.substring(0, 200) + '...' : 
            `Job opportunity found on ${domain}. Visit the source URL for full details.`,
          tags: generateTagsFromContent(jobTitle, contextText),
          job_type: extractJobTypeFromText(contextText),
          experience_level: extractExperienceLevelFromText(contextText),
          remote_work: isRemoteWork(contextText)
        };
        
        jobs.push(jobEntry);
      }
    });
    
    console.log(`   Selector "${selector}" found ${foundWithThisSelector} jobs`);
    
    // If we found a good number of jobs, we can stop looking
    if (jobTitles.length >= 5) {
      console.log(`✅ Found sufficient jobs (${jobTitles.length}), stopping search`);
      break;
    }
  }
  
  // If no jobs found, create a summary entry
  if (jobs.length === 0) {
    console.log('❌ No jobs found, creating fallback entry');
    jobs.push({
      title: `${pageTitle} - Job Listings`,
      company: extractDomainName(domain),
      location: 'Various locations',
      description: `Job listing page from ${domain}. Multiple opportunities may be available - please visit the source page for details.`,
      tags: ['Job Portal', 'Multiple Opportunities'],
      job_type: 'Various',
      experience_level: 'Various',
      remote_work: false
    });
  }
  
  console.log(`\n🎯 EXTRACTION COMPLETE:`);
  console.log(`   Total jobs found: ${jobTitles.length}`);
  console.log(`   Source: ${domain}`);
  console.log(`   Page: ${pageTitle}\n`);
  
  return {
    jobs: jobs,
    summary: {
      totalFound: jobTitles.length,
      source: extractDomainName(domain),
      pageTitle: pageTitle
    }
  };
}

function extractTextFromSelectors($: cheerio.Root, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }
  return undefined;
}

// Helper functions for generic job extraction
function isNavigationItem(text: string): boolean {
  const navKeywords = [
    'menu', 'navigation', 'nav', 'header', 'footer', 'sidebar',
    'contact', 'about', 'home', 'login', 'register', 'search',
    'à propos', 'contact', 'accueil', 'connexion', 'recherche'
  ];
  return navKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function extractDomainName(domain: string): string {
  // Convert domain to a friendly name
  const domainParts = domain.split('.');
  const mainDomain = domainParts[domainParts.length - 2] || domain;
  return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
}

function extractCompanyFromContext(parentElement: cheerio.Cheerio, $: cheerio.Root): string | undefined {
  // Look for company indicators in the context
  const companySelectors = ['.company', '.organization', '.employer', '.org'];
  for (const selector of companySelectors) {
    const company = parentElement.find(selector).first().text().trim();
    if (company) return company;
  }
  return undefined;
}

function extractLocationFromContext(parentElement: cheerio.Cheerio, $: cheerio.Root): string | undefined {
  // Look for location indicators
  const locationSelectors = ['.location', '.city', '.place', '.address'];
  for (const selector of locationSelectors) {
    const location = parentElement.find(selector).first().text().trim();
    if (location) return location;
  }
  
  // Look for common location patterns in text
  const text = parentElement.text();
  const locationPatterns = [
    /(?:in|à|en)\s+([A-Z][a-zA-ZÀ-ÿ\s-]+(?:,\s*[A-Z][a-zA-ZÀ-ÿ\s-]+)?)/g,
    /([A-Z][a-zA-ZÀ-ÿ\s-]+),\s*([A-Z][a-zA-ZÀ-ÿ\s-]+)/g
  ];
  
  for (const pattern of locationPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractDateFromContext(parentElement: cheerio.Cheerio, $: cheerio.Root): string | undefined {
  // Look for date indicators
  const dateSelectors = ['.date', '.post-date', '.published', 'time'];
  for (const selector of dateSelectors) {
    const date = parentElement.find(selector).first().text().trim();
    if (date) return date;
  }
  return undefined;
}

function generateTagsFromContent(title: string, content: string): string[] {
  const tags: string[] = [];
  const text = (title + ' ' + content).toLowerCase();
  
  // Job type tags
  if (text.includes('remote') || text.includes('télétravail')) tags.push('Remote');
  if (text.includes('full-time') || text.includes('temps plein')) tags.push('Full-time');
  if (text.includes('part-time') || text.includes('temps partiel')) tags.push('Part-time');
  if (text.includes('internship') || text.includes('stage')) tags.push('Internship');
  if (text.includes('freelance') || text.includes('consultant')) tags.push('Freelance');
  
  // Industry tags
  const industries = [
    'tech', 'technology', 'software', 'developer', 'engineer',
    'marketing', 'sales', 'finance', 'accounting', 'hr', 'human resources',
    'ngo', 'non-profit', 'nonprofit', 'association', 'development'
  ];
  
  industries.forEach(industry => {
    if (text.includes(industry)) {
      tags.push(industry.charAt(0).toUpperCase() + industry.slice(1));
    }
  });
  
  return tags.length > 0 ? tags : ['General'];
}

function extractJobTypeFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('full-time') || lowerText.includes('temps plein')) return 'Full-time';
  if (lowerText.includes('part-time') || lowerText.includes('temps partiel')) return 'Part-time';
  if (lowerText.includes('contract') || lowerText.includes('contractor')) return 'Contract';
  if (lowerText.includes('internship') || lowerText.includes('stage')) return 'Internship';
  if (lowerText.includes('freelance') || lowerText.includes('consultant')) return 'Freelance';
  
  return 'Not specified';
}

function extractExperienceLevelFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal')) return 'Senior';
  if (lowerText.includes('junior') || lowerText.includes('entry') || lowerText.includes('graduate')) return 'Entry Level';
  if (lowerText.includes('mid') || lowerText.includes('experienced')) return 'Mid Level';
  
  return 'Not specified';
}

function isRemoteWork(text: string): boolean {
  const remoteKeywords = ['remote', 'work from home', 'télétravail', 'à distance', 'home office'];
  return remoteKeywords.some(keyword => text.toLowerCase().includes(keyword));
} 