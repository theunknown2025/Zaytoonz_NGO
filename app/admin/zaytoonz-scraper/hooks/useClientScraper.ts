import { useState, useCallback } from 'react';

interface FieldMapping {
  id: string;
  name: string;
  selector: string;
  type: 'text' | 'link' | 'image' | 'date';
  required: boolean;
}

interface ExtractedData {
  items: any[];
  total: number;
  config: {
    id: string;
    name: string;
    url: string;
    fields: FieldMapping[];
    itemSelector: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const useClientScraper = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeWebsite = useCallback(async (
    url: string,
    fields: FieldMapping[]
  ): Promise<ExtractedData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Multiple CORS proxy options for better reliability
      const proxyServices = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      ];

      let htmlContent = '';
      let lastError = '';

      // Try each proxy service until one works
      for (const proxyUrl of proxyServices) {
        try {
          console.log(`Trying proxy: ${proxyUrl}`);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.text();
          
          // Handle different proxy response formats
          if (proxyUrl.includes('allorigins.win')) {
            const jsonData = JSON.parse(data);
            htmlContent = jsonData.contents;
          } else {
            htmlContent = data;
          }

          if (htmlContent && htmlContent.length > 100) {
            console.log(`Successfully fetched content using: ${proxyUrl}`);
            break;
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error';
          console.warn(`Proxy failed: ${proxyUrl} - ${lastError}`);
          continue;
        }
      }

      if (!htmlContent || htmlContent.length < 100) {
        throw new Error(`Unable to fetch website content. Last error: ${lastError}. This might be due to CORS restrictions or the website blocking automated requests.`);
      }

      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Check if parsing was successful
      if (!doc || !doc.body) {
        throw new Error('Failed to parse website HTML content');
      }

      console.log(`Successfully parsed HTML. Body contains ${doc.body.children.length} elements`);

      // Extract data using the provided field mappings
      const items = extractDataFromDOM(doc, fields, url);

      if (items.length === 0) {
        // Provide more helpful error message
        const availableElements = Array.from(doc.querySelectorAll('*'))
          .slice(0, 20)
          .map(el => el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''))
          .filter((tag, index, arr) => arr.indexOf(tag) === index)
          .join(', ');

        throw new Error(`No data could be extracted with the current selectors. Try adjusting your field selectors. Available elements include: ${availableElements}`);
      }

      console.log(`Successfully extracted ${items.length} items`);

      return {
        items,
        total: items.length,
        config: {
          id: Date.now().toString(),
          name: `Scraping config for ${new URL(url).hostname}`,
          url,
          fields,
          itemSelector: 'auto-detected',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape website';
      console.error('Scraping error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scrapeWebsite,
    loading,
    error
  };
};

// Helper function to extract data from DOM
function extractDataFromDOM(doc: Document, fields: FieldMapping[], baseUrl: string) {
  const items: any[] = [];
  
  // Enhanced container selectors with more specific patterns
  const containerSelectors = [
    // Job-specific selectors
    '.job', '.job-item', '.job-listing', '.job-post', '.job-card',
    '.position', '.vacancy', '.career-item', '.opportunity',
    
    // Content selectors
    'article', '.post', '.entry', '.item', '.listing',
    '.card', '.news-item', '.content-item', '.story',
    
    // Generic patterns
    '[class*="item"]', '[class*="post"]', '[class*="job"]', 
    '[class*="article"]', '[class*="card"]', '[class*="listing"]',
    
    // List items
    'li', '.list-item', 'tr',
    
    // Div patterns
    'div[class*="row"]', 'div[class*="item"]', 'div[class*="box"]'
  ];

  let bestContainer = null;
  let maxValidItems = 0;

  // Find the best container selector by testing extraction
  for (const selector of containerSelectors) {
    try {
      const elements = doc.querySelectorAll(selector);
      if (elements.length === 0 || elements.length > 200) continue;

      let validItems = 0;
      
      // Test first few elements to see how many valid items we can extract
      for (let i = 0; i < Math.min(5, elements.length); i++) {
        const container = elements[i];
        let hasValidData = false;

        for (const field of fields) {
          if (!field.selector) continue;
          const value = extractFieldValue(container as Element, field, baseUrl);
          if (value && value.trim().length > 0) {
            hasValidData = true;
            break;
          }
        }

        if (hasValidData) validItems++;
      }

      if (validItems > maxValidItems) {
        maxValidItems = validItems;
        bestContainer = selector;
      }
    } catch (e) {
      continue;
    }
  }

  console.log(`Best container selector: ${bestContainer} with ${maxValidItems} valid items`);

  const containers = bestContainer 
    ? doc.querySelectorAll(bestContainer)
    : [doc.body]; // Fallback to body if no containers found

  containers.forEach((container, index) => {
    if (index >= 100) return; // Limit to prevent performance issues

    const item: any = {};
    let hasValidData = false;

    fields.forEach(field => {
      if (!field.selector) return;

      const value = extractFieldValue(container as Element, field, baseUrl);
      if (value && value.trim().length > 0) {
        item[field.name] = value.trim();
        hasValidData = true;
      }
    });

    if (hasValidData) {
      items.push(item);
    }
  });

  return items;
}

// Enhanced field extraction with multiple strategies
function extractFieldValue(container: Element, field: FieldMapping, baseUrl: string): string | null {
  try {
    // Multiple extraction strategies
    const strategies = [
      // Direct selector match
      () => container.querySelector(field.selector),
      // Search within container
      () => container.querySelector(`${field.selector}`),
      // Try with descendant combinator
      () => container.querySelector(`* ${field.selector}`),
      // Try as attribute selector
      () => container.querySelector(`[${field.selector}]`),
      // Try as class contains
      () => container.querySelector(`[class*="${field.selector.replace('.', '')}"]`)
    ];

    let element: Element | null = null;
    
    for (const strategy of strategies) {
      try {
        element = strategy();
        if (element) break;
      } catch (e) {
        continue;
      }
    }

    if (!element) return null;

    let value = '';

    switch (field.type) {
      case 'text':
        value = element.textContent?.trim() || 
                element.getAttribute('title') || 
                element.getAttribute('alt') || '';
        break;
      case 'link':
        value = (element as HTMLAnchorElement).href || 
               element.getAttribute('href') || 
               element.getAttribute('data-href') ||
               element.getAttribute('data-url') || '';
        break;
      case 'image':
        value = (element as HTMLImageElement).src || 
               element.getAttribute('src') || 
               element.getAttribute('data-src') || 
               element.getAttribute('data-lazy-src') ||
               element.getAttribute('data-original') || '';
        break;
      case 'date':
        value = element.textContent?.trim() || 
               element.getAttribute('datetime') || 
               element.getAttribute('data-date') ||
               element.getAttribute('title') || '';
        break;
    }

    // Clean up text values
    if (field.type === 'text' && value) {
      value = value.replace(/\s+/g, ' ').trim();
      // Remove common unwanted prefixes
      value = value.replace(/^(Read more|Learn more|View details|Click here)/i, '').trim();
    }

    // Make relative URLs absolute
    if ((field.type === 'link' || field.type === 'image') && value && !value.startsWith('http')) {
      try {
        if (value.startsWith('//')) {
          value = 'https:' + value;
        } else if (value.startsWith('/')) {
          const baseUrlObj = new URL(baseUrl);
          value = baseUrlObj.origin + value;
        } else if (!value.startsWith('#') && !value.startsWith('mailto:') && !value.startsWith('tel:')) {
          value = new URL(value, baseUrl).toString();
        }
      } catch (e) {
        // Keep original value if URL construction fails
      }
    }

    return value;
  } catch (error) {
    console.warn(`Error extracting field ${field.name}:`, error);
    return null;
  }
} 