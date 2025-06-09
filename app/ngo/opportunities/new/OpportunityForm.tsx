'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, EnvelopeIcon, PlusIcon, XMarkIcon, EyeIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { getUserForms, getPublishedForms, getFormById } from '../../resources/tools/FormMaker/services/formService';
import { saveOpportunityFormSettings } from '../services/opportunityFormService';
import { toast } from 'react-hot-toast';

interface FormTemplate {
  id: string;
  title: string;
  status: string;
  published?: boolean;
}

interface OpportunityFormProps {
  opportunityId?: string;
  formData: {
    applicationMethod: 'form' | 'email' | '';
    selectedFormId: string;
    contactEmails?: string[];
    referenceCodes?: string[];
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onApplicationMethodChange: (method: 'form' | 'email') => void;
  onEmailsChange: (emails: string[]) => void;
  onReferenceCodesChange: (codes: string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function OpportunityForm({
  opportunityId = 'temp-id',
  formData,
  onChange,
  onApplicationMethodChange,
  onEmailsChange,
  onReferenceCodesChange,
  onPrevious,
  onNext
}: OpportunityFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [selectedFormDetails, setSelectedFormDetails] = useState<any>(null);
  const [isLoadingFormDetails, setIsLoadingFormDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for email input
  const [newEmail, setNewEmail] = useState('');
  // State for reference code input
  const [newReferenceCode, setNewReferenceCode] = useState('');

  useEffect(() => {
    if (formData.applicationMethod === 'form') {
      fetchFormTemplates();
    }
  }, [formData.applicationMethod]);

  // Fetch form details when a form is selected
  useEffect(() => {
    if (formData.selectedFormId) {
      fetchFormDetails(formData.selectedFormId);
    } else {
      setSelectedFormDetails(null);
    }
  }, [formData.selectedFormId]);

  const fetchFormDetails = async (formId: string) => {
    setIsLoadingFormDetails(true);
    try {
      const result = await getFormById(formId);
      if (result.success && result.form) {
        setSelectedFormDetails(result.form);
        console.log("Fetched form details:", result.form);
      } else {
        console.error("Failed to fetch form details:", result.error);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
    } finally {
      setIsLoadingFormDetails(false);
    }
  };

  const fetchFormTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const result = await getPublishedForms();
      if (result.success && Array.isArray(result.forms)) {
        console.log("Fetched published forms:", result.forms);
        
        const publishedForms = result.forms.map(form => ({
          id: form.id,
          title: form.title || 'Untitled Form',
          status: form.status,
          published: form.published
        }));
           
        console.log("Mapped form templates:", publishedForms);
        setFormTemplates(publishedForms);
      } else {
        console.error("Error fetching forms or invalid data format:", result);
      }
    } catch (error) {
      console.error('Error fetching form templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.applicationMethod) {
      newErrors.applicationMethod = 'Please select an application method';
    }

    if (formData.applicationMethod === 'form' && !formData.selectedFormId) {
      newErrors.selectedFormId = 'Please select a form template';
    }

    if (formData.applicationMethod === 'email') {
      if (!formData.contactEmails || formData.contactEmails.length === 0) {
        newErrors.contactEmails = 'Please add at least one contact email';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleAddEmail = () => {
    if (!newEmail) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrors(prev => ({ ...prev, newEmail: 'Please enter a valid email address' }));
      return;
    }
    
    // Clear any previous error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.newEmail;
      delete newErrors.contactEmails;
      return newErrors;
    });
    
    const updatedEmails = [...(formData.contactEmails || []), newEmail];
    onEmailsChange(updatedEmails);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    const updatedEmails = (formData.contactEmails || []).filter(e => e !== email);
    onEmailsChange(updatedEmails);
  };

  const handleAddReferenceCode = () => {
    if (!newReferenceCode) return;
    
    const updatedCodes = [...(formData.referenceCodes || []), newReferenceCode];
    onReferenceCodesChange(updatedCodes);
    setNewReferenceCode('');
  };

  const handleRemoveReferenceCode = (code: string) => {
    const updatedCodes = (formData.referenceCodes || []).filter(c => c !== code);
    onReferenceCodesChange(updatedCodes);
  };

  // Render a form section
  const renderFormSection = (section: any, sectionIndex: number) => {
    return (
      <div key={section.id || sectionIndex} className="mb-6">
        <h3 className="text-lg font-medium text-[#556B2F] mb-3 border-b pb-2">{section.title}</h3>
        <div className="space-y-4">
          {section.questions && section.questions.map((question: any, questionIndex: number) => (
            <div key={question.id || questionIndex} className="py-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {renderFormField(question)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a form field based on its type
  const renderFormField = (question: any) => {
    switch (question.type) {
      case 'text':
        return (
          <input 
            type="text" 
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
            placeholder={question.placeholder || ''}
            disabled
          />
        );
      case 'textarea':
        return (
          <textarea 
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
            rows={3}
            placeholder={question.placeholder || ''}
            disabled
          />
        );
      case 'select':
        return (
          <select 
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
            disabled
          >
            <option value="">Select an option</option>
            {question.options && question.options.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options && question.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center">
                <input 
                  type="radio" 
                  name={`question-${question.id}`}
                  className="h-4 w-4 text-[#556B2F] border-gray-300 focus:ring-[#556B2F]"
                  disabled
                />
                <label className="ml-2 text-sm text-gray-700">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options && question.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center">
                <input 
                  type="checkbox"
                  className="h-4 w-4 text-[#556B2F] border-gray-300 rounded focus:ring-[#556B2F]"
                  disabled
                />
                <label className="ml-2 text-sm text-gray-700">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'date':
        return (
          <input 
            type="date" 
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
            disabled
          />
        );
      case 'file':
        return (
          <div className="mt-1 flex items-center">
            <button
              type="button"
              className="mr-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              disabled
            >
              Upload a file
            </button>
            <span className="text-sm text-gray-500">No file selected</span>
          </div>
        );
      default:
        return (
          <input 
            type="text" 
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
            disabled
          />
        );
    }
  };

  // Handle save progress
  const handleSaveProgress = async () => {
    if (!formData.applicationMethod) {
      setErrors(prev => ({
        ...prev,
        applicationMethod: 'Please select an application method before saving'
      }));
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveOpportunityFormSettings(
        opportunityId,
        formData.applicationMethod,
        {
          selectedFormId: formData.selectedFormId,
          contactEmails: formData.contactEmails,
          referenceCodes: formData.referenceCodes
        }
      );

      if (result.success) {
        toast.success('Application method settings saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save progress');
        console.error('Error saving form settings:', result.error);
      }
    } catch (error) {
      console.error('Exception saving form settings:', error);
      toast.error('An error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide more specific information about the opportunity.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would applicants apply to the opportunity?
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.applicationMethod === 'form' 
                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/20' 
                  : 'border-gray-200 hover:border-[#556B2F]/30'
              }`}
              onClick={() => onApplicationMethodChange('form')}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${
                formData.applicationMethod === 'form' 
                  ? 'bg-[#556B2F] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  formData.applicationMethod === 'form' ? 'text-[#556B2F]' : 'text-gray-700'
                }`}>
                  Use Form Template
                </p>
                <p className="text-xs text-gray-500">
                  Use a form template from the Form Maker tool
                </p>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.applicationMethod === 'email' 
                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/20' 
                  : 'border-gray-200 hover:border-[#556B2F]/30'
              }`}
              onClick={() => onApplicationMethodChange('email')}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${
                formData.applicationMethod === 'email' 
                  ? 'bg-[#556B2F] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <EnvelopeIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  formData.applicationMethod === 'email' ? 'text-[#556B2F]' : 'text-gray-700'
                }`}>
                  Via Email
                </p>
                <p className="text-xs text-gray-500">
                  Applicants will contact you via email
                </p>
              </div>
            </div>
          </div>
        </div>

        {formData.applicationMethod === 'form' && (
          <div>
            <label htmlFor="selectedFormId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Form Template
            </label>
            <div className="mt-1 relative rounded-md shadow-sm group">
              <select
                id="selectedFormId"
                name="selectedFormId"
                value={formData.selectedFormId}
                onChange={onChange}
                className={`block w-full border border-gray-300 rounded-md shadow-sm 
                  focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] 
                  group-hover:border-[#556B2F]/30 transition-all duration-200
                  text-base sm:text-sm py-2 pl-3 pr-10 ${
                  errors.selectedFormId ? 'border-red-300 bg-red-50' : ''
                }`}
              >
                <option value="">Select a form template</option>
                {isLoadingTemplates ? (
                  <option disabled>Loading templates...</option>
                ) : (
                  formTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.title} {template.published ? '(Published)' : template.status === 'published' ? '(Published)' : ''}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.selectedFormId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.selectedFormId}
              </p>
            )}
            {formTemplates.length === 0 && !isLoadingTemplates && (
              <p className="mt-2 text-sm text-amber-600">
                No published form templates found. Please create and publish a form in the Form Maker tool first.
              </p>
            )}
            {formData.selectedFormId && (
              <p className="mt-2 text-xs text-green-600">
                Selected form will be used for applicants to apply to this opportunity.
              </p>
            )}
            
            {/* Form Preview Section */}
            {formData.selectedFormId && (
              <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#556B2F]/10 to-[#6B8E23]/10 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#556B2F] flex items-center">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Form Preview
                  </h3>
                  <span className="bg-[#556B2F]/10 text-[#556B2F] px-2 py-0.5 rounded-full text-xs font-medium">
                    Display Mode
                  </span>
                </div>
                
                <div className="p-4">
                  {isLoadingFormDetails ? (
                    <div className="py-12 flex justify-center items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-500">Loading form details...</span>
                    </div>
                  ) : selectedFormDetails ? (
                    <div>
                      <div className="mb-6 pb-4 border-b border-dashed border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedFormDetails.title}</h2>
                        {selectedFormDetails.description && (
                          <p className="text-sm text-gray-600">{selectedFormDetails.description}</p>
                        )}
                      </div>
                      
                      {/* Render form sections */}
                      {selectedFormDetails.sections && Array.isArray(selectedFormDetails.sections) ? (
                        selectedFormDetails.sections.map((section: any, index: number) => 
                          renderFormSection(section, index)
                        )
                      ) : typeof selectedFormDetails.sections === 'object' ? (
                        <div className="mb-6">
                          <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
                            This form template might be in a different format. Please view it in the Form Maker tool.
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <div className="p-4 bg-gray-50 text-gray-500 rounded-md">
                            No form sections found.
                          </div>
                        </div>
                      )}
                      
                      {/* Submit button preview */}
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="py-2 px-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white font-medium rounded-md opacity-50 cursor-not-allowed"
                          disabled
                        >
                          Submit Application
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="text-gray-400 mb-2">
                        <DocumentTextIcon className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500">Select a form template to preview it</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Debug information - hidden by default */}
            <div className="mt-4">
              <button 
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-500 underline"
              >
                {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
              </button>
              
              {showDebug && (
                <div className="mt-2 border border-gray-200 rounded p-3 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700">Debug Information</h4>
                  <div className="mt-2 text-xs font-mono overflow-auto max-h-40">
                    <p>Available Templates: {formTemplates.length}</p>
                    <pre className="mt-1 text-xs">{JSON.stringify(formTemplates, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {formData.applicationMethod === 'email' && (
          <div className="space-y-6">
            {/* Contact Emails */}
            <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-[#556B2F]/5 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-[#556B2F]/5 rounded-full"></div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Emails
                </label>
                <p className="mt-1 text-xs text-gray-500 mb-3">
                  Add one or more email addresses that applicants can use to contact you
                </p>
                
                <div className="mt-2 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Add an email address"
                      className="pl-10 pr-3 py-2 block w-full border-gray-300 rounded-md rounded-r-none shadow-sm 
                        focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] 
                        group-hover:border-[#556B2F]/30 transition-all duration-200
                        text-base sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-white bg-[#556B2F] hover:bg-[#556B2F]/90 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {errors.newEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.newEmail}
                  </p>
                )}
                
                {errors.contactEmails && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.contactEmails}
                  </p>
                )}
                
                {/* Display list of added emails */}
                {formData.contactEmails && formData.contactEmails.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Emails:</h4>
                    <ul className="mt-2 space-y-2">
                      {formData.contactEmails.map((email, index) => (
                        <li key={index} className="flex items-center justify-between py-2 px-3 bg-[#556B2F]/5 rounded-md border border-[#556B2F]/10">
                          <span className="text-sm text-gray-800 flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-[#556B2F] mr-2" />
                            {email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Reference Codes */}
            <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-[#556B2F]/5 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-[#556B2F]/5 rounded-full"></div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Codes (Optional)
                </label>
                <p className="mt-1 text-xs text-gray-500 mb-3">
                  Add reference codes that applicants should include in their email
                </p>
                
                <div className="mt-2 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newReferenceCode}
                      onChange={(e) => setNewReferenceCode(e.target.value)}
                      placeholder="Add a reference code"
                      className="pl-10 pr-3 py-2 block w-full border-gray-300 rounded-md rounded-r-none shadow-sm 
                        focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] 
                        group-hover:border-[#556B2F]/30 transition-all duration-200
                        text-base sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddReferenceCode}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-white bg-[#556B2F] hover:bg-[#556B2F]/90 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Display list of added reference codes */}
                {formData.referenceCodes && formData.referenceCodes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Reference Codes:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.referenceCodes.map((code, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#556B2F]/10 text-[#556B2F] group">
                          {code}
                          <button
                            type="button"
                            onClick={() => handleRemoveReferenceCode(code)}
                            className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center text-[#556B2F]/60 hover:text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-5">
        <div className="flex justify-between">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onPrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
            >
              Previous Step
            </button>
            
            <button
              type="button"
              onClick={handleSaveProgress}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-[#556B2F] text-sm font-medium rounded-md shadow-sm text-[#556B2F] bg-white hover:bg-[#556B2F]/5 transition-all duration-200 ${
                isSaving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
} 