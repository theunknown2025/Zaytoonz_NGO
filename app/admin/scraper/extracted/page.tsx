'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface ExtractedOpportunity {
  id: string;
  title: string;
  opportunity_type: 'job' | 'funding' | 'training';
  source_url: string;
  description: string | null;
  company: string | null;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  deadline: string | null;
  requirements: string | null;
  benefits: string | null;
  responsibilities: string | null;
  qualifications: string | null;
  application_instructions: string | null;
  contact_info: string | null;
  raw_content: string | null;
  structured_content: Record<string, unknown> | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extraction_error: string | null;
  extracted_at: string | null;
  model_used: string | null;
  extraction_cost: number | null;
  created_at: string;
  updated_at: string;
}

export default function ExtractedOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ExtractedOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;
  
  // Selected opportunity for detail view
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExtractedOpportunity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', itemsPerPage.toString());
      params.set('offset', ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/admin/extract-opportunity?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setOpportunities(result.data || []);
        setTotalCount(result.total || 0);
      } else {
        setError(result.error || 'Failed to fetch opportunities');
      }
    } catch (err) {
      setError('Failed to fetch opportunities: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/extract-opportunity/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuccessMessage('Opportunity deleted successfully');
        setDeleteId(null);
        fetchOpportunities();
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete opportunity');
      }
    } catch (err) {
      setError('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      opp.title.toLowerCase().includes(query) ||
      opp.company?.toLowerCase().includes(query) ||
      opp.location?.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      job: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      funding: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      training: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get content preview (first 200 chars of description or raw_content)
  const getContentPreview = (opp: ExtractedOpportunity) => {
    // Try description first, then raw_content, then check structured_content
    let content = opp.description || opp.raw_content || '';
    
    // If no content, try to extract from structured_content
    if (!content && opp.structured_content) {
      const sc = opp.structured_content as Record<string, unknown>;
      content = (sc.description || sc.full_description || sc.job_details || sc.content || '') as string;
    }
    
    if (!content) return '';
    if (content.length <= 200) return content;
    return content.substring(0, 200) + '...';
  };
  
  // Get full content for display
  const getFullContent = (opp: ExtractedOpportunity) => {
    // Prefer raw_content as it's the combined content, then description
    let content = opp.raw_content || opp.description || '';
    
    // If no content, try to extract from structured_content
    if (!content && opp.structured_content) {
      const sc = opp.structured_content as Record<string, unknown>;
      content = (sc.description || sc.full_description || sc.job_details || sc.content || '') as string;
    }
    
    return content;
  };
  
  // Get content word count
  const getContentWordCount = (opp: ExtractedOpportunity) => {
    const content = getFullContent(opp);
    if (!content) return 0;
    return content.split(/\s+/).filter(word => word.length > 0).length;
  };
  
  // Check if has any content
  const hasContent = (opp: ExtractedOpportunity) => {
    return !!(opp.description || opp.raw_content || opp.requirements || opp.responsibilities);
  };

  // Check if opportunity has main info
  const hasMainInfo = (opp: ExtractedOpportunity) => {
    return opp.location || opp.salary_range || opp.job_type || opp.company || opp.deadline;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Extracted Opportunities</h1>
              <p className="text-gray-500 text-sm">Full content extracted from opportunity detail pages</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/Scraper"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Scraper
            </a>
            <button
              onClick={fetchOpportunities}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="job">Jobs</option>
                <option value="funding">Funding</option>
                <option value="training">Training</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="ml-auto p-1 hover:bg-green-100 rounded">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading extracted opportunities...</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-16">
              <DocumentTextIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">No extracted opportunities found</p>
              <p className="text-sm text-gray-400 mt-1">Extract opportunities from the Scraper page</p>
            </div>
          ) : (
            <>
              {/* Table with new structure: Title | URL | Main Info | Content | Actions */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[200px]">Title</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[180px]">URL</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[280px]">Main Information</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOpportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                        {/* Title Column */}
                        <td className="px-4 py-4 align-top">
                          <div className="max-w-[200px]">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{opp.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getTypeBadge(opp.opportunity_type)}`}>
                                {opp.opportunity_type}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getStatusBadge(opp.extraction_status)}`}>
                                {opp.extraction_status}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* URL Column */}
                        <td className="px-4 py-4 align-top">
                          <div className="max-w-[180px]">
                            <a
                              href={opp.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm break-all line-clamp-2 flex items-start gap-1"
                            >
                              <LinkIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span className="break-all">{opp.source_url.replace(/^https?:\/\//, '').slice(0, 40)}...</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(opp.source_url)}
                              className="mt-1 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            >
                              <ClipboardDocumentIcon className="h-3 w-3" />
                              Copy URL
                            </button>
                          </div>
                        </td>
                        
                        {/* Main Information Column */}
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1.5 text-sm max-w-[280px]">
                            {opp.company && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{opp.company}</span>
                              </div>
                            )}
                            {opp.location && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{opp.location}</span>
                              </div>
                            )}
                            {opp.salary_range && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{opp.salary_range}</span>
                              </div>
                            )}
                            {opp.job_type && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{opp.job_type}</span>
                              </div>
                            )}
                            {opp.deadline && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span>{new Date(opp.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                            {!hasMainInfo(opp) && (
                              <span className="text-gray-400 text-xs italic">No main info extracted</span>
                            )}
                          </div>
                        </td>
                        
                        {/* Content Column */}
                        <td className="px-4 py-4 align-top">
                          <div className="max-w-full">
                            {opp.extraction_status === 'failed' ? (
                              <div className="text-red-600 text-sm">
                                <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                                {opp.extraction_error || 'Extraction failed'}
                              </div>
                            ) : (
                              <>
                                {hasContent(opp) ? (
                                  <>
                                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                      {getContentPreview(opp)}
                                    </p>
                                    <div className="mt-2 flex items-center gap-3">
                                      {getContentWordCount(opp) > 0 && (
                                        <span className="text-xs text-gray-400">
                                          {getContentWordCount(opp).toLocaleString()} words
                                        </span>
                                      )}
                                      <button
                                        onClick={() => { setSelectedOpportunity(opp); setShowDetailModal(true); }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                      >
                                        <EyeIcon className="h-4 w-4" />
                                        View Full Content
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <span className="italic text-gray-400 text-sm">No content extracted</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        
                        {/* Actions Column */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start justify-end gap-1">
                            <button
                              onClick={() => { setSelectedOpportunity(opp); setShowDetailModal(true); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <a
                              href={opp.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Open Source URL"
                            >
                              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                            </a>
                            <button
                              onClick={() => setDeleteId(opp.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal - Full Content View */}
      {showDetailModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border capitalize bg-white/20 border-white/30`}>
                      {selectedOpportunity.opportunity_type}
                    </span>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border capitalize bg-white/20 border-white/30`}>
                      {selectedOpportunity.extraction_status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{selectedOpportunity.title}</h2>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* URL */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-1 min-w-0">
                    <LinkIcon className="h-4 w-4 flex-shrink-0" />
                    <a 
                      href={selectedOpportunity.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {selectedOpportunity.source_url}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedOpportunity.source_url)}
                    className="ml-2 p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Information Summary */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                {selectedOpportunity.company && (
                  <div>
                    <span className="text-xs text-blue-600 font-medium uppercase">Company</span>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      {selectedOpportunity.company}
                    </p>
                  </div>
                )}
                {selectedOpportunity.location && (
                  <div>
                    <span className="text-xs text-blue-600 font-medium uppercase">Location</span>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      {selectedOpportunity.location}
                    </p>
                  </div>
                )}
                {selectedOpportunity.salary_range && (
                  <div>
                    <span className="text-xs text-blue-600 font-medium uppercase">Salary</span>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      {selectedOpportunity.salary_range}
                    </p>
                  </div>
                )}
                {selectedOpportunity.job_type && (
                  <div>
                    <span className="text-xs text-blue-600 font-medium uppercase">Contract Type</span>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                      {selectedOpportunity.job_type}
                    </p>
                  </div>
                )}
                {selectedOpportunity.deadline && (
                  <div>
                    <span className="text-xs text-blue-600 font-medium uppercase">Deadline</span>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {new Date(selectedOpportunity.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Full Content Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    Full Extracted Content
                  </h3>
                  {hasContent(selectedOpportunity) && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {getContentWordCount(selectedOpportunity).toLocaleString()} words
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto">
                  {hasContent(selectedOpportunity) ? (
                    <div className="divide-y divide-gray-200">
                      {/* Description */}
                      {selectedOpportunity.description && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Description</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.description}</p>
                        </div>
                      )}

                      {/* Responsibilities */}
                      {selectedOpportunity.responsibilities && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Responsibilities / Scope of Work</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.responsibilities}</p>
                        </div>
                      )}

                      {/* Requirements */}
                      {selectedOpportunity.requirements && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Requirements</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.requirements}</p>
                        </div>
                      )}

                      {/* Qualifications */}
                      {selectedOpportunity.qualifications && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Qualifications</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.qualifications}</p>
                        </div>
                      )}

                      {/* Benefits */}
                      {selectedOpportunity.benefits && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Benefits</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.benefits}</p>
                        </div>
                      )}

                      {/* Application Instructions */}
                      {selectedOpportunity.application_instructions && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">How to Apply</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.application_instructions}</p>
                        </div>
                      )}

                      {/* Contact Info */}
                      {selectedOpportunity.contact_info && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Contact Information</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.contact_info}</p>
                        </div>
                      )}

                      {/* Raw Content (combined) - show if no individual sections but has raw_content */}
                      {selectedOpportunity.raw_content && !selectedOpportunity.description && !selectedOpportunity.responsibilities && (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Full Content</h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedOpportunity.raw_content}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-gray-400 italic">No content extracted</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Extraction Error */}
              {selectedOpportunity.extraction_status === 'failed' && selectedOpportunity.extraction_error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Extraction Error</h3>
                  <p className="text-sm text-red-700">{selectedOpportunity.extraction_error}</p>
                </div>
              )}

              {/* Extraction Metadata */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Extraction Info</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <p className="font-medium text-gray-700">{selectedOpportunity.model_used || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Extracted:</span>
                    <p className="font-medium text-gray-700">
                      {selectedOpportunity.extracted_at 
                        ? new Date(selectedOpportunity.extracted_at).toLocaleString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost:</span>
                    <p className="font-medium text-gray-700">
                      {selectedOpportunity.extraction_cost 
                        ? `$${selectedOpportunity.extraction_cost.toFixed(6)}` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const content = getFullContent(selectedOpportunity);
                    copyToClipboard(content);
                  }}
                  disabled={!selectedOpportunity.raw_content && !selectedOpportunity.description}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy Full Content
                </button>
                <a 
                  href={selectedOpportunity.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  View Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isDeleting && setDeleteId(null)}>
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Opportunity</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600">
                Are you sure you want to delete this extracted opportunity? All extracted content will be permanently removed.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
