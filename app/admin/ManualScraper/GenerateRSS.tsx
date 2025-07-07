"use client";

import { useState } from "react";
import { ArrowLeftIcon, DocumentArrowDownIcon, RssIcon, EyeIcon } from "@heroicons/react/24/outline";

interface ScrapedOpportunity {
  id: string;
  title: string;
  data: Record<string, string>;
  url: string;
}

interface GenerateRSSProps {
  opportunities: ScrapedOpportunity[];
  onBack: () => void;
}

export function GenerateRSS({ opportunities, onBack }: GenerateRSSProps) {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>(
    opportunities.map(op => op.id)
  );
  const [rssGenerated, setRssGenerated] = useState(false);
  const [rssContent, setRssContent] = useState("");

  const handleSelectAll = () => {
    if (selectedOpportunities.length === opportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(opportunities.map(op => op.id));
    }
  };

  const handleSelectOpportunity = (opportunityId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const generateRSSFeed = () => {
    const selectedOps = opportunities.filter(op => selectedOpportunities.includes(op.id));
    
    const rssItems = selectedOps.map(op => {
      const dataFields = Object.entries(op.data)
        .map(([key, value]) => `<${key}><![CDATA[${value}]]></${key}>`)
        .join('\n      ');
      
      return `    <item>
      <title><![CDATA[${op.title}]]></title>
      <link>${op.url}</link>
      <guid>${op.url}#${op.id}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <description><![CDATA[${op.title}]]></description>
      ${dataFields}
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Manual Scraped Opportunities</title>
    <description>Opportunities scraped using Zaytoonz Manual Scraper</description>
    <link>${opportunities[0]?.url || ''}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Zaytoonz Manual Scraper</generator>
${rssItems}
  </channel>
</rss>`;

    setRssContent(rss);
    setRssGenerated(true);
  };

  const downloadRSS = () => {
    const blob = new Blob([rssContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-opportunities-${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyRSSToClipboard = () => {
    navigator.clipboard.writeText(rssContent);
    alert('RSS content copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Scraper
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generated Opportunities</h1>
              <p className="text-gray-600">
                {opportunities.length} opportunities found • {selectedOpportunities.length} selected
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {rssGenerated && (
              <>
                <button
                  onClick={copyRSSToClipboard}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 Copy RSS
                </button>
                <button
                  onClick={downloadRSS}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Download RSS
                </button>
              </>
            )}
            <button
              onClick={generateRSSFeed}
              disabled={selectedOpportunities.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <RssIcon className="h-4 w-4" />
              {rssGenerated ? 'Regenerate RSS' : 'Generate RSS'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Scraped Opportunities</h2>
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#556B2F] hover:text-[#6B8E23] font-medium"
            >
              {selectedOpportunities.length === opportunities.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium mb-2">No Opportunities Found</h3>
              <p>Go back and try selecting different elements or sections</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedOpportunities.includes(opportunity.id)
                      ? "border-[#556B2F] bg-[#556B2F]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOpportunities.includes(opportunity.id)}
                      onChange={() => handleSelectOpportunity(opportunity.id)}
                      className="mt-1 rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{opportunity.title}</h3>
                      {Object.keys(opportunity.data).length > 0 && (
                        <div className="space-y-1">
                          {Object.entries(opportunity.data).map(([key, value]) => (
                            <div key={key} className="flex text-sm">
                              <span className="font-medium text-gray-600 w-24 flex-shrink-0 capitalize">
                                {key}:
                              </span>
                              <span className="text-gray-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Source: {opportunity.url}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RSS Preview */}
        {rssGenerated && (
          <div className="w-1/2 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <EyeIcon className="h-5 w-5" />
                RSS Preview
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {rssContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 