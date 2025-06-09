'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { getFormById } from '../../resources/tools/FormMaker/services/formService';

interface FormSection {
  id: string;
  title: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface ProcessStage {
  id: string;
  name: string;
  description: string;
  statusOptions: string[];
}

interface RecapProps {
  descriptionData: {
  title: string;
  description: string;
  location: string;
    hours: string;
  };
  formData: {
    applicationMethod: 'form' | 'email' | '';
    selectedFormId: string;
    selectedFormTitle?: string;
  contactEmails?: string[];
  referenceCodes?: string[];
  };
  processData: {
    selectedProcess: string;
    selectedProcessName?: string;
    customStages: ProcessStage[];
  };
  evaluationData?: {
    selectedEvaluationId: string;
    selectedEvaluationName: string;
  };
  opportunityType?: 'job' | 'funding' | 'training' | '';
  opportunityId?: string;
  onPrevious: () => void;
  onSubmit: () => void;
  isSaving?: boolean;
  isSubmitting?: boolean;
}

export default function Recap({
  descriptionData, 
  formData, 
  processData,
  evaluationData,
  opportunityType,
  opportunityId,
  onPrevious,
  onSubmit,
  isSaving = false,
  isSubmitting = false
}: RecapProps) {
  // State to track which accordion sections are open
  const [openSections, setOpenSections] = useState<{
    description: boolean;
    form: boolean;
    process: boolean;
    evaluation: boolean;
  }>({
    description: true,
    form: false,
    process: false,
    evaluation: false
  });

  // State to store the form details
  const [formDetails, setFormDetails] = useState<{
    sections: FormSection[];
    isLoading: boolean;
  }>({
    sections: [],
    isLoading: false
  });

  // Fetch form details when component mounts or when selectedFormId changes
  useEffect(() => {
    if (formData.applicationMethod === 'form' && formData.selectedFormId) {
      fetchFormDetails(formData.selectedFormId);
    }
  }, [formData.applicationMethod, formData.selectedFormId]);

  // Function to fetch form details
  const fetchFormDetails = async (formId: string) => {
    setFormDetails(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await getFormById(formId);
      
      if (result.success && result.form) {
        let sections: FormSection[] = [];
        
        // Parse the sections data
        try {
          if (typeof result.form.sections === 'string') {
            sections = JSON.parse(result.form.sections);
          } else if (Array.isArray(result.form.sections)) {
            sections = result.form.sections;
          } else if (result.form.sections && typeof result.form.sections === 'object') {
            sections = result.form.sections;
          }
        } catch (error) {
          console.error('Error parsing form sections:', error);
        }
        
        setFormDetails({
          sections: sections || [],
          isLoading: false
        });
      } else {
        setFormDetails({
          sections: [],
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
      setFormDetails({
        sections: [],
        isLoading: false
      });
    }
  };

  // Toggle accordion section
  const toggleSection = (section: 'description' | 'form' | 'process' | 'evaluation') => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };

  // Truncate text for summary views
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Remove HTML tags for plain text display
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  // Render a form field preview
  const renderFieldPreview = (question: FormQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-400"
              placeholder={question.placeholder || "Text input"}
              disabled
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
            <textarea 
              className="w-full border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-400"
              placeholder={question.placeholder || "Text area"}
              rows={2}
              disabled
            />
          </div>
        );
      case 'select':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
            <select 
              className="w-full border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-400"
              disabled
            >
              <option>Select option</option>
            </select>
          </div>
        );
      case 'radio':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50 flex items-center">
            <div className="h-4 w-4 rounded-full border border-gray-300 bg-white mr-2"></div>
            <span className="text-gray-400 text-sm">Radio option</span>
          </div>
        );
      case 'checkbox':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50 flex items-center">
            <div className="h-4 w-4 rounded-md border border-gray-300 bg-white mr-2"></div>
            <span className="text-gray-400 text-sm">Checkbox option</span>
          </div>
        );
      case 'date':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-400"
              disabled
            />
          </div>
        );
      case 'file':
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50 flex items-center">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-500 mr-2">Choose file</span>
            <span className="text-gray-400 text-sm">No file selected</span>
          </div>
        );
      default:
        return (
          <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-400"
              placeholder="Field input"
              disabled
            />
          </div>
        );
    }
  };

  // Helper function to get opportunity type details
  const getOpportunityTypeDetails = (type: string) => {
    switch (type) {
      case 'job':
        return {
          label: 'Job Opportunity',
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'funding':
        return {
          label: 'Funding Opportunity',
          icon: <CurrencyDollarIcon className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'training':
        return {
          label: 'Training Opportunity',
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        };
      default:
        return {
          label: 'Not specified',
          icon: <DocumentTextIcon className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review your opportunity details before submitting.
        </p>
      </div>

      <div className="space-y-4">
        {/* Description Accordion */}
        <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          openSections.description ? 'shadow-md' : 'shadow-sm'
        }`}>
          <div 
            className={`px-6 py-4 cursor-pointer flex justify-between items-center ${
              openSections.description ? 'bg-[#556B2F]/10' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('description')}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-[#556B2F] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        </div>
            <div className="flex items-center">
              {openSections.description ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          
          {/* Summary when closed */}
          {!openSections.description && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Title:</span> 
                  <span>{truncateText(descriptionData.title, 50)}</span>
                </div>
                {opportunityType && (
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getOpportunityTypeDetails(opportunityType).bgColor} ${getOpportunityTypeDetails(opportunityType).color}`}>
                      {getOpportunityTypeDetails(opportunityType).icon}
                      <span className="ml-1">{getOpportunityTypeDetails(opportunityType).label}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Full details when open */}
          {openSections.description && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="space-y-4">
                {opportunityType && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Opportunity Type</h4>
                    <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getOpportunityTypeDetails(opportunityType).bgColor} ${getOpportunityTypeDetails(opportunityType).color}`}>
                      {getOpportunityTypeDetails(opportunityType).icon}
                      <span className="ml-2">{getOpportunityTypeDetails(opportunityType).label}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Title</h4>
                  <p className="text-gray-900">{descriptionData.title}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                  <div className="prose prose-sm max-w-none text-gray-600 border border-gray-100 rounded-md p-3 bg-gray-50">
                    {descriptionData.description ? (
                      <div dangerouslySetInnerHTML={{ __html: descriptionData.description }} />
                    ) : (
                      <p className="text-gray-400 italic">No description provided</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                      Location
                    </h4>
                    <p className="text-gray-600">{descriptionData.location || 'Not specified'}</p>
            </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                      Hours
                    </h4>
                    <p className="text-gray-600">{descriptionData.hours || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
        
        {/* Form Accordion */}
        <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          openSections.form ? 'shadow-md' : 'shadow-sm'
        }`}>
          <div 
            className={`px-6 py-4 cursor-pointer flex justify-between items-center ${
              openSections.form ? 'bg-[#556B2F]/10' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('form')}
          >
            <div className="flex items-center">
              {formData.applicationMethod === 'form' ? (
                <DocumentTextIcon className="h-5 w-5 text-[#556B2F] mr-2" />
              ) : (
                <EnvelopeIcon className="h-5 w-5 text-[#556B2F] mr-2" />
              )}
              <h3 className="text-lg font-medium text-gray-900">Application Method</h3>
            </div>
            <div className="flex items-center">
              {openSections.form ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
            </div>
          
          {/* Summary when closed */}
          {!openSections.form && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
              <div className="flex items-center">
                <span className="font-medium mr-2">Method:</span> 
                <span>
                  {formData.applicationMethod === 'form' 
                    ? (
                      <>
                        Form Template: <span className="font-medium text-[#556B2F]">{formData.selectedFormTitle || truncateText(formData.selectedFormId, 25) || 'No form selected'}</span>
                      </>
                    ) 
                    : formData.applicationMethod === 'email' 
                      ? 'Via Email' 
                      : 'Not specified'}
                </span>
            </div>
            </div>
          )}
          
          {/* Full details when open */}
          {openSections.form && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Application Method</h4>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#556B2F]/10 text-[#556B2F]">
                    {formData.applicationMethod === 'form' ? (
                      <>
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Form Template
                      </>
                    ) : formData.applicationMethod === 'email' ? (
                      <>
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        Via Email
                      </>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                </div>
                
                {formData.applicationMethod === 'form' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Selected Form</h4>
                      <p className="text-gray-600">
                        {formData.selectedFormTitle || formData.selectedFormId || 'No form selected'}
                      </p>
                    </div>
                    
                    {formDetails.isLoading ? (
                      <div className="py-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#556B2F] border-t-transparent"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading form fields...</p>
                      </div>
                    ) : formDetails.sections && formDetails.sections.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                          Form Preview
                        </h4>
                        
                        <div className="space-y-6">
                          {formDetails.sections.map((section, sectionIndex) => (
                            <div key={section.id || sectionIndex}>
                              <h5 className="text-sm font-medium text-[#556B2F] mb-2">{section.title}</h5>
                              <div className="space-y-3 ml-1">
                                {section.questions && section.questions.map((question, questionIndex) => (
                                  <div key={question.id || questionIndex} className="border-l-2 border-gray-200 pl-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {question.label}
                                      {question.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {renderFieldPreview(question)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : formData.selectedFormId ? (
                      <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-500 text-sm">No form fields found or unable to load form structure.</p>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {formData.applicationMethod === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Contact Emails</h4>
                      {formData.contactEmails && formData.contactEmails.length > 0 ? (
                        <ul className="space-y-1">
                          {formData.contactEmails.map((email, index) => (
                            <li key={index} className="text-gray-600 flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                              {email}
                            </li>
                    ))}
                  </ul>
                      ) : (
                        <p className="text-gray-400 italic">No contact emails provided</p>
                      )}
              </div>
                    
                    {formData.referenceCodes && formData.referenceCodes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Reference Codes</h4>
                  <div className="flex flex-wrap gap-2">
                          {formData.referenceCodes.map((code, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        {code}
                      </span>
                    ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Process Accordion */}
        <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          openSections.process ? 'shadow-md' : 'shadow-sm'
        }`}>
          <div 
            className={`px-6 py-4 cursor-pointer flex justify-between items-center ${
              openSections.process ? 'bg-[#556B2F]/10' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('process')}
          >
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 text-[#556B2F] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Process Flow</h3>
            </div>
            <div className="flex items-center">
              {openSections.process ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
      </div>
          </div>
          
          {/* Summary when closed */}
          {!openSections.process && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
                    <div className="flex items-center">
                <span className="font-medium mr-2">Process:</span> 
                <span>
                  {processData.selectedProcess === 'none' 
                    ? 'No Process Selected' 
                    : processData.selectedProcessName || 'Custom Process'}
                      </span>
                    </div>
            </div>
          )}
          
          {/* Full details when open */}
          {openSections.process && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Process</h4>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#556B2F]/10 text-[#556B2F]">
                    {processData.selectedProcess === 'none' 
                      ? 'No Process Selected' 
                      : processData.selectedProcessName || 'Custom Process'}
                  </div>
                </div>
                
                {processData.selectedProcess !== 'none' && processData.customStages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Process Stages</h4>
                    <div className="relative pl-8 pt-2">
                      {/* Vertical Timeline Line */}
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-[#556B2F]/70 to-[#6B8E23]/70 rounded-full"></div>
                      
                      {/* Get unique stages by creating a Map with stage id as the key */}
                      {Array.from(
                        new Map(
                          processData.customStages.map(stage => [stage.id, stage])
                        ).values()
                      ).map((stage, index) => (
                        <div key={stage.id} className="mb-6 relative">
                          {/* Timeline Node */}
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full shadow-sm flex items-center justify-center z-10 bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white font-medium">
                            {index + 1}
                          </div>
                          
                          {/* Stage Content */}
                          <div className="ml-10">
                            <h5 className="font-medium text-gray-800">{stage.name}</h5>
                            {stage.description && (
                              <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                            )}
                            
                            {stage.statusOptions && stage.statusOptions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {stage.statusOptions.map((status, i) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                    {status}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {processData.selectedProcess === 'none' && (
                  <p className="text-gray-500 italic">
                    No process flow has been configured for this opportunity.
                  </p>
                )}
          </div>
        </div>
      )}
        </div>

        {/* Evaluation Accordion */}
        <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          openSections.evaluation ? 'shadow-md' : 'shadow-sm'
        }`}>
          <div 
            className={`px-6 py-4 cursor-pointer flex justify-between items-center ${
              openSections.evaluation ? 'bg-[#556B2F]/10' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('evaluation')}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-[#556B2F] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Evaluation Template</h3>
            </div>
            <div className="flex items-center">
              {openSections.evaluation ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          
          {/* Summary when closed */}
          {!openSections.evaluation && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
              <div className="flex items-center">
                <span className="font-medium mr-2">Evaluation:</span> 
                <span>
                  {evaluationData?.selectedEvaluationId 
                    ? evaluationData.selectedEvaluationName 
                    : 'No Evaluation Selected'}
                </span>
              </div>
            </div>
          )}
          
          {/* Full details when open */}
          {openSections.evaluation && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Evaluation Template</h4>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#556B2F]/10 text-[#556B2F]">
                    {evaluationData?.selectedEvaluationId 
                      ? evaluationData.selectedEvaluationName 
                      : 'No Evaluation Selected'}
                  </div>
                </div>
                
                {evaluationData?.selectedEvaluationId ? (
                  <div>
                    <p className="text-sm text-gray-600">
                      This evaluation template will be used to assess applicants for this opportunity. 
                      The evaluation criteria and scoring system have been predefined.
                    </p>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> You can access and use this evaluation template when reviewing applications 
                        in the applications management section.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No evaluation template has been selected. Applications will need to be reviewed manually.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-between">
            <button
              type="button"
              onClick={onPrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
            >
              Previous Step
            </button>
            
          <div className="flex space-x-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onPrevious} // This would typically be a save function, but using onPrevious for now
              className="inline-flex items-center px-4 py-2 border border-[#556B2F] shadow-sm text-sm font-medium rounded-md text-[#556B2F] bg-white hover:bg-[#556B2F]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F] disabled:opacity-50"
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Progress'}
            </button>
          
          <button
            type="button"
              disabled={isSubmitting}
              onClick={onSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F] disabled:opacity-50"
          >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Opportunity'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
} 