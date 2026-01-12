'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  MagnifyingGlassCircleIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
  LinkIcon,
  TagIcon,
  SparklesIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  Square2StackIcon,
  ArchiveBoxArrowDownIcon,
  DocumentTextIcon,
  BookmarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';

interface JobData {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  salary_range?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  deadline?: string;
  tags?: string[];
  experience_level?: string;
  remote_work?: boolean;
  url?: string;
  link?: string;
  href?: string;
  apply_url?: string;
  detail_url?: string;
  application_url?: string;
  job_url?: string;
  opportunity_url?: string;
  source_url?: string;
  [key: string]: unknown;
}

interface ScrapeResult {
  success: boolean;
  data?: JobData;
  jobs?: JobData[];
  error?: string;
  message?: string;
  pagination_urls?: string[];
  metadata?: {
    total_cost?: number;
    unique_name?: string;
    extracted_fields?: string[];
    model_used?: string;
  };
}

const DEFAULT_FIELDS = ['title', 'company', 'location', 'description', 'url', 'job_type', 'salary_range', 'deadline'];

interface SavedSource {
  id: string;
  name: string;
  url: string;
  description?: string;
  opportunity_type: 'job' | 'funding' | 'training';
  fields: string[];
  use_pagination: boolean;
  pagination_details?: string;
  is_active: boolean;
  last_scraped_at?: string;
  scrape_count: number;
  created_at: string;
  updated_at: string;
}

