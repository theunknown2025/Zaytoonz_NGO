'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  source_url: string;
  scraped_at: string;
  remote_work: boolean;
  tags: string[];
  experience_level: string;
}

export default function ScrapedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [viewMode, setViewMode] = useState<'local' | 'database'>('local');
  const [advancedMode, setAdvancedMode] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (viewMode === 'local') {
        // Load jobs from localStorage
        const storedJobs = localStorage.getItem('scrapedJobs');
        if (storedJobs) {
          setJobs(JSON.parse(storedJobs));
        } else {
          setJobs([]);
        }
      } else {
        // Load jobs from database
        const response = await fetch('/api/scraper/jobs');
        const data = await response.json();
        
        if (data.success) {
          setJobs(data.jobs);
        } else {
          toast.error('Failed to fetch jobs from database');
          setJobs([]);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Error loading jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const scrapeJob = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setScrapeLoading(true);
    try {
      const response = await fetch('/api/scraper/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          advanced: advancedMode 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Handle multiple jobs or single job
        if (data.jobs && Array.isArray(data.jobs)) {
          // Multiple jobs found
          toast.success(`${data.jobs.length} job opportunities scraped successfully!`);
          
          // Add all jobs to local storage
          const currentJobs = localStorage.getItem('scrapedJobs');
          const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
          
          // Add new jobs at the beginning
          data.jobs.forEach((job: Job) => {
            jobsList.unshift(job);
          });
          
          localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        } else if (data.job) {
          // Single job found
          toast.success('Job scraped successfully!');
          
          // Add job to local storage
          const currentJobs = localStorage.getItem('scrapedJobs');
          const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
          jobsList.unshift(data.job); // Add new job at the beginning
          localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        }
        
        setUrl('');
        fetchJobs(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to scrape job');
      }
    } catch (error) {
      toast.error('Error scraping job');
    } finally {
      setScrapeLoading(false);
    }
  };

  const saveJobsToDatabase = async () => {
    if (jobs.length === 0) {
      toast.error('No jobs to save');
      return;
    }

    setSaveLoading(true);
    try {
      const response = await fetch('/api/scraper/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobs }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Clear local storage after successful save
        localStorage.removeItem('scrapedJobs');
        // Switch to database view to show saved jobs
        setViewMode('database');
      } else {
        toast.error(data.error || 'Failed to save jobs to database');
      }
    } catch (error) {
      console.error('Error saving jobs to database:', error);
      toast.error('Error saving jobs to database');
    } finally {
      setSaveLoading(false);
    }
  };

  const removeJob = (jobId: string) => {
    try {
      if (viewMode === 'local') {
        const currentJobs = localStorage.getItem('scrapedJobs');
        if (currentJobs) {
          const jobsList = JSON.parse(currentJobs);
          const updatedJobs = jobsList.filter((job: Job) => job.id !== jobId);
          localStorage.setItem('scrapedJobs', JSON.stringify(updatedJobs));
          setJobs(updatedJobs);
          toast.success('Job removed successfully');
        }
      } else {
        toast('Database job removal coming soon', { 
          icon: 'ℹ️',
          style: { background: '#E0F2FE', color: '#0369A1' }
        });
      }
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error('Error removing job');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [viewMode]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Scraped Jobs</h1>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('local')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'local'
                  ? 'bg-white text-[#556B2F] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Local Storage ({localStorage.getItem('scrapedJobs') ? JSON.parse(localStorage.getItem('scrapedJobs') || '[]').length : 0})
            </button>
            <button
              onClick={() => setViewMode('database')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'database'
                  ? 'bg-white text-[#556B2F] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Database
            </button>
          </div>
        </div>
        
        {/* URL Input Section - Only show in local mode */}
        {viewMode === 'local' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Scrape New Job</h2>
            
            {/* Advanced Mode Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={advancedMode}
                  onChange={(e) => setAdvancedMode(e.target.checked)}
                  className="w-4 h-4 text-[#556B2F] border-gray-300 rounded focus:ring-[#556B2F]"
                  disabled={scrapeLoading}
                />
                <div>
                  <span className="font-medium text-gray-700">Advanced Scraping Mode</span>
                  <p className="text-sm text-gray-500">
                    {advancedMode 
                      ? 'Will extract individual job links and scrape each job page for detailed information'
                      : 'Basic scraping - extracts job information from the listing page only'
                    }
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={advancedMode 
                  ? "Enter job listing page URL (e.g., https://tanmia.ma/category/offres-demploi/)"
                  : "Enter job posting URL (e.g., LinkedIn, Indeed, etc.)"
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                disabled={scrapeLoading}
              />
              <button
                onClick={scrapeJob}
                disabled={scrapeLoading || !url.trim()}
                className="bg-[#556B2F] text-white px-6 py-2 rounded-lg hover:bg-[#6B8E23] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {scrapeLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {advancedMode ? 'Advanced Scraping...' : 'Scraping...'}
                  </>
                ) : (
                  advancedMode ? 'Advanced Scrape' : 'Scrape Job'
                )}
              </button>
            </div>
            
            {advancedMode && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Advanced Mode:</strong> This will first extract all job links from the page, 
                  then visit each individual job page to get detailed information. 
                  This process may take longer but provides more complete job data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {jobs.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex gap-4 justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                You have {jobs.length} scraped job{jobs.length > 1 ? 's' : ''} 
                {viewMode === 'local' ? ' ready to review' : ' in the database'}
              </p>
            </div>
            <div className="flex gap-3">
              {viewMode === 'local' ? (
                <>
                  <button
                    onClick={() => {
                      localStorage.removeItem('scrapedJobs');
                      setJobs([]);
                      toast.success('All jobs cleared');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={saveJobsToDatabase}
                    disabled={saveLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saveLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save All to Database'
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={fetchJobs}
                  disabled={loading}
                  className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No jobs scraped yet. Add a job posting URL above to get started.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-lg text-[#556B2F] font-medium">{job.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{job.location}</span>
                    {job.job_type && <span>• {job.job_type}</span>}
                    {job.experience_level && <span>• {job.experience_level}</span>}
                    {job.remote_work && <span>• Remote</span>}
                  </div>
                </div>
                <div className="text-right">
                  {job.salary_range && (
                    <p className="text-lg font-semibold text-green-600">{job.salary_range}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Scraped: {new Date(job.scraped_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {job.description && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Description:</h4>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {job.description.slice(0, 300)}...
                  </p>
                </div>
              )}

              {job.tags && job.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#556B2F]/10 text-[#556B2F] px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#556B2F] hover:text-[#6B8E23] font-medium text-sm"
                >
                  View Original →
                </a>
                <button 
                  onClick={() => removeJob(job.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 