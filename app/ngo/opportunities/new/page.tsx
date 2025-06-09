'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  DocumentPlusIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import ProgressBar from './ProgressBar';
import OpportunityDescription from './OpportunityDescription';
import OpportunityForm from './OpportunityForm';
import OpportunityProcess from './OpportunityProcess';
import OpportunityEvaluation from './OpportunityEvaluation';
import Recap from './Recap';
import { toast } from 'react-hot-toast';
import ListOpportunities from '../liste/ListOpportunities';
import { createInitialOpportunity as createOpportunityService, type OpportunityType, getOpportunityById, saveOpportunityProgress } from '../services/opportunityService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OpportunityFormData {
  title: string;
  description: string;
  location: string;
  requirements: string;
  startDate: string;
  endDate: string;
  hours: string;
  skills: string;
  categories: string[];
  opportunityType: 'job' | 'funding' | 'training' | '';
  applicationMethod: 'form' | 'email' | '';
  selectedFormId: string;
  contactEmails: string[];
  referenceCodes: string[];
  selectedEvaluationId: string;
  selectedEvaluationName: string;
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('list');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [savingOpportunity, setSavingOpportunity] = useState(false);
  const [opportunityId, setOpportunityId] = useState<string>(
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : '00000000-0000-0000-0000-000000000000'
  );
  const [opportunitySaved, setOpportunitySaved] = useState(false);
  const [opportunityType, setOpportunityType] = useState<'job' | 'funding' | 'training' | ''>('');
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOpportunityId, setEditOpportunityId] = useState<string | null>(null);
  const [loadingExistingData, setLoadingExistingData] = useState(false);
  
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    location: '',
    requirements: '',
    startDate: '',
    endDate: '',
    hours: '',
    skills: '',
    categories: [],
    opportunityType: '',
    applicationMethod: '',
    selectedFormId: '',
    contactEmails: [],
    referenceCodes: [],
    selectedEvaluationId: '',
    selectedEvaluationName: ''
  });
  
  // State to store the title of the selected form
  const [selectedFormTitle, setSelectedFormTitle] = useState<string>("");
  
  const [selectedProcess, setSelectedProcess] = useState('none');
  // Add state for selected process name
  const [selectedProcessName, setSelectedProcessName] = useState<string>('No Process Selected');
  
  const [customStages, setCustomStages] = useState<any[]>([]);

  // Handle edit mode initialization
  useEffect(() => {
    const editId = searchParams.get('edit');
    const stepParam = searchParams.get('step');
    
    if (editId) {
      setIsEditMode(true);
      setEditOpportunityId(editId);
      setOpportunityId(editId);
      setOpportunitySaved(true); // Already exists
      setActiveTab('new'); // Switch to new tab when in edit mode
      
      // Set current step based on URL parameter
      if (stepParam) {
        const stepMap: { [key: string]: number } = {
          'description': 2,
          'form': 3,
          'process': 4,
          'evaluation': 5,
          'recap': 6
        };
        setCurrentStep(stepMap[stepParam] || 2);
      } else {
        setCurrentStep(2); // Start at description step for editing
      }
      
      // Load existing opportunity data
      loadExistingOpportunityData(editId);
    }
  }, [searchParams]);

  // Function to load existing opportunity data
  const loadExistingOpportunityData = async (opportunityId: string) => {
    try {
      setLoadingExistingData(true);
      
      // Load basic opportunity data
      const opportunityResult = await getOpportunityById(opportunityId);
      if (opportunityResult.success && opportunityResult.opportunity) {
        const opportunity = opportunityResult.opportunity;
        setOpportunityType(opportunity.opportunity_type || '');
        
        // Update form data with basic info
        setFormData(prev => ({
          ...prev,
          title: opportunity.title || '',
          opportunityType: opportunity.opportunity_type || ''
        }));
      }
      
      // Load description data
      try {
        const { data: descriptionData } = await supabase
          .from('opportunity_description')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .maybeSingle();
        
        if (descriptionData) {
          setFormData(prev => ({
            ...prev,
            title: descriptionData.title || prev.title,
            description: descriptionData.description || '',
            location: descriptionData.location || '',
            hours: descriptionData.hours || '',
            categories: descriptionData.metadata?.categories || []
          }));
        }
      } catch (error) {
        console.error('Error loading description data:', error);
      }
      
      // Load form choice data
      try {
        const { data: formChoiceData } = await supabase
          .from('opportunity_form_choice')
          .select('*, form:form_id(*)')
          .eq('opportunity_id', opportunityId)
          .maybeSingle();
        
        if (formChoiceData) {
          setFormData(prev => ({
            ...prev,
            applicationMethod: 'form',
            selectedFormId: formChoiceData.form_id || ''
          }));
          
          if (formChoiceData.form?.title) {
            setSelectedFormTitle(formChoiceData.form.title);
          }
        }
      } catch (error) {
        console.error('Error loading form choice data:', error);
      }
      
      // Load form email data
      try {
        const { data: formEmailData } = await supabase
          .from('opportunity_form_email')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .maybeSingle();
        
        if (formEmailData) {
          setFormData(prev => ({
            ...prev,
            applicationMethod: 'email',
            contactEmails: formEmailData.contact_emails || [],
            referenceCodes: formEmailData.reference_codes || []
          }));
        }
      } catch (error) {
        console.error('Error loading form email data:', error);
      }

      // Load evaluation choice from localStorage
      try {
        const storageKey = `opportunity_evaluation_${opportunityId}`;
        const storedEvaluationChoice = localStorage.getItem(storageKey);
        
        if (storedEvaluationChoice) {
          const evaluationChoice = JSON.parse(storedEvaluationChoice);
          setFormData(prev => ({
            ...prev,
            selectedEvaluationId: evaluationChoice.evaluationId || '',
            selectedEvaluationName: evaluationChoice.evaluationName || ''
          }));
          console.log('Loaded evaluation choice from localStorage:', evaluationChoice);
        }
      } catch (error) {
        console.error('Error loading evaluation choice from localStorage:', error);
      }
      
    } catch (error) {
      console.error('Error loading existing opportunity data:', error);
      toast.error('Failed to load opportunity data');
    } finally {
      setLoadingExistingData(false);
    }
  };

  const steps = [
    { name: 'Introduction', completed: currentStep > 1 },
    { name: 'Description', completed: currentStep > 2 },
    { name: 'Details', completed: currentStep > 3 },
    { name: 'Process', completed: currentStep > 4 },
    { name: 'Evaluation', completed: currentStep > 5 },
    { name: 'Recap', completed: currentStep > 6 },
    { name: 'Submission', completed: currentStep > 7 }
  ];

  const totalSteps = steps.length;
  
  const categoryOptions = [
    'Education',
    'Environment',
    'Health',
    'Human Rights',
    'Poverty Relief',
    'Animal Welfare',
    'Community Development',
    'Arts & Culture'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If the selected form ID changes, fetch the form title
    if (name === 'selectedFormId' && value) {
      fetchFormTitle(value);
    }
  };

  // Function to fetch form title by ID
  const fetchFormTitle = async (formId: string) => {
    if (!formId) {
      setSelectedFormTitle('');
      return;
    }
    
    try {
      // Import the getFormById function
      const { getFormById } = await import('../../resources/tools/FormMaker/services/formService');
      const result = await getFormById(formId);
      
      if (result.success && result.form && result.form.title) {
        setSelectedFormTitle(result.form.title);
      } else {
        setSelectedFormTitle('');
      }
    } catch (error) {
      console.error('Error fetching form title:', error);
      setSelectedFormTitle('');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          categories: [...prev.categories, value]
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter(cat => cat !== value)
        };
      }
    });
  };

  const handleProcessSelect = (process: string) => {
    setSelectedProcess(process);
    
    // Find the process name if it's not 'none'
    if (process === 'none') {
      setSelectedProcessName('No Process Selected');
    } else {
      // Get process name from processTemplates in OpportunityProcess.tsx
      // This is handled in OpportunityProcess.tsx and will update selectedProcessName
    }
  };

  const handleStageAdd = (stage: any) => {
    setCustomStages([...customStages, stage]);
  };

  const handleStageRemove = (id: string) => {
    if (id === 'all') {
      // Clear all stages
      setCustomStages([]);
    } else {
      // Remove specific stage
      setCustomStages(customStages.filter(stage => stage.id !== id));
    }
  };

  const handleStageChange = (id: string, field: string, value: string | string[]) => {
    setCustomStages(customStages.map(stage => 
      stage.id === id ? { ...stage, [field]: value } : stage
    ));
  };

  const handleApplicationMethodChange = (method: 'form' | 'email') => {
    setFormData(prev => ({
      ...prev,
      applicationMethod: method
    }));
  };

  const handleEmailsChange = (emails: string[]) => {
    setFormData(prev => ({
      ...prev,
      contactEmails: emails
    }));
  };
  
  const handleReferenceCodesChange = (codes: string[]) => {
    setFormData(prev => ({
      ...prev,
      referenceCodes: codes
    }));
  };

  const handleEvaluationSelect = async (evaluationId: string, evaluationName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEvaluationId: evaluationId,
      selectedEvaluationName: evaluationName
    }));

    // Save evaluation choice to localStorage for immediate use
    if (evaluationId) {
      const evaluationChoice = {
        evaluationId: evaluationId,
        evaluationName: evaluationName,
        selectedAt: new Date().toISOString()
      };
      
      const storageKey = `opportunity_evaluation_${opportunityId}`;
      localStorage.setItem(storageKey, JSON.stringify(evaluationChoice));
      console.log('Saved evaluation choice to localStorage:', storageKey, evaluationChoice);

      // Also save to database for persistence
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}/evaluation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            evaluationId: evaluationId
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Saved evaluation choice to database:', result);
        } else {
          const error = await response.json();
          console.warn('⚠️ Failed to save evaluation choice to database:', error);
        }
      } catch (error) {
        console.warn('⚠️ Network error saving evaluation choice to database:', error);
      }
    } else {
      // If no evaluation selected, remove from localStorage
      const storageKey = `opportunity_evaluation_${opportunityId}`;
      localStorage.removeItem(storageKey);
      console.log('Removed evaluation choice from localStorage:', storageKey);
      
      // Note: For simplicity, we're not removing from database when deselected
      // In a production app, you might want to handle this case
    }
  };

  // Function to update form data including title
  const handleFormDataUpdate = (formId: string, title: string) => {
    // Update the form ID
    setFormData(prev => ({
      ...prev,
      selectedFormId: formId
    }));
    
    // Update the form title
    setSelectedFormTitle(title);
  };

  const handleOpportunityTypeChange = (type: 'job' | 'funding' | 'training') => {
    setOpportunityType(type);
    setFormData(prev => ({
      ...prev,
      opportunityType: type
    }));
  };

  const createInitialOpportunity = async () => {
    try {
      setSavingOpportunity(true);
      
      const result = await createOpportunityService(opportunityId, opportunityType as OpportunityType);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to create opportunity. Please try again.');
        return false;
      }
      
      setOpportunitySaved(true);
      console.log('Initial opportunity created with ID:', opportunityId);
      return true;
      
    } catch (error) {
      console.error('Error creating initial opportunity:', error);
      toast.error('Failed to create opportunity. Please try again.');
      return false;
    } finally {
      setSavingOpportunity(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // If we're on step 1 (getting started), create the initial opportunity
      if (currentStep === 1) {
        if (!opportunityType) {
          toast.error('Please select an opportunity type before proceeding');
          return;
        }
        
        if (!opportunitySaved) {
        const success = await createInitialOpportunity();
        if (!success) return; // Don't proceed if creation failed
        }
      }
      
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const navigateToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Prepare data for final submission with completed status
      const completedData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        hours: formData.hours,
        status: 'completed', // Set status to completed when submitting
        step: 'submission',
        metadata: {
          opportunityType: opportunityType,
          submittedAt: new Date().toISOString()
        },
        opportunity_id: opportunityId
      };

      console.log('Submitting opportunity with completed status:', completedData);

      // Save the final opportunity with completed status
      const result = await saveOpportunityProgress(completedData);
      
      if (result.error) {
        console.error("Submission error:", result.error);
        toast.error('Failed to create opportunity: ' + result.error.message);
        return;
      }
      
      // Show success message
      toast.success('Opportunity created successfully!');
      
      // Navigate back to opportunities list after a short delay
      setTimeout(() => {
        router.push('/ngo/opportunities');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('An error occurred while creating the opportunity');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#556B2F]/10 mb-4">
                  <DocumentPlusIcon className="h-8 w-8 text-[#556B2F]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Opportunity Creation</h2>
                <p className="mt-2 text-lg text-gray-600">
                  This guided process will help you create a compelling volunteer opportunity
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-xl p-6 border border-[#556B2F]/10 shadow-sm">
              <h3 className="text-lg font-medium text-[#556B2F] mb-4">Please define the opportunity you wish to share:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Job Opportunity */}
                <div 
                  className={`
                    cursor-pointer rounded-xl p-6 border-2 transform transition-all duration-200
                    ${opportunityType === 'job' 
                      ? 'border-[#556B2F] bg-[#556B2F]/10 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-[#556B2F]/50 hover:shadow hover:scale-102 bg-white'
                    }
                  `}
                  onClick={() => handleOpportunityTypeChange('job')}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`
                      p-3 rounded-full mb-4
                      ${opportunityType === 'job' ? 'bg-[#556B2F] text-white' : 'bg-[#556B2F]/10 text-[#556B2F]'}
                    `}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium">Job Opportunity</h4>
                    <span className="mt-2 text-sm text-gray-500">
                      Share positions requiring specific skills or expertise
                    </span>
                  </div>
                </div>

                {/* Funding Opportunity */}
                <div 
                  className={`
                    cursor-pointer rounded-xl p-6 border-2 transform transition-all duration-200
                    ${opportunityType === 'funding' 
                      ? 'border-[#556B2F] bg-[#556B2F]/10 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-[#556B2F]/50 hover:shadow hover:scale-102 bg-white'
                    }
                  `}
                  onClick={() => handleOpportunityTypeChange('funding')}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`
                      p-3 rounded-full mb-4
                      ${opportunityType === 'funding' ? 'bg-[#556B2F] text-white' : 'bg-[#556B2F]/10 text-[#556B2F]'}
                    `}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium">Funding Opportunity</h4>
                    <span className="mt-2 text-sm text-gray-500">
                      Offer grants, scholarships, or financial support options
                    </span>
                  </div>
                </div>

                {/* Training Opportunity */}
                <div 
                  className={`
                    cursor-pointer rounded-xl p-6 border-2 transform transition-all duration-200
                    ${opportunityType === 'training' 
                      ? 'border-[#556B2F] bg-[#556B2F]/10 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-[#556B2F]/50 hover:shadow hover:scale-102 bg-white'
                    }
                  `}
                  onClick={() => handleOpportunityTypeChange('training')}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`
                      p-3 rounded-full mb-4
                      ${opportunityType === 'training' ? 'bg-[#556B2F] text-white' : 'bg-[#556B2F]/10 text-[#556B2F]'}
                    `}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium">Training Opportunity</h4>
                    <span className="mt-2 text-sm text-gray-500">
                      Provide workshops, courses, or educational programs
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[#556B2F] text-white text-sm mr-3">1</span>
                  The Process
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step.name} {index === 0 ? '- Getting started' : index === 1 ? '- Basic information' : index === 2 ? '- Timing and requirements' : index === 3 ? '- Workflow setup' : index === 4 ? '- Evaluation template' : index === 5 ? '- Review details' : '- Publish opportunity'}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[#556B2F] text-white text-sm mr-3">2</span>
                  Best Practices
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-[#556B2F] mr-2">✓</span>
                    <span>Be specific about responsibilities and expectations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#556B2F] mr-2">✓</span>
                    <span>Highlight the impact volunteers will make</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#556B2F] mr-2">✓</span>
                    <span>Clearly state time commitments and requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#556B2F] mr-2">✓</span>
                    <span>Include any specific skills or qualifications needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#556B2F] mr-2">✓</span>
                    <span>Set up a process flow for managing applications</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={handleNext}
                disabled={savingOpportunity}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingOpportunity ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Get Started
                    <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <OpportunityDescription 
            formData={formData} 
            onChange={handleChange} 
            onNext={handleNext}
            opportunityId={opportunityId}
          />
        );
      case 3:
        return (
          <OpportunityForm 
            opportunityId={opportunityId}
            formData={{
              applicationMethod: formData.applicationMethod,
              selectedFormId: formData.selectedFormId,
              contactEmails: formData.contactEmails,
              referenceCodes: formData.referenceCodes
            }}
            onChange={handleChange}
            onApplicationMethodChange={handleApplicationMethodChange}
            onEmailsChange={handleEmailsChange}
            onReferenceCodesChange={handleReferenceCodesChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <OpportunityProcess
            selectedProcess={selectedProcess}
            customStages={customStages}
            opportunityId={opportunityId}
            onProcessSelect={handleProcessSelect}
            onProcessNameChange={setSelectedProcessName}
            onStageAdd={handleStageAdd}
            onStageRemove={handleStageRemove}
            onStageChange={handleStageChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <OpportunityEvaluation
            opportunityId={opportunityId}
            selectedEvaluationId={formData.selectedEvaluationId}
            onEvaluationSelect={handleEvaluationSelect}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <Recap
            descriptionData={{
              title: formData.title,
              description: formData.description,
              location: formData.location,
              hours: formData.hours
            }}
            formData={{
              applicationMethod: formData.applicationMethod,
              selectedFormId: formData.selectedFormId,
              selectedFormTitle: selectedFormTitle,
              contactEmails: formData.contactEmails,
              referenceCodes: formData.referenceCodes
            }}
            processData={{
              selectedProcess: selectedProcess,
              selectedProcessName: selectedProcessName,
              customStages: customStages
            }}
            evaluationData={{
              selectedEvaluationId: formData.selectedEvaluationId,
              selectedEvaluationName: formData.selectedEvaluationName
            }}
            opportunityType={opportunityType}
            opportunityId={opportunityId}
            onPrevious={handlePrevious}
            onSubmit={handleNext}
          />
        );
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Submission</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ready to publish your opportunity.
              </p>
            </div>
            <div className="bg-white p-6 shadow rounded-lg border border-green-100">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#556B2F]/10">
                  <svg className="h-6 w-6 text-[#556B2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Final Review Complete</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your opportunity is ready to be published. Click the button below to create this opportunity and make it visible to potential volunteers.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Opportunity'}
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                >
                  Back to Review
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to reset all data for a new opportunity
  const resetToNewOpportunity = () => {
    // Reset all form data
    setFormData({
      title: '',
      description: '',
      location: '',
      requirements: '',
      startDate: '',
      endDate: '',
      hours: '',
      skills: '',
      categories: [],
      opportunityType: '',
      applicationMethod: '',
      selectedFormId: '',
      contactEmails: [],
      referenceCodes: [],
      selectedEvaluationId: '',
      selectedEvaluationName: ''
    });
    
    // Reset other states
    setCurrentStep(1);
    setOpportunityType('');
    setSelectedFormTitle('');
    setSelectedProcess('none');
    setSelectedProcessName('No Process Selected');
    setCustomStages([]);
    setOpportunitySaved(false);
    setLoading(false);
    setSavingOpportunity(false);
    setLoadingExistingData(false);
    
    // Reset edit mode states
    setIsEditMode(false);
    setEditOpportunityId(null);
    
    // Generate new opportunity ID
    setOpportunityId(
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : '00000000-0000-0000-0000-000000000000'
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <DocumentPlusIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
            {isEditMode ? 'Edit Opportunity' : 'Opportunities Management'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode ? 'Update your volunteer opportunity' : 'Create and manage opportunities for your organization'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Link 
            href="/ngo/opportunities" 
            className="inline-flex items-center text-[#6B8E23] hover:text-[#556B2F]"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to opportunities
          </Link>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => {
                // Reset everything when switching to new opportunity
                resetToNewOpportunity();
                setActiveTab('new');
                // Clear URL parameters to exit edit mode
                window.history.replaceState({}, '', '/ngo/opportunities/new');
              }}
              className={`${
                activeTab === 'new'
                  ? 'border-[#6B8E23] text-[#556B2F] font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <span className="flex items-center">
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                {isEditMode ? 'Edit Opportunity' : 'New Opportunity'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`${
                activeTab === 'list'
                  ? 'border-[#6B8E23] text-[#556B2F] font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <span className="flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                List Opportunities
              </span>
            </button>
          </nav>
        </div>
        
        {activeTab === 'new' && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            {/* Progress Bar */}
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps}
              onStepClick={navigateToStep}
            />
            
            {/* Loading indicator for edit mode */}
            {loadingExistingData && (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-8 w-8 text-[#556B2F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Loading opportunity data...</p>
                </div>
              </div>
            )}
            
            {/* Step Content */}
            {!loadingExistingData && (
              <div className="pt-6">
                {renderStepContent()}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'list' && (
          <ListOpportunities />
        )}
      </div>
    </div>
  );
} 