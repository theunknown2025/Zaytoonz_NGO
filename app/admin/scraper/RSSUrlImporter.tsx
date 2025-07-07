'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface RSSUrlImporterProps {
  onJobsImported?: (jobs: any[]) => void;
}

export default function RSSUrlImporter({ onJobsImported }: RSSUrlImporterProps) {
  const [feedUrl, setFeedUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [lastImport, setLastImport] = useState<{
    jobCount: number;
    feedTitle: string;
    timestamp: Date;
  } | null>(null);
  const [previewJobs, setPreviewJobs] = useState<any[]>([]);

  const importJobs = async () => {
    if (!feedUrl.trim()) {
      toast.error('Please enter an RSS feed URL');
      return;
    }

    // Validate URL format
    try {
      new URL(feedUrl.trim());
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('/api/scraper/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import-from-url',
          feedUrl: feedUrl.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        
        // Store imported jobs in localStorage
        const currentJobs = localStorage.getItem('scrapedJobs');
        const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
        
        // Add RSS jobs at the beginning with special source marking
        data.jobs.forEach((job: any) => {
          jobsList.unshift({
            ...job,
            source: 'RSS Feed URL',
            feed_title: data.feedInfo.title,
            feed_url: feedUrl.trim(),
          });
        });
        
        localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        
        // Update last import info
        setLastImport({
          jobCount: data.jobs.length,
          feedTitle: data.feedInfo.title,
          timestamp: new Date(),
        });
        
        // Store preview of first 3 jobs
        setPreviewJobs(data.jobs.slice(0, 3));
        
        // Clear the URL field
        setFeedUrl('');
        
        // Notify parent component
        if (onJobsImported) {
          onJobsImported(data.jobs);
        }
        
      } else {
        toast.error(data.error || 'Failed to import jobs from RSS feed URL');
      }
    } catch (error) {
      console.error('Error importing jobs:', error);
      toast.error('Error importing jobs from RSS feed URL');
    } finally {
      setImporting(false);
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    setFeedUrl(exampleUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">RSS Feed URL Importer</h2>
        <p className="text-gray-600 text-sm">Import jobs directly from RSS.app JSON feed URLs</p>
      </div>

      {/* URL Input */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Import from RSS Feed URL</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RSS Feed URL (JSON format) *
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://rss.app/feeds/v1.1/YOUR_FEED_ID.json"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                disabled={importing}
              />
              <button
                onClick={importJobs}
                disabled={importing || !feedUrl.trim()}
                className="bg-[#556B2F] text-white px-6 py-2 rounded-md hover:bg-[#6B8E23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import Jobs'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the direct JSON feed URL from RSS.app (e.g., the one you shared)
            </p>
          </div>
        </div>
      </div>

      {/* Example URLs */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Example RSS Feed URLs</h4>
        <div className="space-y-2">
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Your ReKrute Feed (Béni Mellal region):</p>
            <button
              onClick={() => handleExampleClick('https://rss.app/feeds/v1.1/efMR2mOwVp2BMyru.json')}
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              https://rss.app/feeds/v1.1/efMR2mOwVp2BMyru.json
            </button>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          💡 Click on an example to load it in the input field above
        </p>
      </div>

      {/* Last Import Status */}
      {lastImport && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">✅ Last Import</h4>
          <div className="text-sm text-green-800 space-y-1 mb-4">
            <p><strong>Feed:</strong> {lastImport.feedTitle}</p>
            <p><strong>Jobs Imported:</strong> {lastImport.jobCount}</p>
            <p><strong>Time:</strong> {lastImport.timestamp.toLocaleString()}</p>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex gap-3">
            <a
              href="/admin/scraper/jobs"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              View Imported Jobs →
            </a>
            <button
              onClick={() => {
                // Check localStorage and show count
                const jobs = localStorage.getItem('scrapedJobs');
                const jobsList = jobs ? JSON.parse(jobs) : [];
                const rssJobs = jobsList.filter((job: any) => job.source === 'RSS Feed URL');
                toast.success(`Found ${rssJobs.length} RSS imported jobs in local storage`, {
                  duration: 3000,
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Check Local Storage
            </button>
          </div>
          
          <p className="text-xs text-green-700 mt-2">
            💡 Jobs are stored in local storage. Visit the "Scraped Jobs" page to see them!
          </p>
        </div>
      )}

      {/* Loading State */}
      {importing && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            <div>
              <p className="text-yellow-800 font-medium">Importing Jobs...</p>
              <p className="text-yellow-700 text-sm">Processing RSS feed and extracting job opportunities</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">🔗 How to Get RSS Feed URLs</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Go to <a href="https://rss.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RSS.app</a> and create a feed from any job website</li>
          <li>Once created, RSS.app provides a JSON feed URL (usually ending in .json)</li>
          <li>Copy that JSON URL and paste it in the input field above</li>
          <li>Click "Import Jobs" to automatically extract and import all job opportunities</li>
        </ol>
        <div className="mt-3 p-3 bg-blue-100 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> The feed you shared contains {' '}
            <a 
              href="https://rss.app/feeds/v1.1/efMR2mOwVp2BMyru.json" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline"
            >
              job opportunities from ReKrute.com
            </a> for the Béni Mellal region in Morocco. Use the example button above to try it!
          </p>
        </div>
      </div>
    </div>
  );
} 