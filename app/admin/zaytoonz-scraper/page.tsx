"use client";

import React, { useState } from 'react';
import { RssIcon, ArrowRightIcon, GlobeAltIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useServerScraper } from './hooks/useServerScraper';
import { WebsitePreview } from './components/WebsitePreview';

interface FieldMapping {
  id: string;
  name: string;
  selector: string;
  type: 'text' | 'link' | 'image' | 'date';
  required: boolean;
}

interface ExtractedItem {
  [key: string]: string | null;
}

interface ExtractedData {
  items: ExtractedItem[];
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

export default function ZaytoonzScraperPage() {
  const [currentStep, setCurrentStep] = useState<'url' | 'mapping' | 'preview'>('url');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [fields, setFields] = useState<FieldMapping[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [urlError, setUrlError] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);

  const { scrapeWebsite, loading: scrapeLoading, error: scrapeError } = useServerScraper();

  const validateURL = (input: string) => {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      setUrlError('');
      setIsValidUrl(true);
      return urlObj.toString();
    } catch {
      setUrlError('Please enter a valid URL');
      setIsValidUrl(false);
      return null;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsiteUrl(value);
    if (value.trim()) {
      validateURL(value);
    } else {
      setUrlError('');
      setIsValidUrl(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrl = validateURL(websiteUrl);
    if (validUrl) {
      setWebsiteLoading(true);
      setCurrentStep('mapping');
    }
  };

  const handleWebsiteLoad = () => {
    setWebsiteLoading(false);
  };

  const addField = () => {
    const newField: FieldMapping = {
      id: Date.now().toString(),
      name: '',
      selector: '',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FieldMapping>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handlePreview = async () => {
    if (fields.length === 0) return;
    
    const data = await scrapeWebsite(websiteUrl, fields);
    if (data) {
      setExtractedData(data);
      setCurrentStep('preview');
    }
  };

  const handleRetry = () => {
    handlePreview();
  };

  const resetToStart = () => {
    setCurrentStep('url');
    setWebsiteUrl('');
    setFields([]);
    setExtractedData(null);
  };

  const exportData = (format: 'json' | 'csv' | 'rss') => {
    if (!extractedData) return;

    let content = '';
    let filename = '';
    let mimeType = '';
    
    const fieldNames = fields.map(f => f.name).filter(Boolean);

    switch (format) {
      case 'json':
        content = JSON.stringify(extractedData, null, 2);
        filename = 'scraped-data.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = fieldNames.join(',');
        const rows = extractedData.items.map(item => 
          fieldNames.map(field => `"${(item[field] || '').toString().replace(/"/g, '""')}"`).join(',')
        );
        content = [headers, ...rows].join('\n');
        filename = 'scraped-data.csv';
        mimeType = 'text/csv';
        break;
      case 'rss':
        const rssItems = extractedData.items.map(item => `
    <item>
      <title>${item[fieldNames[0]] || 'Untitled'}</title>
      <link>${item[fieldNames.find(f => f.includes('link') || f.includes('url')) || '']}</link>
      <description>${item[fieldNames[1]] || ''}</description>
    </item>`).join('');
        
        content = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Scraped Feed</title>
    <link>${extractedData.config.url}</link>
    <description>Data scraped from ${extractedData.config.url}</description>${rssItems}
  </channel>
</rss>`;
        filename = 'scraped-feed.rss';
        mimeType = 'application/rss+xml';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-lg">
              <RssIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zaytoonz Scraper</h1>
              <p className="text-gray-600">Reliable Website Data Extraction Tool</p>
              <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
                ✅ Fixed: Parsing issues resolved
              </div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-8 bg-white rounded-xl p-6 shadow-sm">
            {[
              { step: 'url', label: 'Enter URL', number: 1 },
              { step: 'mapping', label: 'Map Fields', number: 2 },
              { step: 'preview', label: 'Preview Data', number: 3 }
            ].map(({ step, label, number }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                    currentStep === step
                      ? 'bg-[#556B2F] text-white'
                      : currentStep === 'mapping' && step === 'url'
                      ? 'bg-green-600 text-white'
                      : currentStep === 'preview' && (step === 'url' || step === 'mapping')
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {(currentStep === 'mapping' && step === 'url') ||
                   (currentStep === 'preview' && (step === 'url' || step === 'mapping')) ? (
                    '✓'
                  ) : (
                    number
                  )}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep === step ? 'text-[#556B2F]' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'url' && (
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-[#556B2F]/10 rounded-full mx-auto mb-4">
                <GlobeAltIcon className="w-8 h-8 text-[#556B2F]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start Your Web Scraping
              </h2>
              <p className="text-gray-600">
                Enter a website URL to begin extracting structured data
              </p>
            </div>

            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com or example.com"
                  className={`w-full px-4 py-4 pl-12 text-lg border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                    urlError
                      ? 'border-red-300 focus:border-red-500'
                      : isValidUrl
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-300 focus:border-[#556B2F]/50'
                  }`}
                  disabled={websiteLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  {websiteLoading ? (
                    <div className="w-5 h-5 border-2 border-[#556B2F] border-t-transparent rounded-full animate-spin" />
                  ) : urlError ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  ) : isValidUrl ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {urlError && (
                <p className="text-red-600 text-sm flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{urlError}</span>
                </p>
              )}

              <button
                type="submit"
                                  disabled={!isValidUrl || websiteLoading}
                className="w-full bg-[#556B2F] hover:bg-[#6B8E23] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
              >
                {websiteLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Analyze Website</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Examples:</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'jobs.tn',
                  'emploi.nat.tn',
                  'tanitjobs.com',
                  'keejob.com'
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setWebsiteUrl(example);
                      validateURL(example);
                    }}
                    className="px-3 py-1 bg-[#556B2F]/10 hover:bg-[#556B2F]/20 text-[#556B2F] text-sm rounded-lg transition-colors duration-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'mapping' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <WebsitePreview
                url={websiteUrl}
                onLoad={handleWebsiteLoad}
              />
              {fields.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={resetToStart}
                    className="text-[#556B2F] hover:text-[#6B8E23] font-medium flex items-center space-x-1 mx-auto"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Change Website</span>
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Map Data Fields</h2>
              </div>

              {/* Help Section */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">CSS Selector Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-blue-800">Common Selectors:</p>
                    <ul className="text-blue-700 space-y-1 mt-1">
                      <li><code className="bg-blue-100 px-1 rounded">h1, h2, h3</code> - Headings</li>
                      <li><code className="bg-blue-100 px-1 rounded">.title</code> - Class name</li>
                      <li><code className="bg-blue-100 px-1 rounded">#content</code> - ID</li>
                      <li><code className="bg-blue-100 px-1 rounded">a</code> - Links</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Advanced:</p>
                    <ul className="text-blue-700 space-y-1 mt-1">
                      <li><code className="bg-blue-100 px-1 rounded">[class*="title"]</code> - Contains class</li>
                      <li><code className="bg-blue-100 px-1 rounded">p:first-child</code> - First paragraph</li>
                      <li><code className="bg-blue-100 px-1 rounded">.post .title</code> - Nested elements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Add Common Fields */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Add Common Fields:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Title', selector: 'h1, h2, h3, .title, [class*="title"]', type: 'text' as const },
                    { name: 'Description', selector: 'p, .description, .excerpt, .summary', type: 'text' as const },
                    { name: 'Link', selector: 'a', type: 'link' as const },
                    { name: 'Company', selector: '.company, .employer, .organization', type: 'text' as const },
                    { name: 'Location', selector: '.location, .city, .place', type: 'text' as const },
                    { name: 'Date', selector: '.date, .published, time, .deadline', type: 'date' as const },
                  ].map((field) => (
                    <button
                      key={field.name}
                      onClick={() => {
                        const newField: FieldMapping = {
                          id: Date.now().toString(),
                          name: field.name,
                          selector: field.selector,
                          type: field.type,
                          required: false
                        };
                        setFields([...fields, newField]);
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 hover:border-[#556B2F] hover:bg-[#556B2F]/5 text-gray-700 text-sm rounded-lg transition-colors duration-200"
                    >
                      + {field.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#556B2F]/50"
                    />
                    <input
                      type="text"
                      placeholder="CSS selector"
                      value={field.selector}
                      onChange={(e) => updateField(field.id, { selector: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#556B2F]/50"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#556B2F]/50"
                    >
                      <option value="text">Text</option>
                      <option value="link">Link</option>
                      <option value="image">Image</option>
                      <option value="date">Date</option>
                    </select>
                    <button
                      onClick={() => removeField(field.id)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={addField}
                  className="px-4 py-2 border border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10 rounded-lg font-medium transition-colors duration-200"
                >
                  Add Field
                </button>
                <button
                  onClick={handlePreview}
                  disabled={fields.length === 0 || scrapeLoading}
                  className="px-6 py-2 bg-[#556B2F] hover:bg-[#6B8E23] disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {scrapeLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Preview Data</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Extracted Data</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentStep('mapping')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    Back to Mapping
                  </button>
                  <button
                    onClick={resetToStart}
                    className="px-4 py-2 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Start New Project
                  </button>
                </div>
              </div>

              {scrapeError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{scrapeError}</p>
                </div>
              )}

              {extractedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">
                        Successfully extracted {extractedData.total} items
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportData('json')}
                        className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg hover:bg-green-50 transition-colors duration-200"
                      >
                        Export JSON
                      </button>
                      <button
                        onClick={() => exportData('csv')}
                        className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg hover:bg-green-50 transition-colors duration-200"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => exportData('rss')}
                        className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg hover:bg-green-50 transition-colors duration-200"
                      >
                        Export RSS
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {extractedData.items.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(item).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">{key}:</p>
                              <p className="text-sm text-gray-600">{value || 'No data'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 