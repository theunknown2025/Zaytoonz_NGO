'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  DocumentPlusIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AdminOpportunityDescription from '../components/AdminOpportunityDescription';
import { createAdminOpportunity, saveAdminOpportunity } from '../services/adminOpportunityService';
import ProgressBar from './ProgressBar';
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

interface NGO {
  id: string;
  name: string;
  user_id: string;
}

export default function NewManualOpportunityPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [opportunityId, setOpportunityId] = useState<string>(
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : '00000000-0000-0000-0000-000000000000'
  );
  const [opportunityType, setOpportunityType] = useState<'job' | 'funding' | 'training' | ''>('');
  const [savingOpportunity, setSavingOpportunity] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<string>('');
  const [selectedNGOName, setSelectedNGOName] = useState<string>('');
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loadingNGOs, setLoadingNGOs] = useState(true);
  const [showNGOModal, setShowNGOModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    location: '',
    hours: '',
    opportunityType: '',
    criteria: {}
  });

  // Fetch NGOs on component mount
  useEffect(() => {
    const fetchNGOs = async () => {
      setLoadingNGOs(true);
      try {
        const { data, error } = await supabase
          .from('ngo_profile')
          .select('id, name, user_id')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching NGOs:', error);
          toast.error('Failed to load NGOs');
          return;
        }

        setNgos(data || []);
      } catch (error) {
        console.error('Error fetching NGOs:', error);
        toast.error('Error loading NGOs');
      } finally {
        setLoadingNGOs(false);
      }
    };

    fetchNGOs();
  }, []);

  const steps = [
    { name: 'Introduction', completed: currentStep > 1 },
    { name: 'Description', completed: currentStep > 2 }
  ];

  const totalSteps = steps.length;


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

  const handleOpportunityTypeChange = (type: 'job' | 'funding' | 'training') => {
    setOpportunityType(type);
    setFormData(prev => ({
      ...prev,
      opportunityType: type
    }));
  };

  const handleOpportunityTypeSelect = (type: 'job' | 'funding' | 'training') => {
    handleOpportunityTypeChange(type);
    setCurrentStep(2);
  };

  const navigateToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
    window.scrollTo(0, 0);
  };


  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await saveAdminOpportunity({
        opportunityId,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        hours: formData.hours,
        opportunityType: opportunityType as 'job' | 'funding' | 'training',
        criteria: formData.criteria,
        ngoUserId: selectedNGO
      });
      
      if (!result.success) {
        console.error("Submission error:", result.error);
        toast.error('Failed to create opportunity: ' + result.error);
        return;
      }
      
      // Show success message
      toast.success('Opportunity created successfully!');
      
      // Navigate back to opportunities list after a short delay
      setTimeout(() => {
        router.push('/admin/ExternalOpportunities/Manual');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('An error occurred while creating the opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedNGO) {
        toast.error('Please select an NGO');
        return;
      }
      if (!opportunityType) {
        toast.error('Please select an opportunity type');
        return;
      }
      setSavingOpportunity(true);
      // Create opportunity when moving to next step with selected NGO's user_id
      createAdminOpportunity(opportunityId, opportunityType as 'job' | 'funding' | 'training', selectedNGO)
        .then(result => {
          if (!result.success) {
            console.error('Error creating opportunity:', result.error);
            toast.error('Failed to initialize opportunity');
            setSavingOpportunity(false);
            return;
          }
          setSavingOpportunity(false);
          setCurrentStep(2);
        });
    } else if (currentStep === 2) {
      // Description step - validate and submit
      handleSubmit();
    }
  };

  const handleSelectNGO = (ngo: NGO) => {
    setSelectedNGO(ngo.user_id);
    setSelectedNGOName(ngo.name);
    setShowNGOModal(false);
    setSearchTerm('');
  };

  const filteredNGOs = ngos.filter(ngo =>
    ngo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#556B2F]/10 mb-4">
                <DocumentPlusIcon className="h-8 w-8 text-[#556B2F]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Opportunity Creation</h2>
              <p className="mt-2 text-lg text-gray-600">
                This guided process will help you create a compelling opportunity
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-xl p-6 border border-[#556B2F]/10 shadow-sm">
            {/* NGO Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                  Select NGO
                </div>
              </label>
              {loadingNGOs ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#556B2F] border-t-transparent"></div>
                  <span className="text-sm text-gray-500">Loading NGOs...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedNGO ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-[#556B2F] rounded-md">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                        <span className="text-sm font-medium text-gray-900">{selectedNGOName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNGO('');
                          setSelectedNGOName('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNGOModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                    >
                      <BuildingOfficeIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                      Select an NGO
                    </button>
                  )}
                </div>
              )}
              {!selectedNGO && (
                <p className="mt-1 text-xs text-gray-500">
                  Please select the NGO for which this opportunity will be created
                </p>
              )}
            </div>

            {/* NGO Search Modal */}
            {showNGOModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNGOModal(false)}></div>
                  
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                  
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900" id="modal-title">
                          Select NGO
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNGOModal(false);
                            setSearchTerm('');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                      
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm"
                            placeholder="Search NGOs..."
                            autoFocus
                          />
                        </div>
                      </div>
                      
                      {/* NGO List */}
                      <div className="max-h-96 overflow-y-auto">
                        {filteredNGOs.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No NGOs found matching your search' : 'No NGOs available'}
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {filteredNGOs.map((ngo) => (
                              <li key={ngo.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectNGO(ngo)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center">
                                    <BuildingOfficeIcon className="h-5 w-5 mr-3 text-[#556B2F]" />
                                    <span className="text-sm font-medium text-gray-900">{ngo.name}</span>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                <li className="flex items-start">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs mr-3 mt-0.5">
                    1
                  </span>
                  <span>Introduction - Getting started</span>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs mr-3 mt-0.5">
                    2
                  </span>
                  <span>Description - Basic information</span>
                </li>
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
                  <span>Highlight the impact applicants will make</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#556B2F] mr-2">✓</span>
                  <span>Clearly state time commitments and requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#556B2F] mr-2">✓</span>
                  <span>Include any specific skills or qualifications needed</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={handleNext}
              disabled={savingOpportunity || !opportunityType || !selectedNGO}
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
    }
    
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

  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <DocumentPlusIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
            Opportunities Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage opportunities manually
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Link 
            href="/admin/ExternalOpportunities/Manual" 
            className="inline-flex items-center text-[#6B8E23] hover:text-[#556B2F]"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to opportunities
          </Link>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          {/* Progress Bar */}
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={steps}
            onStepClick={navigateToStep}
          />
            
          {/* Step Content */}
          <div className="pt-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
