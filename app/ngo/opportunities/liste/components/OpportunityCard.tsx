'use client';

import Link from 'next/link';
import { 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { type OpportunityType } from '../../services/opportunityService';

interface OpportunityCardProps {
  opportunity: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    hours?: string;
    opportunity_type: OpportunityType;
    created_at: string;
    updated_at: string;
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
  };
  onDelete: (id: string) => void;
}

export default function OpportunityCard({ opportunity, onDelete }: OpportunityCardProps) {
  // Helper function to get opportunity type details
  const getOpportunityTypeDetails = (type: OpportunityType) => {
    switch (type) {
      case 'job':
        return {
          label: 'Job Opportunity',
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'funding':
        return {
          label: 'Funding Opportunity',
          icon: <CurrencyDollarIcon className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'training':
        return {
          label: 'Training Opportunity',
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          label: 'Other',
          icon: <DocumentTextIcon className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const typeDetails = getOpportunityTypeDetails(opportunity.opportunity_type);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeDetails.bgColor} ${typeDetails.color}`}>
                {typeDetails.icon}
                <span className="ml-1">{typeDetails.label}</span>
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {opportunity.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {opportunity.description && (
          <p className="text-sm text-gray-600 mb-4">
            {truncateText(opportunity.description)}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-500">
          {opportunity.location && (
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.hours && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>{opportunity.hours}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>Created {formatDate(opportunity.created_at)}</span>
          </div>
        </div>

        {/* Criteria Summary */}
        {opportunity.criteria && Object.keys(opportunity.criteria).filter(key => 
          key !== 'customFilters' && opportunity.criteria?.[key as keyof typeof opportunity.criteria]
        ).length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center mb-2">
              <TagIcon className="h-4 w-4 mr-1 text-purple-500" />
              <span className="text-xs font-medium text-gray-600">Key Criteria:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(opportunity.criteria)
                .filter(([key, value]) => key !== 'customFilters' && value)
                .slice(0, 3) // Show only first 3 criteria in card
                .map(([field, value]) => (
                  <span key={field} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                ))}
              {Object.keys(opportunity.criteria).filter(key => 
                key !== 'customFilters' && opportunity.criteria?.[key as keyof typeof opportunity.criteria]
              ).length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  +{Object.keys(opportunity.criteria).filter(key => 
                    key !== 'customFilters' && opportunity.criteria?.[key as keyof typeof opportunity.criteria]
                  ).length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              View
            </button>
            
            <Link
              href={`/ngo/opportunities/new?edit=${opportunity.id}`}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="h-3 w-3 mr-1" />
              Edit
            </Link>
          </div>
          
          <button
            onClick={() => onDelete(opportunity.id)}
            className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 