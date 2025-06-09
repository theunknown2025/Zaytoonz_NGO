import React from 'react';
import { getOpportunities, type Opportunity } from '@/app/lib/opportunities';
import EmailOpportunityClient from './EmailOpportunityClient';

// Generate static params for all email-based opportunity IDs
export async function generateStaticParams() {
  try {
    const { opportunities, error } = await getOpportunities();
    
    if (error || !opportunities) {
      console.error('Error fetching opportunities for static generation:', error);
      return [];
    }

    // Return array of params for each email-based opportunity
    return opportunities
      .filter(opportunity => opportunity.contactEmails && opportunity.contactEmails.length > 0)
      .map((opportunity) => ({
        id: opportunity.id,
      }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Server component that fetches data at build time
export default async function EmailOpportunityPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    const { opportunities, error } = await getOpportunities();
    
    if (error || !opportunities) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800">Error</h3>
                  <p className="text-red-700 mt-1">{error || 'Failed to load opportunities'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const opportunity = opportunities.find(opp => opp.id === params.id);
    
    if (!opportunity) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800">Not Found</h3>
                  <p className="text-red-700 mt-1">Opportunity not found</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Check if this opportunity has email application method
    if (!opportunity.contactEmails || opportunity.contactEmails.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-yellow-800">No Email Application</h3>
                  <p className="text-yellow-700 mt-1">This opportunity does not use email-based applications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pass the opportunity data to the client component
    return <EmailOpportunityClient opportunity={opportunity} />;
    
  } catch (error) {
    console.error('Error in EmailOpportunityPage:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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