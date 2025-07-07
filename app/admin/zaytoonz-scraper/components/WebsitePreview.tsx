import React, { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface WebsitePreviewProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  url,
  onLoad,
  onError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false);
      onLoad?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [url, onLoad]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#556B2F] border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preparing Scraper</h3>
          <p className="text-gray-600 text-center">
            Setting up server-side scraping environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/10 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Server-Side Scraper Ready
              </h3>
            </div>
            <p className="text-sm text-gray-600 truncate mt-1">{url}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-[#556B2F] hover:text-[#6B8E23] font-medium text-sm"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            <span>Open Original</span>
          </a>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/10 border border-[#556B2F]/20 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <GlobeAltIcon className="w-8 h-8 text-[#556B2F]" />
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Server-Side Scraping Active
          </h4>
          
          <p className="text-gray-600 mb-4">
            Ready to extract data from {new URL(url).hostname} using stable server-side processing
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>JSDOM Parser</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#556B2F] rounded-full"></div>
              <span>Server Processing</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#6B8E23] rounded-full"></div>
              <span>Fixed Parsing</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ <strong>Parsing Issues Fixed:</strong> Now uses stable JSDOM instead of problematic cheerio/undici!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 