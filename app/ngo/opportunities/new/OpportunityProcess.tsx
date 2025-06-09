'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { getProcessTemplates, getProcessTemplateWithSteps } from '../../resources/tools/ProcessMakers/services/processService';
import { saveOpportunityProcess, initializeOpportunityProcessSteps } from '../../resources/tools/ProcessMakers/services/opportunityProcessService';
import { toast } from 'react-hot-toast';

interface ProcessStage {
  id: string;
  name: string;
  description: string;
  statusOptions: string[];
}

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface OpportunityProcessProps {
  selectedProcess: string;
  customStages: ProcessStage[];
  opportunityId?: string;
  onProcessSelect: (process: string) => void;
  onProcessNameChange?: (name: string) => void;
  onStageAdd: (stage: ProcessStage) => void;
  onStageRemove: (id: string) => void;
  onStageChange: (id: string, field: string, value: string | string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function OpportunityProcess({
  selectedProcess,
  customStages,
  opportunityId,
  onProcessSelect,
  onProcessNameChange,
  onStageAdd,
  onStageRemove,
  onStageChange,
  onPrevious,
  onNext
}: OpportunityProcessProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>([]);
  const [selectedProcessDetails, setSelectedProcessDetails] = useState<any>(null);
  
  // Add no process option
  const noProcessOption = { id: 'none', name: 'No Process' };
  
  // Fetch process templates on component mount
  useEffect(() => {
    fetchProcessTemplates();
  }, []);
  
  // Fetch process steps when a process is selected
  useEffect(() => {
    if (selectedProcess && selectedProcess !== 'none') {
      fetchProcessSteps(selectedProcess);
    } else {
      setSelectedProcessDetails(null);
    }
  }, [selectedProcess]);
  
  const fetchProcessTemplates = async () => {
    try {
      setIsLoadingProcesses(true);
      const data = await getProcessTemplates();
      setProcessTemplates(data || []);
    } catch (error) {
      console.error('Error fetching process templates:', error);
      setErrors(prev => ({ ...prev, fetch: 'Failed to load processes' }));
    } finally {
      setIsLoadingProcesses(false);
    }
  };
  
  const fetchProcessSteps = async (processId: string) => {
    if (processId === 'none') return;
    
    try {
      setIsLoadingSteps(true);
      const processData = await getProcessTemplateWithSteps(processId);
      setSelectedProcessDetails(processData);
      
      // Also update the process name
      if (onProcessNameChange && processData.template && processData.template.name) {
        onProcessNameChange(processData.template.name);
      }
      
      // Convert steps to the format expected by customStages
      const formattedStages = processData.steps.map(step => ({
        id: step.id || String(Date.now()),
        name: step.name,
        description: step.description || '',
        statusOptions: step.status_options
      }));
      
      // Clear existing custom stages and add the new ones
      onStageRemove('all'); // Need to implement this in the parent component
      formattedStages.forEach(stage => {
        onStageAdd(stage);
      });
    } catch (error) {
      console.error('Error fetching process steps:', error);
    } finally {
      setIsLoadingSteps(false);
    }
  };

  // Function to get status badge style (from ListProcess.tsx)
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Get status icon based on status name (from ListProcess.tsx)
  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('achieve')) {
      return <CheckIcon className="h-4 w-4" />;
    } else if (lowerStatus.includes('not') || lowerStatus.includes('fail')) {
      return <XMarkIcon className="h-4 w-4" />;
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
      return <ExclamationCircleIcon className="h-4 w-4" />;
    }
    return null;
  };
  
  // Get a color for the status badge based on the status name (from ListProcess.tsx)
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('achieve')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerStatus.includes('not') || lowerStatus.includes('fail')) {
      return 'bg-red-100 text-red-800';
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (lowerStatus.includes('ongoing') || lowerStatus.includes('progress')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
  
  // Format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedProcess || selectedProcess === 'none') {
      toast.error('Please select a process to save');
      return;
    }
    
    if (!opportunityId) {
      toast.error('Opportunity ID is required to save progress');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Save the opportunity process relationship to the database
      const savedProcess = await saveOpportunityProcess(opportunityId, selectedProcess);
      
      // Initialize the process steps with default status values
      await initializeOpportunityProcessSteps(savedProcess.id, selectedProcess);
      
      toast.success('Process selection saved successfully');
    } catch (error) {
      console.error('Error saving process:', error);
      toast.error('Failed to save process selection');
    } finally {
      setIsSaving(false);
    }
  };

  // Combine no process option and database processes
  const allProcessOptions = [
    noProcessOption,
    ...processTemplates.map(p => ({ id: p.id, name: p.name }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Process Flow</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set up a process flow for this opportunity (optional).
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700">Which process do you wish to use to manage your opportunity?</label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLoadingProcesses ? (
            <div className="col-span-full flex justify-center items-center py-4">
              <svg className="animate-spin h-6 w-6 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-sm text-gray-600">Loading processes...</span>
            </div>
          ) : (
            allProcessOptions.map((process) => (
            <div
              key={process.id}
              className={`relative rounded-lg border ${
                selectedProcess === process.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              } p-4 shadow-sm hover:border-blue-400 cursor-pointer`}
              onClick={() => {
                onProcessSelect(process.id);
                // Update process name when selected
                if (onProcessNameChange) {
                  onProcessNameChange(process.name);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-gray-900">
                  {process.name}
                </span>
                <div className={`h-5 w-5 rounded-full ${
                  selectedProcess === process.id
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}>
                  {selectedProcess === process.id && (
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            ))
          )}
        </div>
        {errors.fetch && (
          <p className="mt-2 text-sm text-red-600">{errors.fetch}</p>
        )}
      </div>
      
      {/* Process Preview - Show for selected database process */}
      {selectedProcess && selectedProcess !== 'none' && selectedProcessDetails && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Process Preview</h3>
            <p className="mt-1 text-sm text-gray-500">
              Preview of the selected process flow.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-4 border border-gray-200">
            <div className="flex items-start justify-between">
                    <div>
                <h2 className="text-lg font-bold text-[#556B2F]">{selectedProcessDetails.template.name}</h2>
                <p className="text-gray-600 text-sm mt-2">{selectedProcessDetails.template.description}</p>
                    </div>
              <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${getStatusBadgeClass(selectedProcessDetails.template.status)}`}>
                {selectedProcessDetails.template.status.charAt(0).toUpperCase() + selectedProcessDetails.template.status.slice(1)}
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex flex-wrap gap-4">
              <div>
                <span className="font-medium">Created:</span> {formatDate(selectedProcessDetails.template.created_at)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(selectedProcessDetails.template.updated_at)}
              </div>
              <div>
                <span className="font-medium">Steps:</span> {selectedProcessDetails.steps.length}
              </div>
              </div>
            </div>
            
          {/* Timeline View */}
          <div className="relative pl-8 pt-2">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-[#556B2F]/80 to-[#6B8E23]/80 rounded-full"></div>
            
            {selectedProcessDetails.steps.map((step: any, index: number) => (
              <div 
                key={step.id}
                className="mb-8 relative"
              >
                {/* Timeline Node */}
                <div className="absolute left-0 top-4 w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white font-bold">
                  {index + 1}
                </div>
                
                {/* Step Card */}
                <div className="ml-12 bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Step Header */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-gray-900">{step.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Step {index + 1} of {selectedProcessDetails.steps.length}</span>
            </div>
            
                  {/* Step Description */}
                  {step.description && (
                    <p className="mt-2 text-gray-600 text-sm">{step.description}</p>
                  )}
                  
                  {/* Status Options */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Possible Status Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {step.status_options.map((status: string, i: number) => (
                        <span 
                          key={i} 
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                        >
                          {getStatusIcon(status) && (
                            <span className="mr-1">{getStatusIcon(status)}</span>
                          )}
                          {status}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
            ))}
          </div>
        </div>
      )}
      
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
              onClick={handleSaveProgress}
              disabled={isSaving || !selectedProcess || selectedProcess === 'none'}
              className="inline-flex items-center px-4 py-2 border border-[#556B2F] shadow-sm text-sm font-medium rounded-md text-[#556B2F] bg-white hover:bg-[#556B2F]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
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
    </div>
  );
} 