'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'react-hot-toast';
import { getOpportunityById, type Opportunity } from '@/app/lib/opportunities';
import LandingStyleOpportunityDetail from '@/app/seeker/opportunities/[id]/LandingStyleOpportunityDetail';
import OpportunityPageWrapper from '@/app/seeker/opportunities/[id]/OpportunityPageWrapper';

export default function ViewManualOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId]);

  const loadOpportunity = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { opportunity: opp, error } = await getOpportunityById(opportunityId);
      if (error || !opp) {
        console.error('Error loading opportunity:', error);
        setLoadError(error || 'Opportunity not found');
        setOpportunity(null);
        return;
      }
      setOpportunity(opp);
    } catch (error) {
      console.error('Error loading opportunity:', error);
      setLoadError('An error occurred while loading the opportunity');
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
      await supabase
        .from('opportunity_description')
        .delete()
        .eq('opportunity_id', opportunityId);

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
            <p className="mt-2 text-sm text-gray-500">
              {loadError || "The opportunity you're looking for doesn't exist or has been deleted."}
            </p>
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

  const pageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/seeker/opportunities/${opportunity.id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${opportunity.id}`;

  return (
    <div className="min-h-screen bg-olive-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <Link
            href="/admin/ExternalOpportunities/Manual"
            className="inline-flex items-center text-sm text-olive-700 hover:text-olive-900"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Link>
          <div className="flex items-center gap-2">
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

      {opportunity.isAdminPosted ? (
        <LandingStyleOpportunityDetail
          opportunity={opportunity}
          pageUrl={pageUrl}
          ngoPageId={opportunity.organizationProfile?.id ?? opportunity.ngoProfileId ?? null}
          audience="seeker"
        />
      ) : (
        <OpportunityPageWrapper
          opportunity={opportunity}
          ngoPageId={opportunity.organizationProfile?.id ?? opportunity.ngoProfileId ?? null}
          audience="seeker"
        />
      )}
    </div>
  );
}
