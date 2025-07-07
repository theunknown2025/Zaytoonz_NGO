"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id: string;
  name: string;
  selector: string;
  elements: string[];
}

interface WebsiteDisplayProps {
  url: string;
  sections: Section[];
  selectedSection: string | null;
  onUpdateSection: (sectionId: string, selector: string, elements: string[]) => void;
}

export function WebsiteDisplay({ url, sections, selectedSection, onUpdateSection }: WebsiteDisplayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [manualSelector, setManualSelector] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    
    // Try to access iframe content (may fail due to CORS)
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        setupElementSelection(iframe.contentDocument);
      }
    } catch (e) {
      console.warn("Cannot access iframe content due to CORS restrictions");
      setupIframeClickCapture();
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load website. This might be due to CORS restrictions or the website blocking iframe embedding.");
  };

  const setupElementSelection = (doc: Document) => {
    const handleElementClick = (e: Event) => {
      if (!isSelectionMode || !selectedSection) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      const selector = generateSelector(target);
      const similarElements = doc.querySelectorAll(selector);
      const elements = Array.from(similarElements).map(el => el.textContent?.trim() || "");
      
      onUpdateSection(selectedSection, selector, elements);
      setIsSelectionMode(false);
    };

    doc.addEventListener('click', handleElementClick, true);
  };

  const setupIframeClickCapture = () => {
    console.log("Setting up fallback selection method due to CORS restrictions");
  };

  const handleManualSelectorSubmit = () => {
    if (!manualSelector.trim() || !selectedSection) {
      alert("Please enter a CSS selector and select a section first!");
      return;
    }
    
    console.log("Attempting to extract with selector:", manualSelector);
    console.log("Selected section:", selectedSection);
    
    // Since CORS blocks iframe access, use server-side scraping
    handleServerSideScraping();
  };

  const handleServerSideScraping = async () => {
    try {
      setIsLoading(true);
      
      // Call a server-side endpoint to scrape the website
      const response = await fetch('/api/scraper/manual-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          selector: manualSelector,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }

      const data = await response.json();
      console.log("Server response:", data);

      if (data.elements && data.elements.length > 0) {
        onUpdateSection(selectedSection!, manualSelector, data.elements);
        setShowManualSelector(false);
        setManualSelector("");
        setIsSelectionMode(false);
        alert(`Successfully extracted ${data.elements.length} elements!`);
      } else {
        // Provide specific help for numeric ID selectors
        const suggestions = getSelectorSuggestions(manualSelector);
        alert(`No elements found with selector "${manualSelector}".\n\n${suggestions}`);
      }
    } catch (error: any) {
      console.error("Server-side scraping error:", error);
      
      // Show specific error message
      if (error.message?.includes('Invalid CSS selector')) {
        alert(`Invalid CSS selector: "${manualSelector}"\n\nPlease check your selector syntax:\n• Use .class-name for classes\n• Use #id-name for IDs\n• Use tag names like h1, p, div\n• Use combinations like .card h2`);
      } else if (error.message?.includes('Failed to fetch')) {
        alert(`Cannot access website: ${url}\n\nPossible reasons:\n• Website blocks server requests\n• Invalid URL\n• Network issues\n\nTry a different website or use manual input.`);
      } else {
        alert(`Extraction failed: ${error.message || 'Unknown error'}\n\nWould you like to try manual input instead?`);
        // Fallback to manual input method
        handleManualInput();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectorSuggestions = (selector: string): string => {
    if (selector.includes('\\31')) {
      return `🔧 CSS Escaping Issue Detected!\n\nYour selector contains "\\31" which is CSS escaping for numeric IDs.\n\nTry these alternatives:\n1. Replace "\\31 72831" with "172831" (remove escaping)\n2. Use a more general selector like "h2 > a" or ".col-sm-10 h2 a"\n3. Use class-based selectors instead of IDs\n\nExample alternatives:\n• h2 > a\n• .col-sm-10 h2 a\n• [id*="72831"] h2 a`;
    }
    
    if (selector.includes('#') && /\d/.test(selector)) {
      return `⚠️ Numeric ID Issue!\n\nNumeric IDs can be tricky. Try:\n1. Use attribute selector: [id="your-id"]\n2. Use a more general selector\n3. Use class-based selectors instead\n\nAlternatives:\n• Replace "#123" with "[id='123']"\n• Use class selectors like ".className"\n• Use tag + class: "div.className"`;
    }
    
    return `Possible reasons:\n1. The selector doesn't match any elements\n2. The website has dynamic content loaded by JavaScript\n3. The element structure might be different\n\nSuggestions:\n• Try simpler selectors like "h2", "a", ".title"\n• Use browser dev tools to copy the exact selector\n• Check if content loads dynamically\n• Try broader selectors and narrow down`;
  };

  const handleManualInput = () => {
    const userInput = prompt(
      `CORS restrictions prevent automatic extraction.\n\nPlease manually extract the data:\n\n1. Open ${url} in a new tab\n2. Use browser dev tools to find elements with selector: ${manualSelector}\n3. Copy the text content and paste below\n\nEnter the extracted text (one per line):`
    );

    if (userInput && userInput.trim()) {
      const elements = userInput.split('\n').map(line => line.trim()).filter(line => line);
      if (elements.length > 0) {
        onUpdateSection(selectedSection!, manualSelector, elements);
        setShowManualSelector(false);
        setManualSelector("");
        setIsSelectionMode(false);
        alert(`Successfully added ${elements.length} elements!`);
      }
    }
  };

  const generateSelector = (element: HTMLElement): string => {
    const path: string[] = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim()).slice(0, 2);
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      
      const siblings = Array.from(current.parentElement?.children || []);
      const sameTagSiblings = siblings.filter(s => s.nodeName === current.nodeName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      
      path.unshift(selector);
      current = current.parentElement as HTMLElement;
      
      if (path.length > 5) break;
    }

    return path.join(' > ');
  };

  const startElementSelection = () => {
    if (!selectedSection) {
      alert("Please select a section first!");
      return;
    }
    setIsSelectionMode(true);
  };

  const showManualSelectorInput = () => {
    if (!selectedSection) {
      alert("Please select a section first!");
      return;
    }
    setShowManualSelector(true);
  };

  const getProxiedUrl = (originalUrl: string) => {
    return `https://cors-anywhere.herokuapp.com/${originalUrl}`;
  };

  const tryAlternativeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = getProxiedUrl(url);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Website: {url}</span>
            {selectedSection && (
              <span className="text-sm text-[#556B2F] font-medium">
                Active Section: {sections.find(s => s.id === selectedSection)?.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={startElementSelection}
              disabled={!selectedSection || isSelectionMode || showManualSelector}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isSelectionMode
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : selectedSection && !showManualSelector
                  ? "bg-[#556B2F] text-white hover:bg-[#6B8E23]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSelectionMode ? "Click on elements to select..." : "Click Selection"}
            </button>
            <button
              onClick={showManualSelectorInput}
              disabled={!selectedSection || isSelectionMode || showManualSelector}
              className={`px-4 py-2 text-sm rounded-lg transition-colors border ${
                selectedSection && !isSelectionMode && !showManualSelector
                  ? "border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F] hover:text-white"
                  : "border-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Manual Selector
            </button>
          </div>
        </div>
      </div>

      {/* Manual Selector Input */}
      {showManualSelector && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="max-w-4xl">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Server-Side CSS Extraction</h3>
            <p className="text-xs text-blue-600 mb-3">
              Our server will fetch and parse the website to extract elements. 
              Use browser developer tools to find the right CSS selector: 
              Right-click on element → Inspect → Right-click on HTML tag → Copy → Copy selector
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., .job-title, #content h2, .card .title"
                value={manualSelector}
                onChange={(e) => setManualSelector(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSelectorSubmit()}
                disabled={isLoading}
              />
              <button
                onClick={handleManualSelectorSubmit}
                disabled={!manualSelector.trim() || isLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Extracting...
                  </>
                ) : (
                  "Extract"
                )}
              </button>
              <button
                onClick={() => {
                  // Test with a simple selector
                  setManualSelector("h1, h2, h3");
                }}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => {
                  setShowManualSelector(false);
                  setManualSelector("");
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <strong>Common selectors:</strong> 
              <code className="ml-1 px-1 bg-gray-200 rounded">.class-name</code>
              <code className="ml-1 px-1 bg-gray-200 rounded">#id-name</code>
              <code className="ml-1 px-1 bg-gray-200 rounded">tag</code>
              <code className="ml-1 px-1 bg-gray-200 rounded">[attribute="value"]</code>
            </div>
            
            {/* Selector Helper for CSS Escaping Issues */}
            {manualSelector.includes('\\31') && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">CSS Escaping Detected</p>
                    <p className="text-amber-700 mb-2">Your selector contains "\\31" which is CSS escaping for numeric IDs.</p>
                    <div className="space-y-1">
                      <p className="font-medium text-amber-800">Try these alternatives:</p>
                      <button 
                        onClick={() => setManualSelector(manualSelector.replace(/\\31\s*/g, '1'))}
                        className="block w-full text-left px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-50 transition-colors"
                      >
                        📋 {manualSelector.replace(/\\31\s*/g, '1')} (remove escaping)
                      </button>
                      <button 
                        onClick={() => setManualSelector('h2 > a')}
                        className="block w-full text-left px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-50 transition-colors"
                      >
                        📋 h2 &gt; a (general selector)
                      </button>
                      <button 
                        onClick={() => setManualSelector('.col-sm-10 h2 a')}
                        className="block w-full text-left px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-50 transition-colors"
                      >
                        📋 .col-sm-10 h2 a (class-based)
                      </button>
                      <button 
                        onClick={() => setManualSelector('[id*="72831"] h2 a')}
                        className="block w-full text-left px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-50 transition-colors"
                      >
                        📋 [id*="72831"] h2 a (attribute selector)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Website Display */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading website...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="h-full flex items-center justify-center bg-blue-50">
            <div className="text-center max-w-2xl mx-auto p-6">
              <div className="text-blue-500 text-5xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Website Blocks Iframe Embedding</h3>
              <p className="text-blue-600 mb-4">
                <strong>{new URL(url).hostname}</strong> prevents embedding for security reasons.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <p className="font-medium text-green-800">Solution: Use Manual Selector</p>
                </div>
                <p className="text-green-700 text-sm">
                  Our server can still extract data directly from the website, bypassing the iframe restriction.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!selectedSection) {
                      alert("Please create and select a section first!");
                      return;
                    }
                    setShowManualSelector(true);
                  }}
                  className="px-6 py-3 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors font-medium"
                >
                  🎯 Open Manual Selector
                </button>
                <button
                  onClick={tryAlternativeLoad}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Try CORS Proxy (may not work)
                </button>
              </div>
              <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border mt-4">
                <p className="font-medium mb-3 text-gray-800">📋 Quick Guide:</p>
                <ol className="text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#556B2F] font-bold">1.</span>
                    <span>Create a section on the left (e.g., "Job Titles")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#556B2F] font-bold">2.</span>
                    <span>Click "Manual Selector" above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#556B2F] font-bold">3.</span>
                    <span>Enter a CSS selector (e.g., "h2 a", ".job-title")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#556B2F] font-bold">4.</span>
                    <span>Click "Extract" - our server will fetch the data!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              title="Website Preview"
              style={{ pointerEvents: isSelectionMode ? 'none' : 'auto' }}
            />
            
            {isSelectionMode && (
              <div 
                className="absolute inset-0 z-10 cursor-crosshair"
                onClick={() => {
                  alert("Direct clicking is blocked by CORS. Please use the 'Manual Selector' option instead.");
                  setIsSelectionMode(false);
                }}
                style={{ backgroundColor: 'rgba(85, 107, 47, 0.1)' }}
              />
            )}
          </>
        )}

        {isSelectionMode && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-20">
            <div className="flex items-center gap-2">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
              Selection Mode Active - Click on elements to select them
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 