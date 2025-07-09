"use client";

import React, { useState, useEffect } from 'react';
import { 
  BriefcaseIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NGOOpportunity {
  id: string;
  title: string;
  category: string;
  location: string;
  created_at: string;
  description: string;
  description_title?: string;
  deadline?: string;
  hours?: string;
  organization?: {
    name: string;
    logo?: string;
  };
  source: 'ngo';
}

interface ScrapedOpportunity {
  id: string;
  title: string;
  opportunity_type: string;
  source_url: string;
  status: string;
  scraped_at: string;
  description: string;
  location: string;
  company: string;
  hours: string;
  salary_range: string;
  tags: string[];
  link?: string;
  source: 'scraped';
}

type UnifiedOpportunity = NGOOpportunity | ScrapedOpportunity;

export default function UnifiedJobsPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<UnifiedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<UnifiedOpportunity | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<'all' | 'ngo' | 'scraped'>('all');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch NGO opportunities
      const ngoResponse = await fetch('/api/opportunities?category=job');
      let ngoOpportunities: NGOOpportunity[] = [];
      
      if (ngoResponse.ok) {
        const ngoData = await ngoResponse.json();
        ngoOpportunities = (ngoData.opportunities || []).map((opp: any) => ({
          ...opp,
          source: 'ngo' as const
        }));
      }

      // Fetch scraped opportunities
      const scrapedResponse = await fetch('/api/admin/scraped-opportunities?type=job&status=active&limit=100');
      let scrapedOpportunities: ScrapedOpportunity[] = [];
      
      if (scrapedResponse.ok) {
        const scrapedData = await scrapedResponse.json();
        scrapedOpportunities = (scrapedData.opportunities || []).map((opp: any) => ({
          ...opp,
          source: 'scraped' as const,
          link: opp.metadata?.link || opp.source_url
        }));
      }

      // Combine and sort opportunities
      const allOpportunities = [...ngoOpportunities, ...scrapedOpportunities];
      
      // Sort by date (most recent first)
      allOpportunities.sort((a, b) => {
        const dateA = new Date(a.source === 'ngo' ? a.created_at : a.scraped_at);
        const dateB = new Date(b.source === 'ngo' ? b.created_at : b.scraped_at);
        return dateB.getTime() - dateA.getTime();
      });

      setOpportunities(allOpportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.source === 'ngo' && opp.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.source === 'scraped' && opp.company?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === 'all' || opp.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return formatDate(dateString);
  };

  const handleOpportunityClick = (opportunity: UnifiedOpportunity) => {
    if (opportunity.source === 'ngo') {
      router.push(`/seeker/opportunities/${opportunity.id}`);
    } else {
      setSelectedOpportunity(opportunity);
      setShowDetails(true);
    }
  };

  const toggleSaveOpportunity = (opportunityId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSavedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opportunityId)) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });
  };

  const getSourceBadge = (source: string) => {
    if (source === 'ngo') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Partner NGO
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          External
        </span>
      );
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', text: 'Expired', color: 'text-red-600 bg-red-50' };
    } else if (diffDays <= 3) {
      return { type: 'urgent', text: `${diffDays} days left`, color: 'text-orange-600 bg-orange-50' };
    } else if (diffDays <= 7) {
      return { type: 'soon', text: `${diffDays} days left`, color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { type: 'normal', text: `${diffDays} days left`, color: 'text-green-600 bg-green-50' };
    }
  };

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    const plainText = stripHtmlTags(text);
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  const ngoCount = opportunities.filter(opp => opp.source === 'ngo').length;
  const scrapedCount = opportunities.filter(opp => opp.source === 'scraped').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link 
                href="/seeker/opportunities/navigate"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
                <p className="text-gray-600">All available job opportunities from NGO partners and external sources</p>
              </div>
            </div>
            <button
              onClick={fetchOpportunities}
              className="px-4 py-2 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                </div>
                <BriefcaseIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NGO Partners</p>
                  <p className="text-2xl font-bold text-green-600">{ngoCount}</p>
                </div>
                <UserIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">External Sources</p>
                  <p className="text-2xl font-bold text-blue-600">{scrapedCount}</p>
                </div>
                <LinkIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set([
                      ...opportunities.filter(o => o.source === 'ngo').map(o => o.organization?.name).filter(Boolean),
                      ...opportunities.filter(o => o.source === 'scraped').map(o => o.company).filter(Boolean)
                    ]).size}
                  </p>
                </div>
                <BuildingOfficeIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as 'all' | 'ngo' | 'scraped')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="ngo">NGO Partners</option>
                <option value="scraped">External</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job opportunities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Error loading opportunities</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job opportunities found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No jobs match your search for "${searchTerm}"`
                : 'No job opportunities are currently available'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <div 
                key={opportunity.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50"
                onClick={() => handleOpportunityClick(opportunity)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Main Info */}
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    {/* Organization Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{opportunity.title}</h3>
                        {getSourceBadge(opportunity.source)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>
                            {opportunity.source === 'ngo' 
                              ? opportunity.organization?.name || 'NGO Partner'
                              : opportunity.company || 'External Company'
                            }
                          </span>
                        </div>
                        {opportunity.location && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{opportunity.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{timeAgo(opportunity.source === 'ngo' ? opportunity.created_at : opportunity.scraped_at)}</span>
                        </div>
                        {opportunity.source === 'ngo' && opportunity.hours && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{opportunity.hours}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {truncateText(opportunity.description)}
                      </p>

                      {/* Tags for scraped opportunities */}
                      {opportunity.source === 'scraped' && opportunity.tags && opportunity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {opportunity.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {opportunity.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{opportunity.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-3">
                    {opportunity.source === 'ngo' && opportunity.deadline && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDeadlineStatus(opportunity.deadline)?.color}`}>
                        {getDeadlineStatus(opportunity.deadline)?.text}
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => toggleSaveOpportunity(opportunity.id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      {savedOpportunities.has(opportunity.id) ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                    </button>
                    
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for scraped opportunity details */}
        {showDetails && selectedOpportunity && selectedOpportunity.source === 'scraped' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedOpportunity.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{selectedOpportunity.company}</span>
                      </div>
                      {selectedOpportunity.location && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{selectedOpportunity.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                    <div className="text-gray-700 prose max-w-none">
                      {selectedOpportunity.description || 'No description available'}
                    </div>
                  </div>

                  {selectedOpportunity.hours && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Working Hours</h3>
                      <p className="text-gray-700">{selectedOpportunity.hours}</p>
                    </div>
                  )}

                  {selectedOpportunity.salary_range && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Salary Range</h3>
                      <p className="text-gray-700">{selectedOpportunity.salary_range}</p>
                    </div>
                  )}

                  {selectedOpportunity.tags && selectedOpportunity.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpportunity.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <a
                      href={selectedOpportunity.link || selectedOpportunity.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#556B2F] hover:bg-[#6B8E23] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <LinkIcon className="w-5 h-5" />
                      Apply Now
                    </a>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 