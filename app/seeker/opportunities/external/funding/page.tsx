"use client";

import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
  salary_range: string;
  tags: string[];
}

export default function ExternalFundingPage() {
  const [opportunities, setOpportunities] = useState<ScrapedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<ScrapedOpportunity | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/scraped-opportunities?type=funding&status=active&limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }

      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link 
                href="/seeker/opportunities/external"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Funding Opportunities</h1>
                <p className="text-gray-600">Discover grants and funding programs for your projects</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Funding</p>
                  <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Now</p>
                  <p className="text-2xl font-bold text-green-600">{opportunities.length}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Organizations</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(opportunities.map(o => o.company).filter(Boolean)).size}
                  </p>
                </div>
                <BuildingOfficeIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search funding by title, organization, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading funding opportunities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-700 font-medium">Error loading opportunities</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No funding opportunities found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No funding matches your search for "${searchTerm}"`
                : 'No funding opportunities are currently available'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#556B2F] transition-colors cursor-pointer">
                          {opportunity.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          {opportunity.company && (
                            <div className="flex items-center space-x-1">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span>{opportunity.company}</span>
                            </div>
                          )}
                          {opportunity.location && (
                            <div className="flex items-center space-x-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{opportunity.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Added {timeAgo(opportunity.scraped_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {opportunity.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {opportunity.description.length > 300 
                          ? opportunity.description.substring(0, 300) + '...'
                          : opportunity.description
                        }
                      </p>
                    )}

                    {opportunity.salary_range && (
                      <div className="mb-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          💰 {opportunity.salary_range}
                        </span>
                      </div>
                    )}

                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.tags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {opportunity.tags.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{opportunity.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setShowDetails(true);
                        }}
                        className="px-4 py-2 bg-[#556B2F] hover:bg-[#6B8E23] text-white text-sm rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </button>

                      <a
                        href={opportunity.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#556B2F] hover:text-[#6B8E23] text-sm font-medium flex items-center space-x-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Apply Now</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedOpportunity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Funding Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedOpportunity.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {selectedOpportunity.company && (
                      <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{selectedOpportunity.company}</span>
                      </div>
                    )}
                    {selectedOpportunity.location && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{selectedOpportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Added {formatDate(selectedOpportunity.scraped_at)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedOpportunity.description && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedOpportunity.description}</p>
                    </div>
                  </div>
                )}

                {selectedOpportunity.salary_range && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Funding Amount</h4>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full">
                      💰 {selectedOpportunity.salary_range}
                    </span>
                  </div>
                )}

                {selectedOpportunity.tags && selectedOpportunity.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Categories & Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpportunity.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <a
                    href={selectedOpportunity.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg transition-colors duration-200 text-center"
                  >
                    Apply for Funding
                  </a>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 