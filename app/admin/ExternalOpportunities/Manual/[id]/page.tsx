'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'react-hot-toast';

interface OpportunityData {
  id: string;
  title: string;
  description: string;
  location?: string;
  hours?: string;
  opportunity_type: 'job' | 'funding' | 'training';
  created_at: string;
  updated_at: string;
  status?: string;
  criteria?: {
    contractType?: string;
    level?: string;
    sector?: string;
    location?: string;
    fundingType?: string;
    eligibility?: string;
    amountRange?: string;
    purpose?: string;
    format?: string;
    duration?: string;
    certification?: string;
    cost?: string;
    deadline?: string;
    customFilters?: { [key: string]: string };
  };
}

export default function ViewManualOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;
  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId]);

  const loadOpportunity = async () => {
    setLoading(true);
    try {
      // Get opportunity
      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title, opportunity_type, created_at, updated_at')
        .eq('id', opportunityId)
        .single();

      if (oppError || !oppData) {
        console.error('Error loading opportunity:', oppError);
        toast.error('Failed to load opportunity');
        return;
      }

      // Get description
      const { data: descData, error: descError } = await supabase
        .from('opportunity_description')
        .select('description, location, hours, status, criteria')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();

      if (descError && descError.code !== 'PGRST116') {
        console.error('Error loading description:', descError);
      }

      setOpportunity({
        id: oppData.id,
        title: oppData.title,
        description: descData?.description || '',
        location: descData?.location || '',
        hours: descData?.hours || '',
        opportunity_type: oppData.opportunity_type as 'job' | 'funding' | 'training',
        created_at: oppData.created_at,
        updated_at: oppData.updated_at,
        status: descData?.status || 'draft',
        criteria: descData?.criteria || {}
      });
    } catch (error) {
      console.error('Error loading opportunity:', error);
      toast.error('An error occurred while loading the opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      // Delete from opportunity_description first (if exists)
      await supabase
        .from('opportunity_description')
        .delete()
        .eq('opportunity_id', opportunityId);

      // Delete from opportunities
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) {
        console.error('Error deleting opportunity:', error);
        toast.error('Failed to delete opportunity');
        return;
      }

      toast.success('Opportunity deleted successfully');
      router.push('/admin/ExternalOpportunities/Manual');
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('An error occurred while deleting the opportunity');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <BriefcaseIcon className="w-5 h-5" />;
      case 'funding':
        return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'training':
        return <AcademicCapIcon className="w-5 h-5" />;
      default:
        return <BriefcaseIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'funding':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'training':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#556B2F] border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading opportunity...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">Opportunity not found</h3>
            <p className="mt-2 text-sm text-gray-500">The opportunity you're looking for doesn't exist or has been deleted.</p>
            <Link
              href="/admin/ExternalOpportunities/Manual"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/ExternalOpportunities/Manual"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#556B2F] mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(opportunity.opportunity_type)}`}>
                  <span className="mr-1">{getTypeIcon(opportunity.opportunity_type)}</span>
                  {opportunity.opportunity_type}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(opportunity.status || 'draft')}`}>
                  {opportunity.status || 'draft'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Created: {new Date(opportunity.created_at).toLocaleDateString()}
                </span>
                {opportunity.updated_at !== opportunity.created_at && (
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Updated: {new Date(opportunity.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/ExternalOpportunities/Manual/edit/${opportunity.id}`}
                className="inline-flex items-center px-4 py-2 border border-[#556B2F] text-sm font-medium rounded-md shadow-sm text-[#556B2F] bg-white hover:bg-[#556B2F]/5 transition-all duration-200"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunity.location && (
                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{opportunity.location}</p>
                  </div>
                </div>
              )}
              {opportunity.hours && (
                <div className="flex items-start">
                  <ClockIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hours / Time Commitment</p>
                    <p className="text-sm text-gray-600">{opportunity.hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Criteria */}
          {opportunity.criteria && Object.keys(opportunity.criteria).length > 0 && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Criteria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(opportunity.criteria).map(([key, value]) => {
                  if (!value || key === 'customFilters') return null;
                  
                  const label = key === 'contractType' ? 'Contract Type' :
                               key === 'level' ? 'Level' :
                               key === 'sector' ? 'Sector/Industry' :
                               key === 'location' ? 'Location' :
                               key === 'fundingType' ? 'Type' :
                               key === 'eligibility' ? 'Eligibility' :
                               key === 'amountRange' ? 'Amount Range' :
                               key === 'purpose' ? 'Purpose' :
                               key === 'format' ? 'Format' :
                               key === 'duration' ? 'Duration' :
                               key === 'certification' ? 'Certification' :
                               key === 'cost' ? 'Cost' :
                               key === 'deadline' ? 'Deadline' :
                               key;
                  
                  return (
                    <div key={key} className="flex items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{label}</p>
                        <p className="text-sm text-gray-600">{String(value)}</p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Custom Filters */}
                {opportunity.criteria.customFilters && Object.keys(opportunity.criteria.customFilters).length > 0 && (
                  <>
                    {Object.entries(opportunity.criteria.customFilters).map(([filterName, filterValue]) => (
                      <div key={`custom-${filterName}`} className="flex items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{filterName}</p>
                          <p className="text-sm text-gray-600">{String(filterValue)}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: opportunity.description || '<p class="text-gray-400 italic">No description provided.</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
