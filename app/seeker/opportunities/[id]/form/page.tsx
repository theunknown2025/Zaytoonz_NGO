import React from 'react';
import { getOpportunities, type Opportunity } from '@/app/lib/opportunities';
import FormOpportunityClient from './FormOpportunityClient';

// Generate static params for all form-based opportunity IDs
export async function generateStaticParams() {
  try {
    const { opportunities, error } = await getOpportunities();
    
    if (error || !opportunities) {
      console.error('Error fetching opportunities for static generation:', error);
      return [];
    }

    console.log('Total opportunities:', opportunities.length);
    
    // Debug: Log all opportunities with their applicationForm status
    opportunities.forEach(opp => {
      console.log(`Opportunity ${opp.id}:`, {
        title: opp.title,
        hasApplicationForm: !!opp.applicationForm,
        hasFormStructure: !!opp.applicationForm?.form_structure,
        formStructureLength: opp.applicationForm?.form_structure?.length || 0
      });
    });

    // Return array of params for each form-based opportunity
    const formOpportunities = opportunities
      .filter(opportunity => 
        opportunity.applicationForm && 
        opportunity.applicationForm.form_structure && 
        opportunity.applicationForm.form_structure.length > 0
      );
    
    console.log('Form-based opportunities:', formOpportunities.length);
    
    return formOpportunities.map((opportunity) => ({
      id: opportunity.id,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Server component that fetches data at build time
export default async function FormOpportunityPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    const { opportunities, error } = await getOpportunities();
    
    if (error || !opportunities) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

    // Check if this opportunity has form application method
    if (!opportunity.applicationForm || !opportunity.applicationForm.form_structure || opportunity.applicationForm.form_structure.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-yellow-800">No Form Application</h3>
                  <p className="text-yellow-700 mt-1">This opportunity does not use form-based applications</p>
                  <div className="mt-3 text-sm text-yellow-600">
                    <p>Debug: Application Form: {opportunity.applicationForm ? 'Present' : 'Missing'}</p>
                    <p>Debug: Form Structure: {opportunity.applicationForm?.form_structure ? 'Present' : 'Missing'}</p>
                    <p>Debug: Structure Length: {opportunity.applicationForm?.form_structure?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pass the opportunity data to the client component
    return <FormOpportunityClient opportunity={opportunity} />;
    
  } catch (error) {
    console.error('Error in FormOpportunityPage:', error);
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