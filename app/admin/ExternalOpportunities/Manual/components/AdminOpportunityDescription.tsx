'use client';

import { useState, useEffect, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { saveAdminOpportunityProgress, getAdminOpportunityProgress } from '../services/adminOpportunityService';

// Dynamically import the RichTextEditor component
const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md p-6 bg-gray-50 animate-pulse flex flex-col justify-center items-center h-64">
      <div className="w-12 h-12 rounded-full bg-[#556B2F]/20 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-[#556B2F]/40 animate-pulse" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
      <div className="text-gray-500 text-center">
        <p className="mb-1 font-medium">Loading rich text editor...</p>
        <p className="text-xs text-gray-400">This may take a moment</p>
      </div>
    </div>
  )
});

interface AdminOpportunityDescriptionProps {
  formData: {
    title: string;
    description: string;
    location: string;
    hours: string;
    opportunityType: 'job' | 'funding' | 'training' | '';
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => void;
  onNext: () => void;
  opportunityId: string;
  onCriteriaChange?: (criteria: CriteriaSelection) => void;
}

// Add interface for criteria selection
interface CriteriaSelection {
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
}

export default function AdminOpportunityDescription({ 
  formData, 
  onChange, 
  onNext, 
  opportunityId, 
  onCriteriaChange 
}: AdminOpportunityDescriptionProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Add state for criteria selection
  const [criteria, setCriteria] = useState<CriteriaSelection>({});
  // Add state for custom filters
  const [customFilters, setCustomFilters] = useState<{ [key: string]: string }>({});
  const [newCustomFilterName, setNewCustomFilterName] = useState('');
  const [newCustomFilterValue, setNewCustomFilterValue] = useState('');
  
  // Use a ref to track if we've already loaded data to prevent multiple calls
  const dataLoadedRef = useRef(false);

  // Load saved progress when component mounts
  useEffect(() => {
    // Skip if we've already loaded data
    if (dataLoadedRef.current) {
      return;
    }
    
    const loadSavedProgress = async () => {
      setLoadingProgress(true);
      try {
        // Pass the opportunityId to load progress for this specific opportunity
        const { data, error } = await getAdminOpportunityProgress(opportunityId);
        
        if (error) {
          console.error('Error loading saved progress:', error);
          return;
        }
        
        if (data) {
          console.log('Loaded saved progress:', data);
          
          // Update standard form fields
          if (data.title) {
            onChange({ target: { name: 'title', value: data.title } });
          }
          
          if (data.description) {
            onChange({ target: { name: 'description', value: data.description } });
          }
          
          if (data.location) {
            onChange({ target: { name: 'location', value: data.location } });
          }
          
          if (data.hours) {
            onChange({ target: { name: 'hours', value: data.hours } });
          }
          
          // Load criteria from dedicated column if available
          if (data.criteria && typeof data.criteria === 'object') {
            setCriteria(data.criteria);
            
            // Load custom filters if available
            if (data.criteria.customFilters && typeof data.criteria.customFilters === 'object') {
              setCustomFilters(data.criteria.customFilters);
            }
          }
          // Fallback: Load criteria from metadata (for backward compatibility)
          else if (data.metadata && data.metadata.criteria && typeof data.metadata.criteria === 'object') {
            setCriteria(data.metadata.criteria);
            
            // Load custom filters if available
            if (data.metadata.criteria.customFilters && typeof data.metadata.criteria.customFilters === 'object') {
              setCustomFilters(data.metadata.criteria.customFilters);
            }
          }
        }
        
        // Mark data as loaded
        dataLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading saved progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };
    
    loadSavedProgress();
  }, []); // Empty dependency array - only run on mount

  // Handle TinyMCE editor change
  const handleEditorChange = (content: string) => {
    onChange({
      target: {
        name: 'description',
        value: content
      }
    });
    if (!editorReady) setEditorReady(true);
  };

  // Criteria options based on opportunity type
  const getCriteriaOptions = (opportunityType: string) => {
    const options = {
      job: {
        contractType: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Temporary'],
        level: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
        sector: ['Tech', 'Education', 'Health', 'Arts', 'Environment', 'Social Services', 'Finance', 'Marketing', 'Other'],
        location: ['Onsite', 'Remote', 'Hybrid']
      },
      funding: {
        fundingType: ['Grant', 'Prize', 'Scholarship', 'Seed funding', 'VC investment'],
        eligibility: ['Individuals', 'NGOs', 'Startups', 'Students', 'Researchers'],
        amountRange: ['Under €1,000', '€1,000 - €5,000', '€5,000 - €10,000', '€10,000 - €25,000', '€25,000 - €50,000', 'Over €50,000'],
        purpose: ['Research', 'Entrepreneurship', 'Community development', 'Education', 'Innovation', 'Social impact']
      },
      training: {
        format: ['Online', 'Offline', 'Hybrid'],
        duration: ['Short course', 'Bootcamp', 'Multi-month program'],
        level: ['Beginner', 'Intermediate', 'Advanced'],
        certification: ['Yes', 'No'],
        cost: ['Free', 'Partial funding', 'Paid']
      }
    };
    
    return options[opportunityType as keyof typeof options] || {};
  };

  // Handle criteria change
  const handleCriteriaChange = (field: string, value: string) => {
    const newCriteria = {
      ...criteria,
      [field]: value
    };
    setCriteria(newCriteria);
    
    // Notify parent component
    if (onCriteriaChange) {
      onCriteriaChange(newCriteria);
    }
  };

  // Handle custom filter addition
  const handleAddCustomFilter = () => {
    if (!newCustomFilterName.trim() || !newCustomFilterValue.trim()) {
      return;
    }
    
    const newCustomFilters = {
      ...customFilters,
      [newCustomFilterName.trim()]: newCustomFilterValue.trim()
    };
    
    setCustomFilters(newCustomFilters);
    
    // Update criteria with custom filters
    const newCriteria = {
      ...criteria,
      customFilters: newCustomFilters
    };
    setCriteria(newCriteria);
    
    // Notify parent component
    if (onCriteriaChange) {
      onCriteriaChange(newCriteria);
    }
    
    // Clear input fields
    setNewCustomFilterName('');
    setNewCustomFilterValue('');
  };

  // Handle custom filter removal
  const handleRemoveCustomFilter = (filterName: string) => {
    const newCustomFilters = { ...customFilters };
    delete newCustomFilters[filterName];
    setCustomFilters(newCustomFilters);
    
    // Update criteria with custom filters
    const newCriteria = {
      ...criteria,
      customFilters: newCustomFilters
    };
    setCriteria(newCriteria);
    
    // Notify parent component
    if (onCriteriaChange) {
      onCriteriaChange(newCriteria);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  // Handle saving progress to the database
  const handleSaveProgress = async () => {
    console.log("Save Progress button clicked");
    setIsSaving(true);
    try {
      // Create metadata object to store criteria-related information
      const metadata = {
        criteria // Include criteria selection
      };
      
      // Prepare data for saving
      const progressData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        hours: formData.hours,
        status: 'draft',
        step: 'description',
        metadata: metadata,
        criteria: criteria, // Include criteria data
        opportunity_id: opportunityId
      };

      console.log("Saving data:", progressData);

      // Save to database
      const result = await saveAdminOpportunityProgress(progressData);
      
      console.log("Save result:", result);
      
      if (result.error) {
        console.error("Save error:", result.error);
        toast.error('Failed to save progress: ' + result.error.message);
      } else {
        toast.success('Progress saved successfully!');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('An error occurred while saving progress');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProgress) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#556B2F] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading your saved progress...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Start by providing basic details about the opportunity.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 flex items-center">
              <span className="bg-[#556B2F]/10 text-[#556B2F] p-1 rounded-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
              Opportunity Title *
            </label>
            <span className="text-xs text-gray-500">
              {formData.title.length}/100 characters
            </span>
          </div>

          <div className="mt-1 relative rounded-md shadow-sm group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#556B2F]/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <input
              type="text"
              name="title"
              id="title"
              maxLength={100}
              value={formData.title}
              onChange={onChange}
              className={`pl-10 pr-3 py-3 block w-full border-gray-300 rounded-md shadow-sm 
                focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] 
                group-hover:border-[#556B2F]/30 transition-all duration-200
                text-base ${
                errors.title ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="e.g., Volunteer Teacher for After-School Program"
            />
            {formData.title.length > 0 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs">
                  {formData.title.length > 0 ? '✓' : ''}
                </span>
              </div>
            )}
          </div>

          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.title}
            </p>
          )}
          
          <p className="mt-1 text-xs text-gray-500 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-[#556B2F]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Create a clear, descriptive title that will attract the right applicants. Aim for 5-10 words that highlight the opportunity's core purpose.
            </span>
          </p>
        </div>

        {/* Criteria Selection Section */}
        {formData.opportunityType && (
          <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-xl p-6 border border-[#556B2F]/10 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#556B2F] text-white text-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#556B2F]">Opportunity Criteria</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Select relevant criteria to help applicants understand the opportunity better.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(getCriteriaOptions(formData.opportunityType)).map(([field, options]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field === 'contractType' ? 'Contract Type' :
                     field === 'level' ? 'Level' :
                     field === 'sector' ? 'Sector/Industry' :
                     field === 'location' ? 'Location' :
                     field === 'fundingType' ? 'Type' :
                     field === 'eligibility' ? 'Eligibility' :
                     field === 'amountRange' ? 'Amount Range' :
                     field === 'purpose' ? 'Purpose' :
                     field === 'format' ? 'Format' :
                     field === 'duration' ? 'Duration' :
                     field === 'certification' ? 'Certification' :
                     field === 'cost' ? 'Cost' :
                     field}
                  </label>
                  <select
                    value={typeof criteria[field as keyof CriteriaSelection] === 'string' ? criteria[field as keyof CriteriaSelection] as string : ''}
                    onChange={(e) => handleCriteriaChange(field, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10 hover:border-[#556B2F]/50 transition-colors"
                  >
                    <option value="">Select {field === 'contractType' ? 'contract type' :
                     field === 'level' ? 'level' :
                     field === 'sector' ? 'sector' :
                     field === 'location' ? 'location' :
                     field === 'fundingType' ? 'funding type' :
                     field === 'eligibility' ? 'eligibility' :
                     field === 'amountRange' ? 'amount range' :
                     field === 'purpose' ? 'purpose' :
                     field === 'format' ? 'format' :
                     field === 'duration' ? 'duration' :
                     field === 'certification' ? 'certification' :
                     field === 'cost' ? 'cost' :
                     field}...</option>
                    {options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              {/* Cross-cutting filter - Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline / Application Period
                </label>
                <input
                  type="date"
                  value={criteria.deadline || ''}
                  onChange={(e) => handleCriteriaChange('deadline', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-3 hover:border-[#556B2F]/50 transition-colors"
                />
              </div>
            </div>
            
            {/* Selected Criteria Summary */}
            {(Object.values(criteria).some(value => value) || Object.keys(customFilters).length > 0) && (
              <div className="mt-6 pt-4 border-t border-[#556B2F]/20">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Criteria:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(criteria).map(([field, value]) => {
                    if (!value || field === 'customFilters') return null;
                    return (
                      <span key={field} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#556B2F]/10 text-[#556B2F]">
                        <span className="mr-1">
                          {field === 'contractType' ? 'Contract:' :
                           field === 'level' ? 'Level:' :
                           field === 'sector' ? 'Sector:' :
                           field === 'location' ? 'Location:' :
                           field === 'fundingType' ? 'Type:' :
                           field === 'eligibility' ? 'Eligibility:' :
                           field === 'amountRange' ? 'Amount:' :
                           field === 'purpose' ? 'Purpose:' :
                           field === 'format' ? 'Format:' :
                           field === 'duration' ? 'Duration:' :
                           field === 'certification' ? 'Certification:' :
                           field === 'cost' ? 'Cost:' :
                           field === 'deadline' ? 'Deadline:' :
                           field + ':'}
                        </span>
                        {value}
                      </span>
                    );
                  })}
                  
                  {/* Display custom filters */}
                  {Object.entries(customFilters).map(([filterName, filterValue]) => (
                    <span key={`custom-${filterName}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#6B8E23]/10 text-[#6B8E23]">
                      <span className="mr-1">{filterName}:</span>
                      {filterValue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Filters Section */}
        {formData.opportunityType && (
          <div className="bg-gradient-to-r from-[#6B8E23]/5 to-[#556B2F]/5 rounded-xl p-6 border border-[#6B8E23]/10 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#6B8E23] text-white text-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#6B8E23]">Custom Filters</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Add additional criteria specific to your opportunity that aren't covered by the standard filters above.
            </p>
            
            {/* Add Custom Filter Form */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={newCustomFilterName}
                    onChange={(e) => setNewCustomFilterName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCustomFilterName.trim() && newCustomFilterValue.trim()) {
                        handleAddCustomFilter();
                      }
                    }}
                    placeholder="e.g., Language Requirements"
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#6B8E23] focus:border-[#6B8E23] sm:text-sm py-2 pl-3 pr-3 hover:border-[#6B8E23]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Value
                  </label>
                  <input
                    type="text"
                    value={newCustomFilterValue}
                    onChange={(e) => setNewCustomFilterValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCustomFilterName.trim() && newCustomFilterValue.trim()) {
                        handleAddCustomFilter();
                      }
                    }}
                    placeholder="e.g., English, French, Spanish"
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#6B8E23] focus:border-[#6B8E23] sm:text-sm py-2 pl-3 pr-3 hover:border-[#6B8E23]/50 transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddCustomFilter}
                    disabled={!newCustomFilterName.trim() || !newCustomFilterValue.trim()}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#6B8E23] to-[#556B2F] hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Filter
                  </button>
                </div>
              </div>
            </div>
            
            {/* Display Custom Filters */}
            {Object.keys(customFilters).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Filters:</h4>
                <div className="space-y-2">
                  {Object.entries(customFilters).map(([filterName, filterValue]) => (
                    <div key={filterName} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{filterName}:</span>
                        <span className="ml-2 text-sm text-gray-600">{filterValue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomFilter(filterName)}
                        className="ml-3 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Help Text */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Tips for custom filters:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use clear, descriptive names (e.g., "Language Requirements", "Age Range")</li>
                    <li>Keep values concise but informative</li>
                    <li>These filters will help applicants understand specific requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          
          <RichTextEditor 
            value={formData.description}
            onChange={handleEditorChange}
          />
          
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use the rich text editor to format your description. Include responsibilities, requirements, impact, and any other relevant details.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={onChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-3"
              placeholder="e.g., Remote, Paris, France"
            />
          </div>
          
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
              Hours / Time Commitment
            </label>
            <input
              type="text"
              name="hours"
              id="hours"
              value={formData.hours}
              onChange={onChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-3"
              placeholder="e.g., 20 hours/week, Flexible"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSaveProgress();
            }}
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 border border-[#556B2F] text-sm font-medium rounded-md shadow-sm text-[#556B2F] bg-white hover:bg-[#556B2F]/5 transition-all duration-200 ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Progress'}
          </button>
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
