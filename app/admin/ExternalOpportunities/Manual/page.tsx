'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'react-hot-toast';

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  location?: string;
  hours?: string;
  opportunity_type: 'job' | 'funding' | 'training';
  created_at: string;
  updated_at: string;
  status?: string;
}

export default function ManualOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'funding' | 'training'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'completed'>('all');

  useEffect(() => {
    loadOpportunities();
  }, [typeFilter, statusFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      // First, get all opportunities
      let query = supabase
        .from('opportunities')
        .select(`
          id,
          title,
          opportunity_type,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.eq('opportunity_type', typeFilter);
      }

      const { data: opportunitiesData, error: oppError } = await query;

      if (oppError) {
        console.error('Error loading opportunities:', oppError);
        toast.error('Failed to load opportunities');
        return;
      }

      if (!opportunitiesData || opportunitiesData.length === 0) {
        setOpportunities([]);
        setLoading(false);
        return;
      }

      // Get all opportunity IDs
      const opportunityIds = opportunitiesData.map(opp => opp.id);

      // Fetch descriptions for all opportunities
      const { data: descriptionsData, error: descError } = await supabase
        .from('opportunity_description')
        .select('opportunity_id, description, location, hours, status')
        .in('opportunity_id', opportunityIds);

      if (descError) {
        console.error('Error loading descriptions:', descError);
        // Continue without descriptions
      }

      // Create a map of opportunity_id to description
      const descriptionMap = new Map();
      if (descriptionsData) {
        descriptionsData.forEach((desc: any) => {
          if (desc.opportunity_id) {
            descriptionMap.set(desc.opportunity_id, desc);
          }
        });
      }

      // Transform data to include description details
      const transformedData = opportunitiesData.map((opp: any) => {
        const desc = descriptionMap.get(opp.id);
        return {
          id: opp.id,
          title: opp.title,
          description: desc?.description || '',
          location: desc?.location || '',
          hours: desc?.hours || '',
          opportunity_type: opp.opportunity_type,
          created_at: opp.created_at,
          updated_at: opp.updated_at,
          status: desc?.status || 'draft'
        };
      });

      // Apply status filter
      let filteredData = transformedData;
      if (statusFilter !== 'all') {
        filteredData = transformedData.filter((opp: Opportunity) => opp.status === statusFilter);
      }

      setOpportunities(filteredData);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      toast.error('An error occurred while loading opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from opportunity_description first (if exists)
      await supabase
        .from('opportunity_description')
        .delete()
        .eq('opportunity_id', id);

      // Delete from opportunities
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting opportunity:', error);
        toast.error('Failed to delete opportunity');
        return;
      }

      toast.success('Opportunity deleted successfully');
      loadOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('An error occurred while deleting the opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800';
      case 'funding':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-lg">
                <PencilIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manual Opportunities</h1>
                <p className="text-gray-600">Create and manage opportunities manually</p>
              </div>
            </div>
            <Link
              href="/admin/ExternalOpportunities/Manual/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New Opportunity
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm"
                />
              </div>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10"
              >
                <option value="all">All Types</option>
                <option value="job">Jobs</option>
                <option value="funding">Funding</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#556B2F] border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading opportunities...</span>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <PencilIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No opportunities found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new opportunity'}
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/admin/ExternalOpportunities/Manual/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Opportunity
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(opportunity.opportunity_type)}`}>
                        {opportunity.opportunity_type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(opportunity.status || 'draft')}`}>
                        {opportunity.status || 'draft'}
                      </span>
                    </div>
                    {opportunity.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: opportunity.description.substring(0, 200) + '...' }} />
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {opportunity.location && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {opportunity.location}
                        </span>
                      )}
                      {opportunity.hours && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {opportunity.hours}
                        </span>
                      )}
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(opportunity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/admin/ExternalOpportunities/Manual/${opportunity.id}`}
                      className="p-2 text-gray-400 hover:text-[#556B2F] transition-colors"
                      title="View"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/admin/ExternalOpportunities/Manual/edit/${opportunity.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(opportunity.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
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
