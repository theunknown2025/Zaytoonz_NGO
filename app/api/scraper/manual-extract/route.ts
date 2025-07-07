import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { url, selector } = await request.json();

    if (!url || !selector) {
      return NextResponse.json(
        { error: 'URL and selector are required' },
        { status: 400 }
      );
    }

    console.log(`Scraping ${url} with selector: ${selector}`);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML (${html.length} characters)`);

    // Parse with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find elements using the selector
    const elements: string[] = [];
    
    try {
      // Clean and normalize the selector
      let normalizedSelector = selector;
      
      // Handle CSS escaping for numeric IDs
      // Convert \31 to \31 with proper spacing
      normalizedSelector = normalizedSelector.replace(/\\31\s*([0-9])/g, '\\31 $1');
      
      // Also try alternative ID formats in case the escaping doesn't work
      const alternativeSelectors = [
        normalizedSelector,
        // Try without escaping (in case the ID is actually formatted differently)
        selector.replace(/\\31\s*/g, '1'),
        // Try with different escaping formats
        selector.replace(/\\31\s*/g, '\\31'),
        // Try with hex escape
        selector.replace(/\\31\s*/g, '\\31 ')
      ];
      
      console.log('Trying selectors:', alternativeSelectors);
      
      let selectedElements: NodeListOf<Element> | null = null;
      let workingSelector = '';
      
      // Try each selector until one works
      for (const testSelector of alternativeSelectors) {
        try {
          const testElements = document.querySelectorAll(testSelector);
          if (testElements.length > 0) {
            selectedElements = testElements;
            workingSelector = testSelector;
            break;
          }
        } catch (testError) {
          console.log(`Selector failed: ${testSelector}`, testError);
          continue;
        }
      }
      
      if (selectedElements && selectedElements.length > 0) {
        selectedElements.forEach((element) => {
          const text = element.textContent?.trim();
          if (text) {
            elements.push(text);
          }
        });
        console.log(`Found ${elements.length} elements with working selector: ${workingSelector}`);
      } else {
        // Log some debug information
        console.log('No elements found. Available IDs on page:');
        const allElementsWithIds = document.querySelectorAll('[id]');
        const ids = Array.from(allElementsWithIds).map(el => el.id).slice(0, 10);
        console.log('Sample IDs:', ids);
        
        // Also check if there are any h2 > a elements
        const h2Links = document.querySelectorAll('h2 > a');
        console.log(`Found ${h2Links.length} h2 > a elements total`);
      }

      console.log(`Found ${elements.length} elements with selector: ${selector}`);
    } catch (selectorError) {
      console.error('Selector error:', selectorError);
      throw new Error(`Invalid CSS selector: ${selector}`);
    } finally {
      // Clean up JSDOM
      dom.window.close();
    }

    return NextResponse.json({
      success: true,
      elements,
      count: elements.length,
      selector,
      url
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to scrape website',
        details: error.message,
        suggestion: 'Try a different URL or selector'
      },
      { status: 500 }
    );
  }
} 