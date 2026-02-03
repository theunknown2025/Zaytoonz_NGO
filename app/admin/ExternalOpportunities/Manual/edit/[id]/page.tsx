'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AdminOpportunityDescription from '../../components/AdminOpportunityDescription';
import { getAdminOpportunityProgress, saveAdminOpportunity, createAdminOpportunity } from '../../services/adminOpportunityService';
import { supabase } from '@/app/lib/supabase';

interface OpportunityFormData {
  title: string;
  description: string;
  location: string;
  hours: string;
  opportunityType: 'job' | 'funding' | 'training' | '';
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

export default function EditManualOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opportunityType, setOpportunityType] = useState<'job' | 'funding' | 'training' | ''>('');
  
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    location: '',
    hours: '',
    opportunityType: '',
    criteria: {}
  });

  // Load existing opportunity data
  useEffect(() => {
    if (opportunityId) {
      loadOpportunityData();
    }
  }, [opportunityId]);

  const loadOpportunityData = async () => {
    setLoading(true);
    try {
      // Get opportunity
      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title, opportunity_type')
        .eq('id', opportunityId)
        .single();

      if (oppError || !oppData) {
        console.error('Error loading opportunity:', oppError);
        toast.error('Failed to load opportunity');
        router.push('/admin/ExternalOpportunities/Manual');
        return;
      }

      // Get description
      const { data: descData, error: descError } = await supabase
        .from('opportunity_description')
        .select('title, description, location, hours, criteria')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();

      if (descError && descError.code !== 'PGRST116') {
        console.error('Error loading description:', descError);
      }

      // Set form data
      setFormData({
        title: descData?.title || oppData.title,
        description: descData?.description || '',
        location: descData?.location || '',
        hours: descData?.hours || '',
        opportunityType: oppData.opportunity_type as 'job' | 'funding' | 'training',
        criteria: descData?.criteria || {}
      });

      setOpportunityType(oppData.opportunity_type as 'job' | 'funding' | 'training');
    } catch (error) {
      console.error('Error loading opportunity:', error);
      toast.error('An error occurred while loading the opportunity');
      router.push('/admin/ExternalOpportunities/Manual');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriteriaChange = (criteria: any) => {
    setFormData(prev => ({
      ...prev,
      criteria
    }));
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Description step - validate and submit
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      // Ensure opportunity exists
      const { data: existingOpp } = await supabase
        .from('opportunities')
        .select('id')
        .eq('id', opportunityId)
        .maybeSingle();

      if (!existingOpp) {
        // Create if doesn't exist
        await createAdminOpportunity(opportunityId, opportunityType as 'job' | 'funding' | 'training');
      }

      const result = await saveAdminOpportunity({
        opportunityId,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        hours: formData.hours,
        opportunityType: opportunityType as 'job' | 'funding' | 'training',
        criteria: formData.criteria
      });
      
      if (!result.success) {
        console.error("Update error:", result.error);
        toast.error('Failed to update opportunity: ' + result.error);
        return;
      }
      
      // Show success message
      toast.success('Opportunity updated successfully!');
      
      // Navigate back to opportunities list after a short delay
      setTimeout(() => {
        router.push('/admin/ExternalOpportunities/Manual');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('An error occurred while updating the opportunity');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 2) {
      return (
        <AdminOpportunityDescription
          formData={formData}
          onChange={handleChange}
          onNext={handleNext}
          opportunityId={opportunityId}
          onCriteriaChange={handleCriteriaChange}
        />
      );
    }
    
    return null;
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/ExternalOpportunities/Manual"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#556B2F] mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-lg">
              <DocumentPlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Opportunity</h1>
              <p className="text-gray-600">Update opportunity details</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-[#556B2F]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#556B2F] bg-[#556B2F] text-white">
                1
              </div>
              <span className="ml-2 font-medium">Select Type</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-[#556B2F]"></div>
            <div className="flex items-center text-[#556B2F]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#556B2F] bg-[#556B2F] text-white">
                2
              </div>
              <span className="ml-2 font-medium">Description</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {saving ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#556B2F] border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Updating opportunity...</span>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>
      </div>
    </div>
  );
}
