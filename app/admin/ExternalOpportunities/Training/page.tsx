"use client";

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

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
  tags: string[];
}

export default function ExternalTrainingPage() {
  const [opportunities, setOpportunities] = useState<ScrapedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/scraped-opportunities?type=training&status=${statusFilter}&limit=100`);
      
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
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/scraped-opportunities', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchOpportunities();
    } catch (err) {
      alert('Failed to update status: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training opportunity?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/scraped-opportunities?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete opportunity');
      }

      fetchOpportunities();
    } catch (err) {
      alert('Failed to delete opportunity: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">External Training Opportunities</h1>
                <p className="text-gray-600">Manage scraped training and educational opportunities</p>
              </div>
            </div>
            <button
              onClick={fetchOpportunities}
              className="px-4 py-2 bg-[#556B2F] hover:bg-[#6B8E23] text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Training</p>
                  <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                </div>
                <AcademicCapIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {opportunities.filter(o => o.status === 'active').length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {opportunities.filter(o => o.status === 'inactive').length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search training by title, provider, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading training opportunities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Error loading opportunities</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No training opportunities found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No training matches your search for "${searchTerm}"`
                : `No ${statusFilter} training opportunities available`
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
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {opportunity.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                            <span>Scraped {formatDate(opportunity.scraped_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                          {opportunity.status}
                        </span>
                      </div>
                    </div>

                    {opportunity.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {opportunity.description.length > 200 
                          ? opportunity.description.substring(0, 200) + '...'
                          : opportunity.description
                        }
                      </p>
                    )}

                    {opportunity.hours && (
                      <div className="mb-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          Duration: {opportunity.hours}
                        </span>
                      </div>
                    )}

                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {opportunity.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {opportunity.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{opportunity.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <a
                        href={opportunity.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#556B2F] hover:text-[#6B8E23] text-sm font-medium flex items-center space-x-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>View Original</span>
                      </a>

                      <div className="flex items-center space-x-2">
                        <select
                          value={opportunity.status}
                          onChange={(e) => handleStatusChange(opportunity.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>

                        <button
                          onClick={() => handleDelete(opportunity.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 