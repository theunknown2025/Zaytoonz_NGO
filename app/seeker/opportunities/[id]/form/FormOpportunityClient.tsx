
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseIcon, 
  BanknotesIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  ClockIcon,
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  IdentificationIcon,
  UserIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { type Opportunity } from '@/app/lib/opportunities';

interface FormOpportunityClientProps {
  opportunity: Opportunity;
}

interface FormData {
  [key: string]: string | string[];
}

export default function FormOpportunityClient({ opportunity }: FormOpportunityClientProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Debug logging
  console.log('FormOpportunityClient - opportunity:', opportunity);
  console.log('FormOpportunityClient - applicationForm:', opportunity.applicationForm);
  console.log('FormOpportunityClient - form_structure:', opportunity.applicationForm?.form_structure);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'job': return <BriefcaseIcon className="w-6 h-6" />;
      case 'funding': return <BanknotesIcon className="w-6 h-6" />;
      case 'training': return <AcademicCapIcon className="w-6 h-6" />;
      default: return <BriefcaseIcon className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'funding': return 'bg-green-50 text-green-700 border-green-200';
      case 'training': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', text: 'Expired', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (diffDays <= 3) {
      return { type: 'urgent', text: `${diffDays} days left`, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else if (diffDays <= 7) {
      return { type: 'soon', text: `${diffDays} days left`, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    } else {
      return { type: 'normal', text: `${diffDays} days left`, color: 'text-green-600 bg-green-50 border-green-200' };
    }
  };

  const parseDescription = (description: string) => {
    if (!description) return [];
    
    const lines = description.split('\n');
    const sections: Array<{ title?: string; content: string }> = [];
    let currentSection: { title?: string; content: string } = { content: '' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      const titleMatch = trimmedLine.match(/^\*\*(.+?)\*\*$/);
      
      if (titleMatch) {
        if (currentSection.content.trim() || currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = { title: titleMatch[1], content: '' };
      } else if (trimmedLine) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentSection.content.trim() || currentSection.title) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const FormattedDescription = ({ description }: { description: string }) => {
    const sections = parseDescription(description);
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            {section.title && (
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {section.title}
              </h3>
            )}
            {section.content && (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (opportunity.applicationForm?.form_structure) {
      opportunity.applicationForm.form_structure.forEach((section: any) => {
        if (section.questions) {
          section.questions.forEach((question: any) => {
            if (question.required) {
              const value = formData[question.id];
              if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
                newErrors[question.id] = `${question.label} is required`;
              }
            }
          });
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (question: any) => {
    const value = formData[question.id] || '';
    const error = errors[question.id];
    
    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={question.type}
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {question.options?.map((option: string, index: number) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(value as string[])?.includes(option) || false}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || [];
                      if (e.target.checked) {
                        handleInputChange(question.id, [...currentValues, option]);
                      } else {
                        handleInputChange(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );
    }
  };

  const renderFormPreview = (question: any) => {
    const getFieldTypeDisplay = (type: string) => {
      switch (type) {
        case 'text': return 'Text Input';
        case 'email': return 'Email Address';
        case 'tel': return 'Phone Number';
        case 'textarea': return 'Long Text';
        case 'select': return 'Multiple Choice';
        case 'checkbox': return 'Checkbox Selection';
        default: return 'Text Input';
      }
    };

    return (
      <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Type: {getFieldTypeDisplay(question.type)}
            </p>
            {question.placeholder && (
              <p className="text-sm text-gray-500 italic">
                Placeholder: "{question.placeholder}"
              </p>
            )}
            {question.options && question.options.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Options:</p>
                <div className="flex flex-wrap gap-1">
                  {question.options.map((option: string, index: number) => (
                    <span key={index} className="inline-block bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="ml-3">
            {question.required ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Optional
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const categoryIcon = getCategoryIcon(opportunity.category);
  const categoryColor = getCategoryColor(opportunity.category);
  const deadlineStatus = getDeadlineStatus(opportunity.deadline);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your application for <strong>{opportunity.title}</strong> has been successfully submitted to {opportunity.organization}.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Opportunities
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Opportunities</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 bg-purple-50 px-3 py-1 rounded-full font-medium">
                <IdentificationIcon className="w-4 h-4 inline mr-1" />
                Form Application
              </span>
              <button
                onClick={toggleSave}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isSaved 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                }`}
              >
                {isSaved ? (
                  <HeartSolidIcon className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Opportunity Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${categoryColor}`}>
              {categoryIcon}
              <span className="capitalize">{opportunity.category}</span>
            </div>
            
            {deadlineStatus && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${deadlineStatus.color}`}>
                <CalendarDaysIcon className="w-4 h-4" />
                {deadlineStatus.text}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {opportunity.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            {opportunity.organizationProfile?.profileImage ? (
              <img 
                src={opportunity.organizationProfile.profileImage} 
                alt={opportunity.organization}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <BuildingOfficeIcon className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{opportunity.organization}</h2>
              <p className="text-gray-600">Posted {opportunity.posted}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {opportunity.location && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{opportunity.location}</p>
                </div>
              </div>
            )}

            {opportunity.compensation && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BanknotesIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Compensation</p>
                  <p className="font-medium text-gray-900">{opportunity.compensation}</p>
                </div>
              </div>
            )}

            {opportunity.type && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900">{opportunity.type}</p>
                </div>
              </div>
            )}

            {opportunity.deadline && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-medium text-gray-900">{opportunity.deadline}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
              </div>
              <FormattedDescription description={opportunity.description || ''} />
            </div>

            {/* Form Preview Section */}
            {opportunity.applicationForm?.form_structure && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <IdentificationIcon className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Application Form Preview</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Here's what you'll need to complete when applying for this opportunity:
                </p>
                <div className="space-y-6">
                  {opportunity.applicationForm.form_structure.map((section: any, sectionIndex: number) => (
                    <div key={section.id || sectionIndex} className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {section.questions?.length || 0} {section.questions?.length === 1 ? 'field' : 'fields'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {section.questions?.map((question: any) => renderFormPreview(question))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Application Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Have all required information ready before starting</li>
                        <li>• Fields marked with * are required and must be completed</li>
                        <li>• You can scroll down to start filling out the actual form</li>
                        <li>• Review all sections before submitting your application</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Instructions */}
            {opportunity.applicationForm?.instructions && (
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5" />
                  Application Instructions
                </h3>
                <div className="text-purple-800 whitespace-pre-wrap">
                  {opportunity.applicationForm.instructions}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Application Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <IdentificationIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {opportunity.applicationForm?.title || 'Application Form'}
                </h2>
              </div>

              {opportunity.applicationForm?.form_structure && opportunity.applicationForm.form_structure.length > 0 ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {opportunity.applicationForm.form_structure.map((section: any, sectionIndex: number) => (
                    <div key={section.id || sectionIndex} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        {section.title}
                      </h3>
                      <div className="space-y-4">
                        {section.questions?.map((question: any) => renderFormField(question))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Submit Application
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    By submitting, you agree to our terms and conditions
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Available</h3>
                  <p className="text-gray-600 mb-4">
                    This opportunity does not have an application form configured.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-700 mb-2"><strong>Debug Info:</strong></p>
                    <p className="text-xs text-gray-600">
                      Application Form: {opportunity.applicationForm ? 'Present' : 'Missing'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Form Structure: {opportunity.applicationForm?.form_structure ? 'Present' : 'Missing'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Structure Length: {opportunity.applicationForm?.form_structure?.length || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 