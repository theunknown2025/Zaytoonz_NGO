import React from 'react';
import { getOpportunityById, type Opportunity } from '@/app/lib/opportunities';
import OpportunityPageWrapper from './OpportunityPageWrapper';
import { supabase } from '@/app/lib/supabase';
import { redirect } from 'next/navigation';

// Server component that fetches data dynamically
export default async function OpportunityDetailPage({ 
  params,
  searchParams
}: { 
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    // Check if this is a scraped opportunity (starts with "scraped_")
    if (params.id.startsWith('scraped_')) {
      // Extract the actual scraped opportunity ID
      const scrapedId = params.id.replace('scraped_', '');
      
      // Fetch the scraped opportunity to get its source URL
      const { data: scrapedOpportunity, error: scrapedError } = await supabase
        .from('scraped_opportunities')
        .select(`
          source_url,
          scraped_opportunity_details (
            metadata
          )
        `)
        .eq('id', scrapedId)
        .eq('status', 'active')
        .single();

      if (scrapedError || !scrapedOpportunity) {
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

      // Get the specific opportunity URL from metadata.link, fallback to source_url
      const details = scrapedOpportunity.scraped_opportunity_details?.[0];
      const specificUrl = details?.metadata?.link || scrapedOpportunity.source_url;

      // Redirect to the specific opportunity URL
      redirect(specificUrl);
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

    // Pass the opportunity to the client wrapper component
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