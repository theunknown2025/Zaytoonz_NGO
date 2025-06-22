import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';

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
}

export interface JobListResult {
  jobs: JobData[];
  summary: {
    totalFound: number;
    source: string;
    pageTitle: string;
  };
}

export interface JobLink {
  title: string;
  url: string;
  preview?: string;
}

// Advanced scraper that extracts job links and scrapes each individual job
export async function scrapeJobDataAdvanced(url: string): Promise<JobListResult | null> {
  let browser: Browser | null = null;
  
  try {
    console.log('🚀 Starting ADVANCED job scraping...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // Phase 1: Extract all job links from the listing page
    console.log('📋 Phase 1: Extracting job links from listing page...');
    const jobLinks = await extractJobLinks(browser, url);
    
    if (jobLinks.length === 0) {
      console.log('❌ No job links found on the listing page');
      return null;
    }
    
    console.log(`✅ Found ${jobLinks.length} job links to scrape`);
    
    // Phase 2: Scrape each individual job page
    console.log('🔍 Phase 2: Scraping individual job pages...');
    const jobs: JobData[] = [];
    const maxJobs = Math.min(jobLinks.length, 10); // Limit to 10 jobs to avoid timeout
    
    for (let i = 0; i < maxJobs; i++) {
      const jobLink = jobLinks[i];
      console.log(`📄 Scraping job ${i + 1}/${maxJobs}: ${jobLink.title}`);
      
      try {
        const jobData = await scrapeIndividualJob(browser, jobLink);
        if (jobData) {
          jobs.push(jobData);
          console.log(`✅ Successfully scraped: ${jobData.title}`);
        } else {
          console.log(`⚠️  Failed to scrape: ${jobLink.title}`);
        }
      } catch (error) {
        console.log(`❌ Error scraping ${jobLink.title}:`, error);
      }
      
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`🎯 Advanced scraping complete: ${jobs.length} jobs successfully scraped`);
    
    const domain = new URL(url).hostname;
    return {
      jobs: jobs,
      summary: {
        totalFound: jobs.length,
        source: extractDomainName(domain),
        pageTitle: `Advanced scraping from ${domain}`
      }
    };
    
  } catch (error) {
    console.error('❌ Advanced scraping error:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function scrapeJobData(url: string): Promise<JobData | JobListResult | null> {
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

// Extract job links from a listing page
async function extractJobLinks(browser: Browser, url: string): Promise<JobLink[]> {
  const page = await browser.newPage();
  const jobLinks: JobLink[] = [];
  
  try {
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Block unnecessary requests
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if(['stylesheet', 'font', 'image'].includes(resourceType)){
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`🌐 Navigating to listing page: ${url}`);
    await page.goto(url, { 
      waitUntil: ['domcontentloaded', 'networkidle2'],
      timeout: 30000 
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`📄 Page loaded: ${await page.title()}`);

    // Get page content and parse with Cheerio
    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);
    
    // Enhanced selectors for job links - more comprehensive
    const jobLinkSelectors = [
      // Direct job link patterns
      'a[href*="/job/"]',
      'a[href*="/jobs/"]', 
      'a[href*="/emploi/"]',
      'a[href*="/emplois/"]',
      'a[href*="/career/"]',
      'a[href*="/careers/"]',
      'a[href*="/position/"]',
      'a[href*="/opportunity/"]',
      'a[href*="/offre/"]',
      'a[href*="/offres/"]',
      'a[href*="/poste/"]',
      'a[href*="/postes/"]',
      
      // Article and post links that might be jobs
      'article a[href]',
      '.post a[href]',
      '.job-item a[href]',
      '.job-listing a[href]',
      '.opportunity a[href]',
      '.position a[href]',
      '.vacancy a[href]',
      
      // Title-based links
      'h1 a[href]', 
      'h2 a[href]', 
      'h3 a[href]',
      '.title a[href]',
      '.entry-title a[href]',
      '.post-title a[href]',
      '.job-title a[href]',
      
      // Generic content links
      '.content a[href]',
      '.main a[href]',
      '.list-item a[href]'
    ];

    console.log(`🔍 Searching for job links with ${jobLinkSelectors.length} selectors...`);
    
    const foundLinks = new Set<string>(); // Avoid duplicates
    
    for (const selector of jobLinkSelectors) {
      $(selector).each((_, element) => {
        const $element = $(element);
        const href = $element.attr('href');
        const title = $element.text().trim();
        
        if (href && title && title.length > 5 && title.length < 200) {
          // Convert relative URLs to absolute
          let fullUrl = href;
          if (href.startsWith('/')) {
            const baseUrl = new URL(url);
            fullUrl = `${baseUrl.protocol}//${baseUrl.hostname}${href}`;
          } else if (!href.startsWith('http')) {
            const baseUrl = new URL(url);
            fullUrl = `${baseUrl.protocol}//${baseUrl.hostname}/${href}`;
          }
          
          // Filter out navigation and non-job links
          if (!isNavigationItem(title) && 
              !foundLinks.has(fullUrl) &&
              !fullUrl.includes('#') &&
              !fullUrl.includes('mailto:') &&
              !fullUrl.includes('tel:') &&
              isLikelyJobLink(fullUrl, title)) {
            
            foundLinks.add(fullUrl);
            
            // Get preview text from parent element
            const parentText = $element.closest('article, .post, .job-item, div, li').text();
            const preview = parentText.length > 100 ? 
              parentText.substring(0, 150) + '...' : 
              parentText;
            
            jobLinks.push({
              title: title,
              url: fullUrl,
              preview: preview
            });
            
            console.log(`🔗 Found job link ${jobLinks.length}: "${title}" -> ${fullUrl}`);
          }
        }
      });
    }
    
    console.log(`✅ Total unique job links found: ${jobLinks.length}`);
    return jobLinks;
    
  } catch (error) {
    console.error('❌ Error extracting job links:', error);
    return [];
  } finally {
    await page.close();
  }
}

// Scrape individual job page
async function scrapeIndividualJob(browser: Browser, jobLink: JobLink): Promise<JobData | null> {
  const page = await browser.newPage();
  
  try {
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Block unnecessary requests
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if(['stylesheet', 'font', 'image'].includes(resourceType)){
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`   🌐 Loading: ${jobLink.url}`);
    await page.goto(jobLink.url, { 
      waitUntil: ['domcontentloaded'],
      timeout: 20000 
    });

    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get page content
    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);
    
    // Extract comprehensive job information
    const jobData: JobData = {
      title: jobLink.title,
      description: '',
      company: '',
      location: '',
      job_type: '',
      salary_range: '',
      requirements: '',
      benefits: '',
      experience_level: '',
      remote_work: false,
      tags: []
    };
    
    // Enhanced selectors for detailed job information
    const detailSelectors = {
      title: [
        'h1.job-title', 'h1[class*="title"]', 'h1[class*="heading"]',
        '.job-header h1', '.job-details h1', 'h1', 
        '[data-testid="job-title"]', '.entry-title h1'
      ],
      company: [
        '.company-name', '[class*="company"]', '[class*="employer"]',
        '.job-company', '[data-testid="company-name"]',
        '.organization', '.entreprise'
      ],
      location: [
        '.job-location', '[class*="location"]', '.location',
        '[data-testid="job-location"]', '.lieu', '.localisation'
      ],
      description: [
        '.job-description', '[class*="description"]', '.job-content',
        '.content', '.job-details', '.description', '.contenu',
        '[data-testid="job-description"]'
      ],
      requirements: [
        '.requirements', '.job-requirements', '[class*="requirement"]',
        '.qualifications', '.exigences', '.competences'
      ],
      benefits: [
        '.benefits', '.job-benefits', '[class*="benefit"]',
        '.avantages', '.advantages'
      ],
      salary: [
        '.salary', '.job-salary', '[class*="salary"]', '[class*="salaire"]',
        '.compensation', '.remuneration'
      ]
    };
    
    // Extract title (use original if not found)
    const extractedTitle = extractTextFromSelectors($, detailSelectors.title);
    if (extractedTitle && extractedTitle.length > jobLink.title.length) {
      jobData.title = extractedTitle;
    }
    
    // Extract company
    jobData.company = extractTextFromSelectors($, detailSelectors.company) || 
                     extractDomainName(new URL(jobLink.url).hostname);
    
    // Extract location
    jobData.location = extractTextFromSelectors($, detailSelectors.location) || 
                      'Location not specified';
    
    // Extract description
    const description = extractTextFromSelectors($, detailSelectors.description);
    jobData.description = description || jobLink.preview || 
                         `Job opportunity at ${jobData.company}. Visit the source URL for full details.`;
    
    // Extract requirements
    jobData.requirements = extractTextFromSelectors($, detailSelectors.requirements) || '';
    
    // Extract benefits
    jobData.benefits = extractTextFromSelectors($, detailSelectors.benefits) || '';
    
    // Extract salary
    jobData.salary_range = extractTextFromSelectors($, detailSelectors.salary) || '';
    
    // Extract job type from content
    const fullText = $('body').text().toLowerCase();
    jobData.job_type = extractJobTypeFromText(fullText);
    jobData.experience_level = extractExperienceLevelFromText(fullText);
    jobData.remote_work = isRemoteWork(fullText);
    
    // Generate tags
    jobData.tags = generateTagsFromContent(jobData.title || '', jobData.description || '');
    
    console.log(`   ✅ Scraped: ${jobData.title} at ${jobData.company}`);
    return jobData;
    
  } catch (error) {
    console.error(`   ❌ Error scraping ${jobLink.url}:`, error);
    return null;
  } finally {
    await page.close();
  }
}

// Helper function to determine if a link is likely a job posting
function isLikelyJobLink(url: string, title: string): boolean {
  const jobKeywords = [
    'job', 'emploi', 'career', 'position', 'opportunity', 'vacancy', 
    'offre', 'poste', 'recrutement', 'hiring', 'work'
  ];
  
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Check URL contains job-related keywords
  const urlHasJobKeyword = jobKeywords.some(keyword => urlLower.includes(keyword));
  
  // Check title suggests it's a job
  const titleSuggestsJob = title.length > 10 && title.length < 150 &&
    !titleLower.includes('home') && !titleLower.includes('about') &&
    !titleLower.includes('contact') && !titleLower.includes('menu');
  
  return urlHasJobKeyword || titleSuggestsJob;
}