export default function ScraperPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'scraper' | 'saved-sources'>('scraper');
  
  // Scraper tab state
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [fields, setFields] = useState<string[]>(DEFAULT_FIELDS);
  const [fieldInput, setFieldInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usePagination, setUsePagination] = useState(false);
  const [paginationDetails, setPaginationDetails] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [currentSourceUrl, setCurrentSourceUrl] = useState<string>('');
  
  // Selection state
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });
  const [opportunityType, setOpportunityType] = useState<'job' | 'funding' | 'training'>('job');

  // Saved Sources tab state
  const [savedSources, setSavedSources] = useState<SavedSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState<SavedSource | null>(null);
  const [sourceForm, setSourceForm] = useState({
    name: '',
    url: '',
    description: '',
    opportunity_type: 'job' as 'job' | 'funding' | 'training',
    fields: DEFAULT_FIELDS,
    use_pagination: false,
    pagination_details: '',
  });

  // Use relative path for Nginx proxy, or fallback to env var, or localhost for dev
  // Nginx proxies /api/scraper/ to http://localhost:8000/
  const SCRAPER_URL = process.env.NEXT_PUBLIC_EXTERNAL_SCRAPER_URL || 
    (typeof window !== 'undefined' ? '/api/scraper' : 'http://localhost:8000');

  // Generate unique IDs for jobs
  const getAllJobs = useCallback((): { job: JobData; sourceUrl: string; uniqueId: string }[] => {
    const allJobs: { job: JobData; sourceUrl: string; uniqueId: string }[] = [];
    results.forEach((result, idx) => {
      if (result.success) {
        const jobs = result.jobs || (result.data ? [result.data] : []);
        jobs.forEach((job, jobIdx) => {
          const uniqueId = `${idx}-${jobIdx}-${job.title || 'untitled'}`;
          allJobs.push({ job, sourceUrl: urls[idx], uniqueId });
        });
      }
    });
    return allJobs;
  }, [results, urls]);

  // Smart URL extraction
  const findJobUrl = (jobData: JobData): string => {
    const standardFields = [
      'url', 'link', 'href', 'apply_url', 'detail_url', 
      'application_url', 'job_url', 'opportunity_url', 'source_url'
    ];
    for (const field of standardFields) {
      const val = jobData[field];
      if (val && typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
        return val;
      }
    }
    
    const keys = Object.keys(jobData);
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('url') || lowerKey.includes('link') || lowerKey.includes('href')) {
        const val = jobData[key];
        if (val && typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
          return val;
        }
      }
    }
    
    for (const key of keys) {
      const val = jobData[key];
      if (val && typeof val === 'string' && val.startsWith('http')) {
        return val;
      }
    }
    
    return '';
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      const newUrls = urlInput.trim().split(/\s+/).filter((u) => u && !urls.includes(u));
      setUrls([...urls, ...newUrls]);
      setUrlInput('');
    }
  };

  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  
  const addField = () => {
    if (fieldInput.trim() && !fields.includes(fieldInput.trim())) {
      setFields([...fields, fieldInput.trim()]);
      setFieldInput('');
    }
  };
  
  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
  
  const clearAll = () => { 
    setUrls([]); 
    setResults([]); 
    setError(null); 
    setSuccessMessage(null);
    setSelectedJobs(new Set());
  };

  // Selection handlers
  const toggleJobSelection = (uniqueId: string) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uniqueId)) {
        newSet.delete(uniqueId);
      } else {
        newSet.add(uniqueId);
      }
      return newSet;
    });
  };

  const selectAllJobs = () => {
    const allJobs = getAllJobs();
    setSelectedJobs(new Set(allJobs.map(j => j.uniqueId)));
  };

  const deselectAllJobs = () => {
    setSelectedJobs(new Set());
  };

  const handleScrape = async () => {
    if (urls.length === 0) { setError('Please add at least one URL'); return; }
    if (fields.length === 0) { setError('Please add at least one field'); return; }
    setIsLoading(true); 
    setError(null); 
    setSuccessMessage(null);
    setResults([]);
    setSelectedJobs(new Set());
    
    const allResults: ScrapeResult[] = [];
    for (const url of urls) {
      try {
        const res = await fetch(SCRAPER_URL + '/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, fields, model: 'gpt-4o-mini', use_pagination: usePagination, pagination_details: paginationDetails }),
        });
        const result = await res.json();
        console.log('Scraper API Response:', result);
        console.log('Jobs in response:', result.jobs?.length || 0);
        console.log('Data in response:', result.data);
        allResults.push(result);
      } catch (err) {
        console.error('Scraper API Error:', err);
        allResults.push({ success: false, error: 'Failed: ' + (err instanceof Error ? err.message : 'Unknown') });
      }
    }
    console.log('All results:', allResults);
    setResults(allResults); 
    setIsLoading(false);
  };

  const handleSaveSelected = async () => {
    const allJobs = getAllJobs();
    const selectedJobsData = allJobs.filter(j => selectedJobs.has(j.uniqueId));
    
    if (selectedJobsData.length === 0) {
      setError('Please select at least one opportunity to save');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/scraped-opportunities/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunities: selectedJobsData.map(j => j.job),
          opportunity_type: opportunityType,
          source_url: selectedJobsData[0]?.sourceUrl || urls[0] || 'unknown',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(`Successfully saved ${result.saved} of ${result.total} opportunities!`);
        setSelectedJobs(new Set());
        setShowSaveModal(false);
      } else {
        setError(result.error || 'Failed to save opportunities');
      }
    } catch (err) {
      setError('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelected = () => {
    const allJobs = getAllJobs();
    const remainingJobs = allJobs.filter(j => !selectedJobs.has(j.uniqueId));
    
    const newResults: ScrapeResult[] = urls.map((url) => {
      const urlJobs = remainingJobs
        .filter(j => j.sourceUrl === url)
        .map(j => j.job);
      
      if (urlJobs.length === 0) {
        return { success: true, jobs: [] };
      }
      return { success: true, jobs: urlJobs };
    });

    setResults(newResults);
    setSelectedJobs(new Set());
    setSuccessMessage(`Removed ${selectedJobs.size} opportunities from results`);
  };

  const handleExtractSelected = async () => {
    const allJobs = getAllJobs();
    const selectedJobsData = allJobs.filter(j => selectedJobs.has(j.uniqueId));
    
    if (selectedJobsData.length === 0) {
      setError('Please select at least one opportunity to extract');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setSuccessMessage(null);
    setExtractionProgress({ current: 0, total: selectedJobsData.length });

    try {
      // Prepare opportunities for extraction
      const opportunitiesToExtract = selectedJobsData.map(j => ({
        title: j.job.title || 'Untitled',
        url: findJobUrl(j.job) || j.sourceUrl,
        opportunity_type: opportunityType,
      }));

      const response = await fetch('/api/admin/extract-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunities: opportunitiesToExtract,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const extractedCount = result.results?.filter((r: { status: string }) => r.status === 'extracted').length || 0;
        const alreadyExtracted = result.results?.filter((r: { status: string }) => r.status === 'already_extracted').length || 0;
        const failedCount = result.errors?.length || 0;

        let message = `Extracted ${extractedCount} of ${result.total} opportunities.`;
        if (alreadyExtracted > 0) message += ` ${alreadyExtracted} already extracted.`;
        if (failedCount > 0) message += ` ${failedCount} failed.`;

        setSuccessMessage(message);
        setSelectedJobs(new Set());
        setShowExtractModal(false);
      } else {
        setError(result.error || 'Failed to extract opportunities');
      }
    } catch (err) {
      setError('Failed to extract: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsExtracting(false);
      setExtractionProgress({ current: 0, total: 0 });
    }
  };

  const downloadResults = (format: 'json' | 'csv') => {
    const allJobs: JobData[] = [];
    results.forEach((r) => { if (r.success) { if (r.jobs) allJobs.push(...r.jobs); else if (r.data) allJobs.push(r.data); } });
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(allJobs, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scraped.json'; a.click();
    } else {
      if (!allJobs.length) return;
      const headers = Object.keys(allJobs[0]);
      const rows = [headers.join(','), ...allJobs.map(job => headers.map(h => { const v = job[h]; return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : Array.isArray(v) ? `"${v.join('; ')}"` : v ?? ''; }).join(','))];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scraped.csv'; a.click();
    }
  };

  const totalJobs = results.reduce((a, r) => a + (r.success ? (r.jobs?.length || (r.data ? 1 : 0)) : 0), 0);

  // Saved Sources functions
  const loadSavedSources = useCallback(async () => {
    setIsLoadingSources(true);
    try {
      const response = await fetch('/api/admin/saved-sources');
      const data = await response.json();
      if (response.ok) {
        setSavedSources(data.sources || []);
      } else {
        setError(data.error || 'Failed to load saved sources');
      }
    } catch (err) {
      setError('Failed to load saved sources: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'saved-sources') {
      loadSavedSources();
    }
  }, [activeTab, loadSavedSources]);

  const handleSaveSource = async () => {
    if (!sourceForm.name || !sourceForm.url) {
      setError('Name and URL are required');
      return;
    }

    try {
      const url = editingSource 
        ? `/api/admin/saved-sources/${editingSource.id}`
        : '/api/admin/saved-sources';
      
      const method = editingSource ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(editingSource ? 'Source updated successfully' : 'Source saved successfully');
        setShowSourceModal(false);
        setEditingSource(null);
        setSourceForm({
          name: '',
          url: '',
          description: '',
          opportunity_type: 'job',
          fields: DEFAULT_FIELDS,
          use_pagination: false,
          pagination_details: '',
        });
        loadSavedSources();
      } else {
        setError(data.error || 'Failed to save source');
      }
    } catch (err) {
      setError('Failed to save source: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEditSource = (source: SavedSource) => {
    setEditingSource(source);
    setSourceForm({
      name: source.name,
      url: source.url,
      description: source.description || '',
      opportunity_type: source.opportunity_type,
      fields: source.fields || DEFAULT_FIELDS,
      use_pagination: source.use_pagination,
      pagination_details: source.pagination_details || '',
    });
    setShowSourceModal(true);
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    try {
      const response = await fetch(`/api/admin/saved-sources/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage('Source deleted successfully');
        loadSavedSources();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete source');
      }
    } catch (err) {
      setError('Failed to delete source: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleLoadSourceToScraper = (source: SavedSource) => {
    setUrls([source.url]);
    setFields(source.fields || DEFAULT_FIELDS);
    setUsePagination(source.use_pagination);
    setPaginationDetails(source.pagination_details || '');
    setOpportunityType(source.opportunity_type);
    setActiveTab('scraper');
    setSuccessMessage(`Loaded source "${source.name}" to scraper`);
  };

  const handleToggleSourceActive = async (source: SavedSource) => {
    try {
      const response = await fetch(`/api/admin/saved-sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !source.is_active }),
      });

      if (response.ok) {
        loadSavedSources();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update source');
      }
    } catch (err) {
      setError('Failed to update source: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#556B2F] rounded-xl">
            <MagnifyingGlassCircleIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Opportunities Scraper</h1>
            <p className="text-gray-500 text-sm">AI-powered web scraping for opportunities</p>
          </div>
          </div>
          <a
            href="/admin/Scraper/extracted"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <DocumentTextIcon className="h-5 w-5" />
            View Extracted
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('scraper')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'scraper'
                ? 'border-[#556B2F] text-[#556B2F]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              Scraper
            </div>
          </button>
          <button
            onClick={() => setActiveTab('saved-sources')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'saved-sources'
                ? 'border-[#556B2F] text-[#556B2F]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkIcon className="h-5 w-5" />
              Saved Sources
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'scraper' && (
        <>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* URLs Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="h-5 w-5 text-[#556B2F]" />
              <h2 className="font-semibold text-gray-800">URLs to Scrape</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                value={urlInput} 
                onChange={(e) => setUrlInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && addUrl()} 
                placeholder="Enter URL..." 
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]" 
              />
              <button 
                onClick={addUrl} 
                className="p-2.5 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {urls.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No URLs added</p>
              ) : urls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg group border border-gray-100">
                  <span className="flex-1 text-sm text-gray-700 truncate">{url}</span>
                  <button onClick={() => removeUrl(i)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fields Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="h-5 w-5 text-[#556B2F]" />
              <h2 className="font-semibold text-gray-800">Fields to Extract</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                value={fieldInput} 
                onChange={(e) => setFieldInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && addField()} 
                placeholder="Add field..." 
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]" 
              />
              <button 
                onClick={addField} 
                className="p-2.5 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {fields.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#556B2F]/10 text-[#556B2F] rounded-full text-sm font-medium border border-[#556B2F]/20">
                  {f}
                  <button onClick={() => removeField(i)} className="hover:bg-[#556B2F]/20 rounded-full p-0.5">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Pagination Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Pagination</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={usePagination} 
                  onChange={(e) => setUsePagination(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#556B2F] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full border border-gray-300"></div>
              </label>
            </div>
            {usePagination && (
              <input 
                value={paginationDetails} 
                onChange={(e) => setPaginationDetails(e.target.value)} 
                placeholder="Pagination pattern" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]" 
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleScrape} 
              disabled={isLoading || !urls.length} 
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#556B2F] text-white font-semibold rounded-lg hover:bg-[#6B8E23] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Start Scraping
                </>
              )}
            </button>
            <button 
              onClick={clearAll} 
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-lg text-gray-800">Results</h2>
                {results.length > 0 && (
                  <p className="text-sm text-gray-500">{totalJobs} opportunities found</p>
                )}
              </div>
              <div className="flex gap-2">
                {totalJobs > 0 && (
                  <>
                    <button 
                      onClick={() => downloadResults('json')} 
                      className="px-3 py-2 text-sm text-[#556B2F] bg-[#556B2F]/10 rounded-lg hover:bg-[#556B2F]/20 transition-colors flex items-center gap-1"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      JSON
                    </button>
                    <button 
                      onClick={() => downloadResults('csv')} 
                      className="px-3 py-2 text-sm text-[#556B2F] bg-[#556B2F]/10 rounded-lg hover:bg-[#556B2F]/20 transition-colors flex items-center gap-1"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      CSV
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Selection Controls */}
            {totalJobs > 0 && (
              <div className="flex items-center justify-between p-4 mb-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={selectAllJobs} 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#556B2F] transition-colors"
                  >
                    <Square2StackIcon className="h-4 w-4" />
                    Select All ({totalJobs})
                  </button>
                  <button 
                    onClick={deselectAllJobs} 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Deselect All
                  </button>
                  {selectedJobs.size > 0 && (
                    <span className="text-sm font-medium text-[#556B2F]">
                      {selectedJobs.size} selected
                    </span>
                  )}
                </div>
                {selectedJobs.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete ({selectedJobs.size})
                    </button>
                    <button
                      onClick={() => setShowExtractModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      Extract ({selectedJobs.size})
                    </button>
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#556B2F] hover:bg-[#6B8E23] rounded-lg transition-colors"
                    >
                      <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                      Save ({selectedJobs.size})
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center py-16">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#556B2F] rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">AI is analyzing the page...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !results.length && (
              <div className="text-center py-16">
                <MagnifyingGlassCircleIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">Add URLs and click Start Scraping</p>
              </div>
            )}

            {/* Results List */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {results.map((result, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Source URL Header */}
                    <div className={`flex items-center gap-3 p-4 ${result.success ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`}>
                      {result.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700 truncate flex-1">{urls[idx]}</span>
                      {result.success && (
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          {result.jobs?.length || (result.data ? 1 : 0)} found
                        </span>
                      )}
                    </div>

                    {/* Job Listings */}
                    {result.success && (
                      <div className="divide-y divide-gray-100">
                        {(result.jobs || (result.data ? [result.data] : [])).map((job, jobIdx) => {
                          const uniqueId = `${idx}-${jobIdx}-${job.title || 'untitled'}`;
                          const extractedUrl = findJobUrl(job);
                          const jobUrl = extractedUrl || urls[idx];
                          const hasDirectUrl = !!extractedUrl;
                          const isSelected = selectedJobs.has(uniqueId);
                          
                          return (
                            <div 
                              key={jobIdx} 
                              className={`p-4 transition-colors ${isSelected ? 'bg-[#556B2F]/5' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleJobSelection(uniqueId)}
                                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                    isSelected 
                                      ? 'bg-[#556B2F] border-[#556B2F] text-white' 
                                      : 'border-gray-300 hover:border-[#556B2F]'
                                  }`}
                                >
                                  {isSelected && <CheckIconSolid className="w-4 h-4" />}
                                </button>

                                {/* Job Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1">{job.title || 'Untitled'}</h4>
                                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                                    {job.company && (
                                      <span className="flex items-center gap-1">
                                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                                        {job.company}
                                      </span>
                                    )}
                                    {job.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                        {job.location}
                                      </span>
                                    )}
                                  </div>
                                  {job.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{job.description}</p>
                                  )}
                                  {/* URL Indicator */}
                                  {hasDirectUrl ? (
                                    <p className="text-xs text-green-600 truncate flex items-center gap-1">
                                      <LinkIcon className="w-3 h-3" />
                                      {jobUrl}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-orange-500 flex items-center gap-1">
                                      <ExclamationTriangleIcon className="w-3 h-3" />
                                      No direct URL - using source page
                                    </p>
                                  )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => { setSelectedJob(job); setCurrentSourceUrl(urls[idx]); setShowDescriptionModal(true); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                    View More
                                  </button>
                                  <a
                                    href={jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#556B2F] hover:bg-[#6B8E23] rounded-lg transition-colors"
                                  >
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    View Opportunity
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!result.success && (
                      <div className="p-4 text-sm text-red-600">{result.error}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Modal */}
      {showDescriptionModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDescriptionModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-[#556B2F] p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-xl font-bold mb-2">{selectedJob.title || 'Opportunity Details'}</h2>
                  <div className="flex flex-wrap gap-4 text-sm opacity-90">
                    {selectedJob.company && (
                      <span className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        {selectedJob.company}
                      </span>
                    )}
                    {selectedJob.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {selectedJob.location}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setShowDescriptionModal(false)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedJob.description || 'No description available'}</p>
              
              {selectedJob.requirements && (
                <>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6 mb-2">Requirements</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedJob.requirements}</p>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button 
                onClick={() => setShowDescriptionModal(false)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
              <a 
                href={findJobUrl(selectedJob) || currentSourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                View Opportunity
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-[#556B2F] p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Save Opportunities</h2>
                  <p className="text-sm opacity-90 mt-1">{selectedJobs.size} opportunities selected</p>
                </div>
                <button 
                  onClick={() => setShowSaveModal(false)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Opportunity Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['job', 'funding', 'training'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOpportunityType(type)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-sm capitalize transition-colors ${
                      opportunityType === type
                        ? 'border-[#556B2F] bg-[#556B2F]/10 text-[#556B2F]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">{selectedJobs.size}</strong> opportunities will be saved to the database as <strong className="text-[#556B2F] capitalize">{opportunityType}</strong> opportunities.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowSaveModal(false)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSelected}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                    Save to Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extract Modal */}
      {showExtractModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isExtracting && setShowExtractModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Extract Full Content</h2>
                  <p className="text-sm opacity-90 mt-1">{selectedJobs.size} opportunities selected</p>
                </div>
                <button 
                  onClick={() => !isExtracting && setShowExtractModal(false)} 
                  disabled={isExtracting}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Opportunity Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['job', 'funding', 'training'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => !isExtracting && setOpportunityType(type)}
                    disabled={isExtracting}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-sm capitalize transition-colors disabled:opacity-50 ${
                      opportunityType === type
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong className="text-blue-900">{selectedJobs.size}</strong> opportunities will be extracted using AI. 
                  The full content from each source URL will be saved to the database.
                </p>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This process visits each opportunity&apos;s URL and extracts detailed content. 
                  It may take a few seconds per opportunity.
                </p>
              </div>

              {isExtracting && extractionProgress.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Extracting...</span>
                    <span>{extractionProgress.current} / {extractionProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowExtractModal(false)} 
                disabled={isExtracting}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtractSelected}
                disabled={isExtracting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isExtracting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-4 h-4" />
                    Extract Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Saved Sources Tab */}
      {activeTab === 'saved-sources' && (
        <>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-lg text-gray-800">Saved Sources</h2>
                <p className="text-sm text-gray-500">Manage your saved opportunity sources</p>
              </div>
              <button
                onClick={() => {
                  setEditingSource(null);
                  setSourceForm({
                    name: '',
                    url: '',
                    description: '',
                    opportunity_type: 'job',
                    fields: DEFAULT_FIELDS,
                    use_pagination: false,
                    pagination_details: '',
                  });
                  setShowSourceModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Source
              </button>
            </div>

            {/* Sources List */}
            {isLoadingSources ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : savedSources.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">No saved sources yet</p>
                <p className="text-sm text-gray-400 mt-2">Click "Add Source" to create your first saved source</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSources.map((source) => (
                  <div
                    key={source.id}
                    className={`border rounded-lg p-4 transition-all ${
                      source.is_active
                        ? 'border-gray-200 bg-white hover:shadow-md'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{source.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{source.opportunity_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSourceActive(source)}
                          className={`p-1.5 rounded ${
                            source.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={source.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {source.is_active ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <XMarkIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 truncate mb-3" title={source.url}>
                      {source.url}
                    </p>

                    {source.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{source.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {source.fields.slice(0, 3).map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#556B2F]/10 text-[#556B2F] rounded text-xs"
                        >
                          {field}
                        </span>
                      ))}
                      {source.fields.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{source.fields.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Scraped {source.scrape_count} times</span>
                      {source.last_scraped_at && (
                        <span>
                          {new Date(source.last_scraped_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleLoadSourceToScraper(source)}
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-[#556B2F] bg-[#556B2F]/10 hover:bg-[#556B2F]/20 rounded transition-colors"
                      >
                        Load to Scraper
                      </button>
                      <button
                        onClick={() => handleEditSource(source)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      {/* Source Modal */}
      {showSourceModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSourceModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#556B2F] p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingSource ? 'Edit Source' : 'Add New Source'}
                </h2>
                <button
                  onClick={() => setShowSourceModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={sourceForm.name}
                  onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                  placeholder="e.g., UNICEF Jobs Board"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={sourceForm.url}
                  onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
                  placeholder="https://example.com/opportunities"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={sourceForm.description}
                  onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                  placeholder="Optional description of this source"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opportunity Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['job', 'funding', 'training'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSourceForm({ ...sourceForm, opportunity_type: type })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium text-sm capitalize transition-colors ${
                        sourceForm.opportunity_type === type
                          ? 'border-[#556B2F] bg-[#556B2F]/10 text-[#556B2F]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fields to Extract
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {sourceForm.fields.map((field, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#556B2F]/10 text-[#556B2F] rounded-full text-sm font-medium border border-[#556B2F]/20"
                    >
                      {field}
                      <button
                        onClick={() =>
                          setSourceForm({
                            ...sourceForm,
                            fields: sourceForm.fields.filter((_, i) => i !== idx),
                          })
                        }
                        className="hover:bg-[#556B2F]/20 rounded-full p-0.5"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && fieldInput.trim() && !sourceForm.fields.includes(fieldInput.trim())) {
                        setSourceForm({
                          ...sourceForm,
                          fields: [...sourceForm.fields, fieldInput.trim()],
                        });
                        setFieldInput('');
                      }
                    }}
                    placeholder="Add field..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]"
                  />
                  <button
                    onClick={() => {
                      if (fieldInput.trim() && !sourceForm.fields.includes(fieldInput.trim())) {
                        setSourceForm({
                          ...sourceForm,
                          fields: [...sourceForm.fields, fieldInput.trim()],
                        });
                        setFieldInput('');
                      }
                    }}
                    className="p-2.5 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Use Pagination
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sourceForm.use_pagination}
                      onChange={(e) =>
                        setSourceForm({ ...sourceForm, use_pagination: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#556B2F] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full border border-gray-300"></div>
                  </label>
                </div>
                {sourceForm.use_pagination && (
                  <input
                    type="text"
                    value={sourceForm.pagination_details}
                    onChange={(e) =>
                      setSourceForm({ ...sourceForm, pagination_details: e.target.value })
                    }
                    placeholder="Pagination pattern"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F]"
                  />
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSourceModal(false);
                  setEditingSource(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSource}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg transition-colors"
              >
                {editingSource ? 'Update Source' : 'Save Source'}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
