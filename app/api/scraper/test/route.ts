import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function GET() {
  try {
    // Test with a simple HTML string
    const testHtml = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Main Title</h1>
          <h2>Subtitle 1</h2>
          <h2>Subtitle 2</h2>
          <div class="content">
            <p class="description">This is a test paragraph.</p>
            <p class="description">Another test paragraph.</p>
          </div>
        </body>
      </html>
    `;

    const dom = new JSDOM(testHtml);
    const document = dom.window.document;
    
    // Test different selectors
    const tests = [
      { selector: 'h1', expected: ['Main Title'] },
      { selector: 'h2', expected: ['Subtitle 1', 'Subtitle 2'] },
      { selector: '.description', expected: ['This is a test paragraph.', 'Another test paragraph.'] }
    ];

    const results = tests.map(test => {
      const elements: string[] = [];
      const selectedElements = document.querySelectorAll(test.selector);
      
      selectedElements.forEach((element) => {
        const text = element.textContent?.trim();
        if (text) {
          elements.push(text);
        }
      });

      return {
        selector: test.selector,
        found: elements,
        expected: test.expected,
        passed: JSON.stringify(elements) === JSON.stringify(test.expected)
      };
    });

    dom.window.close();

    const allPassed = results.every(r => r.passed);

    return NextResponse.json({
      success: true,
      message: allPassed ? 'All tests passed!' : 'Some tests failed',
      results,
      jsdomWorking: true
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        jsdomWorking: false
      },
      { status: 500 }
    );
  }
} 