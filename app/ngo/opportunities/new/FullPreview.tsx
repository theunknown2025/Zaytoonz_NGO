'use client';

import { formatDescriptionForDisplay } from './formatDescription';
import {
  XMarkIcon,
  DocumentTextIcon,
  MapPinIcon,
  ClockIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

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

interface CriteriaSelection {
  contractType?: string;
  level?: string;
  sector?: string;
  location?: string;
  country?: string;
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
}

interface FullPreviewProps {
  isOpen: boolean;
  onClose: () => void;
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
  criteria?: CriteriaSelection;
  formDetails?: {
    sections: FormSection[];
  };
}

const getOpportunityTypeDetails = (type: string) => {
  switch (type) {
    case 'job':
      return {
        label: 'Job Opportunity',
        icon: <BriefcaseIcon className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    case 'funding':
      return {
        label: 'Funding Opportunity',
        icon: <CurrencyDollarIcon className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    case 'training':
      return {
        label: 'Training Opportunity',
        icon: <AcademicCapIcon className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      };
    default:
      return {
        label: 'Not specified',
        icon: <DocumentTextIcon className="h-5 w-5" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      };
  }
};

const getCriteriaFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    contractType: 'Contract Type',
    level: 'Level',
    sector: 'Sector/Industry',
    location: 'Location',
    country: 'Country',
    fundingType: 'Type',
    eligibility: 'Eligibility',
    amountRange: 'Amount Range',
    purpose: 'Purpose',
    format: 'Format',
    duration: 'Duration',
    certification: 'Certification',
    cost: 'Cost',
    deadline: 'Deadline'
  };
  return labels[field] || field;
};

export default function FullPreview({
  isOpen,
  onClose,
  descriptionData,
  formData,
  processData,
  evaluationData,
  opportunityType = '',
  criteria = {},
  formDetails = { sections: [] }
}: FullPreviewProps) {
  if (!isOpen) return null;

  const typeDetails = getOpportunityTypeDetails(opportunityType);
  const hasCriteria = Object.entries(criteria).some(
    ([key, value]) => key !== 'customFilters' && value
  );
  const customFilters = criteria?.customFilters || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Full Opportunity Preview</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Close preview"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-6 space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold text-[#556B2F] mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-4">
                {opportunityType && (
                  <div>
                    <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${typeDetails.bgColor} ${typeDetails.color}`}>
                      {typeDetails.icon}
                      <span className="ml-2">{typeDetails.label}</span>
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Title</h4>
                  <p className="text-xl font-semibold text-gray-900">{descriptionData.title || 'Untitled'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                      Location
                    </h4>
                    <p className="text-gray-900">{descriptionData.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                      Hours
                    </h4>
                    <p className="text-gray-900">{descriptionData.hours || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Description - Full & Larger */}
            <section>
              <h3 className="text-lg font-semibold text-[#556B2F] mb-4">Description</h3>
              <div className="prose prose-lg max-w-none text-gray-700 border border-gray-200 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                {descriptionData.description ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: formatDescriptionForDisplay(descriptionData.description)
                    }}
                  />
                ) : (
                  <p className="text-gray-400 italic">No description provided</p>
                )}
              </div>
            </section>

            {/* Criteria */}
            {(hasCriteria || Object.keys(customFilters).length > 0) && (
              <section>
                <h3 className="text-lg font-semibold text-[#556B2F] mb-4">Opportunity Criteria</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(criteria).map(([field, value]) => {
                    if (!value || field === 'customFilters') return null;
                    return (
                      <span
                        key={field}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#556B2F]/10 text-[#556B2F]"
                      >
                        {getCriteriaFieldLabel(field)}: {value}
                      </span>
                    );
                  })}
                  {Object.entries(customFilters).map(([name, value]) => (
                    <span
                      key={`custom-${name}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#6B8E23]/10 text-[#6B8E23]"
                    >
                      {name}: {value}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Application Method */}
            <section>
              <h3 className="text-lg font-semibold text-[#556B2F] mb-4 flex items-center">
                {formData.applicationMethod === 'form' ? (
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                ) : (
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                )}
                Application Method
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  {formData.applicationMethod === 'form'
                    ? `Form Template: ${formData.selectedFormTitle || formData.selectedFormId || 'No form selected'}`
                    : formData.applicationMethod === 'email'
                      ? 'Via Email'
                      : 'Not specified'}
                </p>
                {formData.applicationMethod === 'form' &&
                  formDetails.sections &&
                  formDetails.sections.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Form Structure</h4>
                      {formDetails.sections.map((section, i) => (
                        <div key={section.id || i} className="mb-4 last:mb-0">
                          <h5 className="text-sm font-medium text-[#556B2F] mb-2">
                            {section.title}
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1 ml-4">
                            {section.questions?.map((q, j) => (
                              <li key={q.id || j}>
                                • {q.label}
                                {q.required && <span className="text-red-500">*</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                {formData.applicationMethod === 'email' &&
                  formData.contactEmails &&
                  formData.contactEmails.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Contact Emails
                      </h4>
                      <ul className="space-y-1">
                        {formData.contactEmails.map((email, i) => (
                          <li
                            key={i}
                            className="flex items-center text-gray-600"
                          >
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-[#556B2F]" />
                            {email}
                          </li>
                        ))}
                      </ul>
                      {formData.referenceCodes &&
                        formData.referenceCodes.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Reference Codes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {formData.referenceCodes.map((code, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-sm"
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
              </div>
            </section>

            {/* Process Flow */}
            <section>
              <h3 className="text-lg font-semibold text-[#556B2F] mb-4 flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Process Flow
              </h3>
              <p className="text-gray-700">
                {processData.selectedProcess === 'none'
                  ? 'No Process Selected'
                  : processData.selectedProcessName || 'Custom Process'}
              </p>
              {processData.customStages.length > 0 && (
                <div className="mt-4 relative pl-8">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-[#556B2F]/70 to-[#6B8E23]/70 rounded-full" />
                  {Array.from(
                    new Map(processData.customStages.map((s) => [s.id, s])).values()
                  ).map((stage, i) => (
                    <div key={stage.id} className="mb-6 relative">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white font-medium text-sm">
                        {i + 1}
                      </div>
                      <div className="ml-10">
                        <h5 className="font-medium text-gray-800">{stage.name}</h5>
                        {stage.description && (
                          <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                        )}
                        {stage.statusOptions?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {stage.statusOptions.map((status, j) => (
                              <span
                                key={j}
                                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                              >
                                {status}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Evaluation */}
            <section>
              <h3 className="text-lg font-semibold text-[#556B2F] mb-4">
                Evaluation Template
              </h3>
              <p className="text-gray-700">
                {evaluationData?.selectedEvaluationId
                  ? evaluationData.selectedEvaluationName
                  : 'No Evaluation Selected'}
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
