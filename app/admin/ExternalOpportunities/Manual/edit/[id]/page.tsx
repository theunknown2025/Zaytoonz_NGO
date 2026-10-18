'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import OpportunityDescription from '@/app/ngo/opportunities/new/OpportunityDescription';
import { saveAdminOpportunity, createAdminOpportunity } from '../../services/adminOpportunityService';
import { supabase } from '@/app/lib/supabase';
import type { OpportunityFlowStep } from '@/app/lib/opportunityFlow';
import type { OpportunityDocument } from '@/app/lib/opportunityDocuments';
import { parseOpportunityDocuments } from '@/app/lib/opportunityDocuments';
import type { TrainingDay } from '@/app/lib/opportunityTrainingProgram';
import type { OpportunityFaqItem } from '@/app/lib/opportunityFaq';
import type { OpportunityActionButton } from '@/app/lib/opportunityActionButtons';
import { getOpportunityFlowSteps } from '@/app/ngo/opportunities/services/opportunityFlowService';
import { getTrainingProgram } from '@/app/ngo/opportunities/services/opportunityTrainingProgramService';
import { getOpportunityFaqItems } from '@/app/ngo/opportunities/services/opportunityFaqService';
import { getOpportunityActionButtons } from '@/app/ngo/opportunities/services/opportunityActionButtonsService';
import {
  getOpportunityExternalSettings,
  normalizeExternalUrl,
} from '@/app/ngo/opportunities/services/opportunityFormService';
import { normalizeLocationToCountries } from '@/app/lib/locationNormalize';

