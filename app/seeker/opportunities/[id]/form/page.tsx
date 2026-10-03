import React from 'react';
import { getOpportunityById } from '@/app/lib/opportunities';
import FormOpportunityClient from './FormOpportunityClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FormOpportunityPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const { opportunity, error } = await getOpportunityById(params.id);

    if (error || !opportunity) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error || 'Opportunity not found'}</p>
            </div>
          </div>
        </div>
      );
    }

    const sections = opportunity.applicationForm?.form_structure;
    const hasForm = Array.isArray(sections) ? sections.length > 0 : Boolean(sections);

    if (!opportunity.applicationForm || !hasForm) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-medium text-yellow-800">No application form</h3>
              <p className="text-yellow-700 mt-1">
                This opportunity does not have an application form yet.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <FormOpportunityClient opportunity={opportunity} />;
  } catch (error) {
    console.error('Error in FormOpportunityPage:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-700 mt-1">An unexpected error occurred</p>
          </div>
        </div>
      </div>
    );
  }
}
