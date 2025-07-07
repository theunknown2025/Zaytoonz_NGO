'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  CloudArrowUpIcon, 
  TrashIcon, 
  EyeIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  ServerIcon,
  DeviceTabletIcon,
  PlusIcon,
  ArrowPathIcon
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

export default function ScrapedJobsEnhanced() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [viewMode, setViewMode] = useState<'local' | 'database'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  // Filter jobs based on search query and selected tags
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => job.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Get unique tags from all jobs
  const allTags = Array.from(new Set(jobs.flatMap(job => job.tags)));

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
          toast.success(`${data.jobs.length} job opportunities scraped successfully!`);
          
          const currentJobs = localStorage.getItem('scrapedJobs');
          const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
          
          data.jobs.forEach((job: Job) => {
            jobsList.unshift(job);
          });
          
          localStorage.setItem('scrapedJobs', JSON.stringify(jobsList));
        } else if (data.job) {
          toast.success('Job scraped successfully!');
          
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Job Scraper Dashboard
              </h1>
              <p className="text-gray-600">
                Discover and manage job opportunities from various platforms
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('local')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'local'
                    ? 'bg-[#556B2F] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <DeviceTabletIcon className="w-4 h-4" />
                Local ({localStorage.getItem('scrapedJobs') ? JSON.parse(localStorage.getItem('scrapedJobs') || '[]').length : 0})
              </button>
              <button
                onClick={() => setViewMode('database')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'database'
                    ? 'bg-[#556B2F] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <ServerIcon className="w-4 h-4" />
                Database
              </button>
            </div>
          </div>
          
          {/* Scraping Section - Only show in local mode */}
          {viewMode === 'local' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#556B2F]/10 rounded-lg">
                  <PlusIcon className="w-5 h-5 text-[#556B2F]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Job Posting</h2>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter job posting URL (e.g., LinkedIn, Indeed, Tanmia.ma...)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F] transition-all duration-200"
                    disabled={scrapeLoading}
                  />
                </div>
                <button
                  onClick={scrapeJob}
                  disabled={scrapeLoading || !url.trim()}
                  className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white px-8 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-200 font-medium"
                >
                  {scrapeLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scraping...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      Scrape Job
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs by title, company, or location..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F] transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-[#556B2F] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredJobs.length}</p>
                  <p className="text-sm text-gray-600">
                    {filteredJobs.length === jobs.length ? 'Total jobs' : `Filtered from ${jobs.length} jobs`}
                    {viewMode === 'local' ? ' ready to review' : ' in database'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {viewMode === 'local' ? (
                  <>
                    <button
                      onClick={() => {
                        localStorage.removeItem('scrapedJobs');
                        setJobs([]);
                        toast.success('All jobs cleared');
                      }}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Clear All
                    </button>
                    <button
                      onClick={saveJobsToDatabase}
                      disabled={saveLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {saveLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="w-4 h-4" />
                          Save to Database
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={fetchJobs}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#556B2F] text-white px-6 py-2 rounded-xl hover:bg-[#6B8E23] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="w-4 h-4" />
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
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading amazing opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 bg-gray-50 rounded-2xl inline-block mb-4">
                <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {jobs.length === 0 
                  ? "Start by adding a job posting URL above to get started."
                  : "Try adjusting your search criteria or filters."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#556B2F] transition-colors duration-200">
                        {job.title}
                      </h3>
                      <p className="text-lg font-semibold text-[#556B2F] mb-2">{job.company}</p>
                      
                      {/* Job Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.job_type && (
                          <div className="flex items-center gap-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            <span>{job.job_type}</span>
                          </div>
                        )}
                        {job.experience_level && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{job.experience_level}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Salary and Date */}
                    <div className="text-right ml-4">
                      {job.salary_range && (
                        <div className="flex items-center gap-1 text-green-600 font-bold mb-2">
                          <CurrencyDollarIcon className="w-5 h-5" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(job.scraped_at).toLocaleDateString()}
                      </p>
                      {job.remote_work && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div className="mb-4">
                      <div className="text-gray-600 text-sm leading-relaxed">
                        {expandedDescriptions.has(job.id) ? (
                          <div>
                            <p className="whitespace-pre-wrap">{job.description}</p>
                            <button
                              onClick={() => setExpandedDescriptions(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(job.id);
                                return newSet;
                              })}
                              className="text-[#556B2F] hover:text-[#6B8E23] font-medium text-xs mt-2 transition-colors duration-200"
                            >
                              Show Less
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="line-clamp-3">
                              {job.description.length > 200 ? job.description.slice(0, 200) + '...' : job.description}
                            </p>
                            {job.description.length > 200 && (
                              <button
                                onClick={() => setExpandedDescriptions(prev => new Set(prev).add(job.id))}
                                className="text-[#556B2F] hover:text-[#6B8E23] font-medium text-xs mt-2 transition-colors duration-200"
                              >
                                Show More
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TagIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Skills Required</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 6).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-[#556B2F]/10 to-[#6B8E23]/10 text-[#556B2F] px-3 py-1 rounded-full text-xs font-medium border border-[#556B2F]/20"
                          >
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 6 && (
                          <span className="text-xs text-gray-500 py-1">
                            +{job.tags.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#556B2F] hover:text-[#6B8E23] font-medium text-sm transition-colors duration-200"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Original
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                    <button 
                      onClick={() => removeJob(job.id)}
                      className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove
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