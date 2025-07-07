'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RSSFeed } from '@/app/lib/rss-service';

interface RSSFeedManagerProps {
  onJobsImported?: (jobs: any[]) => void;
}

export default function RSSFeedManager({ onJobsImported }: RSSFeedManagerProps) {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [importLoading, setImportLoading] = useState<string | null>(null);
  
  // Form state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lastSync: null as Date | null,
  });

  // Load RSS feeds
  const loadFeeds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scraper/rss-feeds');
      const data = await response.json();
      
      if (data.success) {
        setFeeds(data.feeds);
        setStats({
          total: data.total,
          active: data.feeds.length,
          lastSync: new Date(),
        });
      } else {
        toast.error(data.error || 'Failed to load RSS feeds');
      }
    } catch (error) {
      console.error('Error loading RSS feeds:', error);
      toast.error('Error loading RSS feeds');
    } finally {
      setLoading(false);
    }
  };

  // Create new RSS feed
  const createFeed = async () => {
    if (!url.trim()) {
      toast.error('URL is required');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/scraper/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          url: url.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setUrl('');
        setTitle('');
        setDescription('');
        setShowCreateForm(false);
        loadFeeds(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to create RSS feed');
      }
    } catch (error) {
      console.error('Error creating RSS feed:', error);
      toast.error('Error creating RSS feed');
    } finally {
      setCreateLoading(false);
    }
  };

  // Import jobs from RSS feed
  const importJobs = async (feedId: string) => {
    setImportLoading(feedId);
    try {
      const response = await fetch('/api/scraper/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import-jobs',
          feedId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        
        // Store imported jobs in localStorage for the main scraper interface
        const currentJobs = localStorage.getItem('scrapedJobs');
        const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
        
        // Add RSS jobs at the beginning
        data.jobs.forEach((job: any) => {
          jobsList.unshift({
            ...job,
            source: 'RSS Feed',
            feed_title: data.feed.title,
          });
        });
        
        localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        
        // Notify parent component
        if (onJobsImported) {
          onJobsImported(data.jobs);
        }
        
      } else {
        toast.error(data.error || 'Failed to import jobs from RSS feed');
      }
    } catch (error) {
      console.error('Error importing jobs:', error);
      toast.error('Error importing jobs from RSS feed');
    } finally {
      setImportLoading(null);
    }
  };

  // Delete RSS feed
  const deleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scraper/rss-feeds?feedId=${feedId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        loadFeeds(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete RSS feed');
      }
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      toast.error('Error deleting RSS feed');
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">RSS Feed Manager</h2>
          <p className="text-gray-600 text-sm">Manage RSS feeds from job sites and import opportunities</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create Feed'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-blue-800 font-medium">Total Feeds</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-green-800 font-medium">Active Feeds</h3>
          <p className="text-2xl font-bold text-green-900">{stats.active}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-purple-800 font-medium">Last Sync</h3>
          <p className="text-sm text-purple-900">
            {stats.lastSync ? stats.lastSync.toLocaleTimeString() : 'Never'}
          </p>
        </div>
      </div>

      {/* Create Feed Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Create New RSS Feed</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/jobs"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
              />
              <p className="text-xs text-gray-500 mt-1">
                RSS.app will create an RSS feed from this URL
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feed Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job opportunities from..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of this feed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={createFeed}
                disabled={createLoading}
                className="bg-[#556B2F] text-white px-4 py-2 rounded-md hover:bg-[#6B8E23] transition-colors disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create Feed'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSS Feeds List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your RSS Feeds</h3>
            <button
              onClick={loadFeeds}
              disabled={loading}
              className="text-[#556B2F] hover:text-[#6B8E23] text-sm"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading feeds...</div>
          ) : feeds.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No RSS feeds created yet. Create your first feed to get started!
            </div>
          ) : (
            feeds.map((feed) => (
              <div key={feed.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {feed.icon && (
                        <img
                          src={feed.icon}
                          alt="Feed icon"
                          className="w-6 h-6 rounded"
                        />
                      )}
                      <h4 className="font-medium text-gray-900">{feed.title}</h4>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {feed.description}
                    </p>
                    
                    <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                      <span>Source: {feed.source_url}</span>
                      <a
                        href={feed.rss_feed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#556B2F] hover:underline"
                      >
                        View RSS Feed
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => importJobs(feed.id)}
                      disabled={importLoading === feed.id}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {importLoading === feed.id ? 'Importing...' : 'Import Jobs'}
                    </button>
                    
                    <button
                      onClick={() => deleteFeed(feed.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 How RSS Feed Integration Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter any job website URL to create an RSS feed via RSS.app</li>
          <li>• RSS.app automatically converts websites into structured RSS feeds</li>
          <li>• Import jobs from feeds to get the latest opportunities</li>
          <li>• Jobs are automatically parsed and added to your scraper results</li>
          <li>• Set up your RSS.app API credentials in environment variables</li>
        </ul>
      </div>
    </div>
  );
} 