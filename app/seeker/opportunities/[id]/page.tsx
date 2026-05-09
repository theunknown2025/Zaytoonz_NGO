import React from 'react';
import {
  getOpportunityById,
  opportunityFromExtractedRecord,
  opportunityFromScrapedRecord
} from '@/app/lib/opportunities';
import OpportunityPageWrapper from './OpportunityPageWrapper';
import LandingStyleOpportunityDetail from './LandingStyleOpportunityDetail';
import UnifiedSeekerOpportunityDetail from './UnifiedSeekerOpportunityDetail';
import { supabase } from '@/app/lib/supabase';

// Server component that fetches data dynamically
export default async function OpportunityDetailPage({ 
  params,
  searchParams
}: { 
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    // Handle extracted opportunities (full-content)
    if (params.id.startsWith('extracted_')) {
      const extractedId = params.id.replace('extracted_', '');
      const { data: extracted, error: extractedError } = await supabase
        .from('extracted_opportunity_content')
        .select(`
          *,
          ngo_profile (
            id,
            name,
            email,
            profile_image_url
          )
        `)
        .eq('id', extractedId)
        .single();

      if (extractedError || !extracted) {
        return (
          <div className="min-h-screen bg-olive-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800">Extracted opportunity not found</h3>
                <p className="text-red-700 mt-2">{extractedError?.message || 'This extracted opportunity is no longer available.'}</p>
              </div>
            </div>
          </div>
        );
      }

      const oppBase = opportunityFromExtractedRecord(extracted);
      const extractedOpportunity = {
        ...oppBase,
        description:
          (extracted as { raw_content?: string; description?: string }).raw_content ||
          (extracted as { raw_content?: string; description?: string }).description ||
          oppBase.description
      };
      const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${extractedOpportunity.id}`;

      return (
        <UnifiedSeekerOpportunityDetail
          opportunity={extractedOpportunity}
          pageUrl={pageUrl}
          applyAuthRequired={false}
          listingKind="external_feed"
          richDescription={false}
        />
      );
    }

    if (params.id.startsWith('scraped_')) {
      const scrapedId = params.id.replace('scraped_', '');

      const { data: scrapedRow, error: scrapedError } = await supabase
        .from('scraped_opportunities')
        .select(
          `
          *,
          scraped_opportunity_details (
            *
          )
        `
        )
        .eq('id', scrapedId)
        .eq('status', 'active')
        .single();

      if (scrapedError || !scrapedRow) {
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-red-800">Error</h3>
                    <p className="text-red-700 mt-1">Scraped opportunity not found or no longer available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      const scrapedOpportunity = opportunityFromScrapedRecord(scrapedRow);
      const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${scrapedOpportunity.id}`;

      return (
        <UnifiedSeekerOpportunityDetail
          opportunity={scrapedOpportunity}
          pageUrl={pageUrl}
          applyAuthRequired={false}
          listingKind="external_feed"
          richDescription
        />
      );
    }

    // Handle internal NGO opportunities
    const { opportunity, error } = await getOpportunityById(params.id);
    
    if (error || !opportunity) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800">Error</h3>
                  <p className="text-red-700 mt-1">{error || 'Failed to load opportunity'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${opportunity.id}`;

    if (opportunity.isAdminPosted) {
      return (
        <LandingStyleOpportunityDetail opportunity={opportunity} pageUrl={pageUrl} />
      );
    }

    return <OpportunityPageWrapper opportunity={opportunity} />;
    
  } catch (error) {
    console.error('Error in OpportunityDetailPage:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">An unexpected error occurred</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 