function normalizeCriteriaCountries(
  criteria: OpportunityFormData['criteria'] | null | undefined,
  location?: string | null
): OpportunityFormData['criteria'] {
  const base = criteria && typeof criteria === 'object' ? { ...criteria } : {};
  const rawCountry = base.country;
  let countries: string[] = [];
  if (Array.isArray(rawCountry)) {
    countries = rawCountry.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof rawCountry === 'string' && rawCountry.trim()) {
    countries = rawCountry.split(',').map((c) => c.trim()).filter(Boolean);
  }
  if (countries.length === 0) {
    countries = normalizeLocationToCountries(location);
  }
  return {
    ...base,
    country: countries,
  };
}

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
    country?: string | string[];
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
  const [currentStep] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opportunityType, setOpportunityType] = useState<'job' | 'funding' | 'training' | ''>('');
  const [ngoUserId, setNgoUserId] = useState<string | undefined>(undefined);
  
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    location: '',
    hours: '',
    opportunityType: '',
    criteria: {}
  });

  const [applyLink, setApplyLink] = useState('');
  const [flowSteps, setFlowSteps] = useState<OpportunityFlowStep[]>([]);
  const [includeProcessFlow, setIncludeProcessFlow] = useState(false);
  const [documents, setDocuments] = useState<OpportunityDocument[]>([]);
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [includeTrainingProgram, setIncludeTrainingProgram] = useState(false);
  const [faqItems, setFaqItems] = useState<OpportunityFaqItem[]>([]);
  const [includeFaq, setIncludeFaq] = useState(false);
  const [actionButtons, setActionButtons] = useState<OpportunityActionButton[]>([]);
  const [includeActionButtons, setIncludeActionButtons] = useState(false);

  useEffect(() => {
    if (opportunityId) {
      loadOpportunityData();
    }
  }, [opportunityId]);

  const loadOpportunityData = async () => {
    setLoading(true);
    try {
      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title, opportunity_type, user_id')
        .eq('id', opportunityId)
        .single();

      if (oppError || !oppData) {
        console.error('Error loading opportunity:', oppError);
        toast.error('Failed to load opportunity');
        router.push('/admin/ExternalOpportunities/Manual');
        return;
      }

      setNgoUserId(oppData.user_id || undefined);

      const { data: descData, error: descError } = await supabase
        .from('opportunity_description')
        .select('title, description, location, hours, criteria, metadata')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();

      if (descError && descError.code !== 'PGRST116') {
        console.error('Error loading description:', descError);
      }

      const oppType = oppData.opportunity_type as 'job' | 'funding' | 'training';

      const normalizedCriteria = normalizeCriteriaCountries(
        descData?.criteria,
        descData?.location
      );
      const countries = Array.isArray(normalizedCriteria.country)
        ? normalizedCriteria.country
        : [];
      const locationValue =
        countries.length > 0 ? countries.join(', ') : descData?.location || '';

      setFormData({
        title: descData?.title || oppData.title,
        description: descData?.description || '',
        location: locationValue,
        hours: descData?.hours || '',
        opportunityType: oppType,
        criteria: normalizedCriteria,
      });

      setOpportunityType(oppType);

      const loadedDocs = parseOpportunityDocuments(descData?.metadata);
      setDocuments(loadedDocs);
      if (loadedDocs.length > 0) {
        setIncludeDocuments(true);
      }

      try {
        const { externalUrl } = await getOpportunityExternalSettings(opportunityId);
        setApplyLink(externalUrl || '');
      } catch (error) {
        console.error('Error loading apply link:', error);
      }

      try {
        const steps = await getOpportunityFlowSteps(opportunityId);
        if (steps.length > 0) {
          setFlowSteps(steps);
          setIncludeProcessFlow(true);
        }
      } catch (error) {
        console.error('Error loading flow steps:', error);
      }

      try {
        const program = await getTrainingProgram(opportunityId);
        if (program.length > 0) {
          setTrainingDays(program);
          setIncludeTrainingProgram(true);
        }
      } catch (error) {
        console.error('Error loading training program:', error);
      }

      try {
        const faq = await getOpportunityFaqItems(opportunityId);
        if (faq.length > 0) {
          setFaqItems(faq);
          setIncludeFaq(true);
        }
      } catch (error) {
        console.error('Error loading FAQ:', error);
      }

      try {
        const buttons = await getOpportunityActionButtons(opportunityId);
        if (buttons.length > 0) {
          setActionButtons(buttons);
          setIncludeActionButtons(true);
        }
      } catch (error) {
        console.error('Error loading action buttons:', error);
      }
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

  const handleCriteriaChange = (criteria: OpportunityFormData['criteria']) => {
    setFormData(prev => ({
      ...prev,
      criteria
    }));
  };

  const handleStepAdd = (step: OpportunityFlowStep) => {
    setFlowSteps((prev) => [...prev, step]);
  };

  const handleStepRemove = (id: string) => {
    setFlowSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleStepChange = (id: string, field: string, value: string) => {
    setFlowSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const handleIncludeProcessFlowChange = (enabled: boolean) => {
    setIncludeProcessFlow(enabled);
    if (!enabled) setFlowSteps([]);
  };

  const handleStepsReplace = (steps: OpportunityFlowStep[]) => {
    setFlowSteps(steps);
  };

  const handleIncludeDocumentsChange = (enabled: boolean) => {
    setIncludeDocuments(enabled);
    if (!enabled) setDocuments([]);
  };

  const handleIncludeActionButtonsChange = (enabled: boolean) => {
    setIncludeActionButtons(enabled);
    if (!enabled) setActionButtons([]);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!normalizeExternalUrl(applyLink)) {
      toast.error('Please provide a valid Apply Link');
      return;
    }

    setSaving(true);
    
    try {
      const { data: existingOpp } = await supabase
        .from('opportunities')
        .select('id')
        .eq('id', opportunityId)
        .maybeSingle();

      if (!existingOpp) {
        await createAdminOpportunity(
          opportunityId,
          opportunityType as 'job' | 'funding' | 'training',
          ngoUserId
        );
      }

      const country = formData.criteria?.country;
      const countries = Array.isArray(country)
        ? country.filter(Boolean)
        : typeof country === 'string' && country.trim()
          ? country.split(',').map((c) => c.trim()).filter(Boolean)
          : [];
      const locationValue =
        countries.length > 0 ? countries.join(', ') : formData.location;

      const result = await saveAdminOpportunity({
        opportunityId,
        title: formData.title,
        description: formData.description,
        location: locationValue,
        hours: formData.hours,
        opportunityType: opportunityType as 'job' | 'funding' | 'training',
        criteria: {
          ...(formData.criteria || {}),
          ...(countries.length > 0 ? { country: countries } : {}),
        },
        ngoUserId,
        documents: includeDocuments ? documents : [],
        applyLink,
      });
      
      if (!result.success) {
        console.error("Update error:", result.error);
        toast.error('Failed to update opportunity: ' + result.error);
        return;
      }
      
      toast.success('Opportunity updated successfully!');
      
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

  const handleNext = () => {
    if (currentStep === 2) {
      handleSubmit();
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {saving ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#556B2F] border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Updating opportunity...</span>
            </div>
          ) : (
            <OpportunityDescription
              formData={formData}
              onChange={handleChange}
              onNext={handleNext}
              opportunityId={opportunityId}
              onCriteriaChange={handleCriteriaChange}
              initialCriteria={formData.criteria}
              includeProcessFlow={includeProcessFlow}
              onIncludeProcessFlowChange={handleIncludeProcessFlowChange}
              flowSteps={flowSteps}
              onStepAdd={handleStepAdd}
              onStepRemove={handleStepRemove}
              onStepChange={handleStepChange}
              onStepsReplace={handleStepsReplace}
              documents={documents}
              onDocumentsChange={setDocuments}
              includeDocuments={includeDocuments}
              onIncludeDocumentsChange={handleIncludeDocumentsChange}
              includeTrainingProgram={includeTrainingProgram}
              onIncludeTrainingProgramChange={setIncludeTrainingProgram}
              trainingDays={trainingDays}
              onTrainingDaysReplace={setTrainingDays}
              includeFaq={includeFaq}
              onIncludeFaqChange={setIncludeFaq}
              faqItems={faqItems}
              onFaqItemsReplace={setFaqItems}
              actionButtons={actionButtons}
              onActionButtonsChange={setActionButtons}
              includeActionButtons={includeActionButtons}
              onIncludeActionButtonsChange={handleIncludeActionButtonsChange}
              showApplyLink
              applyLink={applyLink}
              onApplyLinkChange={setApplyLink}
              applyLinkRequired
              nextButtonLabel="Publish Opportunity"
            />
          )}
        </div>
      </div>
    </div>
  );
}
