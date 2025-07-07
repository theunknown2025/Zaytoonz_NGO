import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

interface FieldMapping {
  id: string;
  name: string;
  selector: string;
  type: 'text' | 'link' | 'image' | 'date';
  required: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { url, fields, itemSelector } = await request.json();

    if (!url || !fields || fields.length === 0) {
      return NextResponse.json(
        { error: 'URL and fields are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Simple Scraping: ${url}`);
    console.log(`📋 Fields to extract:`, fields.map((f: FieldMapping) => `${f.name} (${f.selector})`));

    // Fetch the webpage with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ar;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log(`📄 Page loaded successfully`);
    console.log(`📏 HTML length: ${html.length} characters`);
    console.log(`🏷️  Page title: "${document.title}"`);

    let items: any[] = [];
    let bestSelector = null;

    // Try different container selectors
    const containerSelectors = [
      '.job', '.job-item', '.job-listing', '.job-post', '.job-card',
      '.position', '.vacancy', '.career-item', '.opportunity', '.offre',
      'article', '.post', '.entry', '.item', '.listing',
      '.card', '.news-item', '.content-item', '.story',
      '[class*="item"]', '[class*="post"]', '[class*="job"]', 
      '[class*="article"]', '[class*="card"]', '[class*="listing"]',
      'li', '.list-item', 'tr',
      'div[class*="row"]', 'div[class*="item"]', 'div[class*="box"]'
    ];

    for (const selector of containerSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0 || elements.length > 200) continue;

        const testItems: any[] = [];
        
        for (let i = 0; i < Math.min(50, elements.length); i++) {
          const container = elements[i];
          const item: any = {};
          let hasValidData = false;

          fields.forEach((field: FieldMapping) => {
            if (field.selector) {
              const value = extractFieldValue(container, field, url);
              if (value && value.trim().length > 0) {
                item[field.name] = value;
                hasValidData = true;
              }
            }
          });

          if (hasValidData) {
            testItems.push(item);
          }
        }

        if (testItems.length > items.length) {
          items = testItems;
          bestSelector = selector;
        }
      } catch (e) {
        continue;
      }
    }

    // Fallback: direct field extraction
    if (items.length === 0) {
      console.log('\n🔄 Using direct field extraction as fallback...');
      const elementGroups = new Map();
      
      fields.forEach((field: FieldMapping) => {
        if (!field.selector) return;
        
        try {
          const elements = document.querySelectorAll(field.selector);
          
          for (let i = 0; i < Math.min(50, elements.length); i++) {
            const element = elements[i];
            const value = extractFieldValue(element, field, url);
            
            if (value && value.length > 0) {
              if (!elementGroups.has(i)) {
                elementGroups.set(i, {});
              }
              elementGroups.get(i)[field.name] = value;
            }
          }
        } catch (error) {
          console.warn(`Error in fallback for field "${field.name}":`, error);
        }
      });
      
      elementGroups.forEach((group) => {
        if (Object.keys(group).length > 0) {
          items.push(group);
        }
      });
    }

    console.log(`\n🎯 Final result: ${items.length} items extracted`);
    
    // Log sample of extracted data
    if (items.length > 0) {
      console.log('\n📋 Sample extracted item:');
      console.log(JSON.stringify(items[0], null, 2));
    }

    return NextResponse.json({
      items,
      total: items.length,
      selector: bestSelector || 'fallback',
      url: url,
      debug: {
        pageTitle: document.title,
        totalElements: document.querySelectorAll('*').length,
        bestSelector,
        aiEnabled: false
      },
      config: {
        id: Date.now().toString(),
        name: `Simple scraping config for ${new URL(url).hostname}${new URL(url).pathname}`,
        url,
        fields,
        itemSelector: bestSelector || 'fallback',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape website', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Extract field value from element using native DOM methods
function extractFieldValue(element: Element, field: FieldMapping, baseUrl: string): string | null {
  let value = null;
  
  try {
    // Try different strategies to find the field
    const strategies = [
      () => element.querySelector(field.selector),
      () => element.matches(field.selector) ? element : null,
      () => element.parentElement?.querySelector(field.selector) || null,
      () => element.closest(field.selector),
      () => {
        const next = element.nextElementSibling?.querySelector(field.selector);
        const prev = element.previousElementSibling?.querySelector(field.selector);
        return next || prev || null;
      }
    ];

    for (const strategy of strategies) {
      const fieldElement = strategy();
      if (fieldElement) {
        switch (field.type) {
          case 'text':
            value = fieldElement.textContent?.trim() || '';
            if (!value) {
              const textElement = fieldElement.querySelector('h1, h2, h3, h4, h5, h6, p, span, div');
              value = textElement?.textContent?.trim() || '';
            }
            break;
            
          case 'link':
            value = fieldElement.getAttribute('href') || 
                   fieldElement.querySelector('a')?.getAttribute('href') ||
                   fieldElement.closest('a')?.getAttribute('href') || '';
            break;
            
          case 'image':
            value = fieldElement.getAttribute('src') || 
                   fieldElement.querySelector('img')?.getAttribute('src') ||
                   fieldElement.getAttribute('data-src') ||
                   fieldElement.getAttribute('data-lazy-src') || '';
            break;
            
          case 'date':
            value = fieldElement.textContent?.trim() ||
                   fieldElement.getAttribute('datetime') ||
                   fieldElement.getAttribute('data-date') ||
                   fieldElement.querySelector('time')?.getAttribute('datetime') || '';
            break;
        }
        
        if (value && value.length > 0) break;
      }
    }

    // Post-process the value
    if (value) {
      if (field.type === 'text') {
        value = value.replace(/\s+/g, ' ').trim();
        value = value.replace(/^(Read more|Lire la suite|En savoir plus)/i, '').trim();
      }
      
      if ((field.type === 'link' || field.type === 'image') && value && !value.startsWith('http')) {
        try {
          if (value.startsWith('/')) {
            const baseUrlObj = new URL(baseUrl);
            value = baseUrlObj.origin + value;
          } else if (value.startsWith('./') || (!value.startsWith('#') && !value.startsWith('mailto:') && !value.startsWith('tel:'))) {
            value = new URL(value, baseUrl).toString();
          }
        } catch (e) {
          console.warn(`Could not make URL absolute: ${value}`);
        }
      }
      
      if (field.type === 'date') {
        const dateMatch = value.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/);
        if (dateMatch) {
          value = dateMatch[0];
        }
      }
    }

  } catch (error) {
    console.warn(`Error extracting field "${field.name}":`, error);
  }
  
  return value;
}

// Test endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Simple Zaytoonz scraper is running!',
    timestamp: new Date().toISOString(),
    status: 'ready',
    engine: 'jsdom',
    aiEnabled: false
  });
} 