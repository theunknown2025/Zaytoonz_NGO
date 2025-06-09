import React from 'react';
import { getOpportunityById, type Opportunity } from '@/app/lib/opportunities';
import OpportunityDetailClient from './OpportunityDetailClient';

// Server component that fetches data dynamically
export default async function OpportunityDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
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

    // Pass the opportunity data to the client component
    return <OpportunityDetailClient opportunity={opportunity} />;
    
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