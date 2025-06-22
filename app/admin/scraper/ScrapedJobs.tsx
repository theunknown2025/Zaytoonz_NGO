'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  TrashIcon,
  LinkIcon,
  TagIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  ArrowPathIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

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
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [viewMode, setViewMode] = useState<'local' | 'database'>('local');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRemote, setFilterRemote] = useState('all');

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Job type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(job => 
        job.job_type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    // Remote work filter
    if (filterRemote !== 'all') {
      filtered = filtered.filter(job => 
        filterRemote === 'remote' ? job.remote_work : !job.remote_work
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterType, filterRemote]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (viewMode === 'local') {
        const storedJobs = localStorage.getItem('scrapedJobs');
        if (storedJobs) {
          setJobs(JSON.parse(storedJobs));
        } else {
          setJobs([]);
        }
      } else {
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
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.jobs && Array.isArray(data.jobs)) {
          toast.success(`🎉 ${data.jobs.length} job opportunities scraped successfully!`);
          
          const currentJobs = localStorage.getItem('scrapedJobs');
          const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
          
          data.jobs.forEach((job: Job) => {
            jobsList.unshift(job);
          });
          
          localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        } else if (data.job) {
          toast.success('✅ Job scraped successfully!');
          
          const currentJobs = localStorage.getItem('scrapedJobs');
          const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
          jobsList.unshift(data.job);
          localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        }
        
        setUrl('');
        fetchJobs();
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
        localStorage.removeItem('scrapedJobs');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] p-3 rounded-xl">
                  <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                </div>
                Job Scraper Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Discover and manage job opportunities from various sources</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl p-1 shadow-md border">
              <button
                onClick={() => setViewMode('local')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'local'
                    ? 'bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <ComputerDesktopIcon className="h-4 w-4" />
                Local ({localStorage.getItem('scrapedJobs') ? JSON.parse(localStorage.getItem('scrapedJobs') || '[]').length : 0})
              </button>
              <button
                onClick={() => setViewMode('database')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'database'
                    ? 'bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <BookmarkIcon className="h-4 w-4" />
                Database
              </button>
            </div>
          </div>
        </div>

        {/* Scraper Input Section */}
        {viewMode === 'local' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <LinkIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Scrape New Jobs</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="🔗 Enter job posting URL (e.g., tanmia.ma, linkedin.com, indeed.com)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] focus:border-transparent transition-all duration-200 text-sm"
                  disabled={scrapeLoading}
                />
              </div>
              <button
                onClick={scrapeJob}
                disabled={scrapeLoading || !url.trim()}
                className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white px-8 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-200 min-w-[140px]"
              >
                {scrapeLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scraping...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Scrape Jobs
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {filteredJobs.length} of {jobs.length} jobs
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              {/* Job Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              
              {/* Remote Filter */}
              <div>
                <select
                  value={filterRemote}
                  onChange={(e) => setFilterRemote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent text-sm"
                >
                  <option value="all">All Locations</option>
                  <option value="remote">Remote Only</option>
                  <option value="onsite">On-site Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BriefcaseIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {jobs.length} Job{jobs.length > 1 ? 's' : ''} Available
                  </p>
                  <p className="text-sm text-gray-600">
                    {viewMode === 'local' ? 'Ready to review and save' : 'Stored in database'}
                  </p>
                </div>
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
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Clear All
                    </button>
                    <button
                      onClick={saveJobsToDatabase}
                      disabled={saveLoading}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
                    >
                      {saveLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookmarkIcon className="h-4 w-4" />
                          Save All to Database
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={fetchJobs}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white px-6 py-2 rounded-lg hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading amazing opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BriefcaseIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-6">
                {jobs.length === 0 
                  ? "Start by scraping job opportunities from your favorite job boards"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {jobs.length === 0 && viewMode === 'local' && (
                <p className="text-sm text-gray-500">
                  💡 Tip: Try URLs like tanmia.ma/category/offres-demploi/ or linkedin.com/jobs/
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] p-2 rounded-lg flex-shrink-0">
                          <BriefcaseIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#556B2F] transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-[#556B2F] font-semibold">{job.company}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {job.salary_range && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span className="text-sm">{job.salary_range}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>{job.job_type || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                      <span>{job.experience_level || 'Any level'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {job.remote_work ? (
                        <>
                          <ComputerDesktopIcon className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">Remote</span>
                        </>
                      ) : (
                        <>
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">On-site</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {job.description.slice(0, 200)}
                        {job.description.length > 200 && '...'}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 4).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-gradient-to-r from-[#556B2F]/10 to-[#6B8E23]/10 text-[#556B2F] px-3 py-1 rounded-full text-xs font-medium border border-[#556B2F]/20"
                          >
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 4 && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                            +{job.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <a
                        href={job.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#556B2F] hover:text-[#6B8E23] font-medium text-sm transition-colors group"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Original
                        <LinkIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </a>
                      <span className="text-xs text-gray-500">
                        {new Date(job.scraped_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => removeJob(job.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors group"
                      title="Remove job"
                    >
                      <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 