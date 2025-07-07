'use client';

import { useState } from 'react';
import RSSFeedManager from './RSSFeedManager';
import RSSUrlImporter from './RSSUrlImporter';

export default function ScraperPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rss' | 'rss-url'>('overview');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Zaytoonz Scraper</h1>
        <p className="text-gray-600 mb-6">Web scraping tools for opportunities and resources</p>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-[#556B2F] text-[#556B2F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('rss')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rss'
                  ? 'border-[#556B2F] text-[#556B2F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              RSS Feeds
            </button>
            <button
              onClick={() => setActiveTab('rss-url')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rss-url'
                  ? 'border-[#556B2F] text-[#556B2F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              RSS URL Import
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">RSS URL Import</h3>
            <p className="text-gray-600 mb-4">Import jobs directly from RSS.app JSON URLs</p>
            <button 
              onClick={() => setActiveTab('rss-url')}
              className="w-full bg-[#FF6B35] text-white py-2 px-4 rounded hover:bg-[#E55A30] transition-colors"
            >
              Import from URL
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">RSS Feed Manager</h3>
            <p className="text-gray-600 mb-4">Create and manage RSS feeds from job sites</p>
            <button 
              onClick={() => setActiveTab('rss')}
              className="w-full bg-[#4F46E5] text-white py-2 px-4 rounded hover:bg-[#4338CA] transition-colors"
            >
              Manage RSS Feeds
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Resource Manager</h3>
            <p className="text-gray-600 mb-4">Manage scraped resources and data sources</p>
            <button className="w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors">
              Open Manager
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Scraped Jobs</h3>
            <p className="text-gray-600 mb-4">View and manage scraped job opportunities</p>
            <a href="/admin/scraper/jobs" className="block w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors text-center">
              View Jobs
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Scraped Funds</h3>
            <p className="text-gray-600 mb-4">View and manage scraped funding opportunities</p>
            <button className="w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors">
              View Funds
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Scraped Trainings</h3>
            <p className="text-gray-600 mb-4">View and manage scraped training opportunities</p>
            <button className="w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors">
              View Trainings
            </button>
          </div>
        </div>
      ) : activeTab === 'rss' ? (
        <RSSFeedManager />
      ) : activeTab === 'rss-url' ? (
        <RSSUrlImporter />
      ) : null}
    </div>
  );
} 