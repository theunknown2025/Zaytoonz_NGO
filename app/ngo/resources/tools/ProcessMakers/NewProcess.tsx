'use client';

import { useState, useEffect } from 'react';
import { 
  PlusCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  DocumentCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { createProcessTemplate, getProcessTemplateWithSteps, updateProcessTemplate } from './services/processService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Define types for our step objects
interface ProcessStep {
  id: number;
  name: string;
  statusOptions: string[];
  currentStatus: string;
  description: string;
}

// Define type for the current step being edited
interface CurrentStepForm {
  name: string;
  statusOptions: string;
  description: string;
}

// Define type for the main form data
interface ProcessForm {
  name: string;
  description: string;
  status: string;
  steps: ProcessStep[];
}

interface NewProcessProps {
  editProcessId?: string | null;
}

export default function NewProcess({ editProcessId = null }: NewProcessProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ProcessForm>({
    name: '',
    description: '',
    status: 'draft',
    steps: []
  });

  const [currentStep, setCurrentStep] = useState<CurrentStepForm>({
    name: '',
    statusOptions: '',
    description: ''
  });
  
  // Load process data when editProcessId changes
  useEffect(() => {
    if (editProcessId) {
      setIsEditMode(true);
      loadProcessData(editProcessId);
    } else {
      setIsEditMode(false);
      // Reset form when switching to create mode
      setFormData({
        name: '',
        description: '',
        status: 'draft',
        steps: []
      });
    }
  }, [editProcessId]);
  
  // Function to load process data for editing
  const loadProcessData = async (processId: string) => {
    try {
      setIsLoading(true);
      const { template, steps } = await getProcessTemplateWithSteps(processId);
      
      // Map database steps to the format expected by our form
      const formattedSteps = steps.map(step => ({
        id: Date.now() + Math.floor(Math.random() * 1000), // Generate a unique ID for the UI
        name: step.name,
        description: step.description || '',
        statusOptions: step.status_options,
        currentStatus: step.status_options[0] || ''
      }));
      
      setFormData({
        name: template.name,
        description: template.description,
        status: template.status,
        steps: formattedSteps
      });
      
    } catch (error) {
      console.error('Error loading process data:', error);
      toast.error('Failed to load process data for editing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentStep(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addStep = () => {
    if (currentStep.name && currentStep.statusOptions) {
      // Parse comma-separated status options into an array
      const statusOptionsArray = currentStep.statusOptions
        .split(',')
        .map(option => option.trim())
        .filter(option => option !== '');
      
      if (editingStepId) {
        // Update existing step
        setFormData(prev => ({
          ...prev,
          steps: prev.steps.map(step => 
            step.id === editingStepId 
              ? { 
                  ...step, 
                  name: currentStep.name,
                  description: currentStep.description,
                  statusOptions: statusOptionsArray,
                  currentStatus: statusOptionsArray[0] || step.currentStatus
                }
              : step
          )
        }));
        // Clear editing state
        setEditingStepId(null);
      } else {
        // Add new step
        setFormData(prev => ({
          ...prev,
          steps: [...prev.steps, { 
            ...currentStep, 
            id: Date.now(),
            statusOptions: statusOptionsArray,
            currentStatus: statusOptionsArray[0] || '' // Default to first status
          }]
        }));
      }
      
      // Reset current step form
      setCurrentStep({
        name: '',
        statusOptions: '',
        description: ''
      });
    }
  };

  const removeStep = (id: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
    }));
    
    // If we're editing this step, clear the editing state
    if (editingStepId === id) {
      setEditingStepId(null);
      setCurrentStep({
        name: '',
        statusOptions: '',
        description: ''
      });
    }
  };
  
  const editStep = (id: number) => {
    const stepToEdit = formData.steps.find(step => step.id === id);
    if (stepToEdit) {
      setEditingStepId(id);
      setCurrentStep({
        name: stepToEdit.name,
        statusOptions: stepToEdit.statusOptions.join(', '),
        description: stepToEdit.description
      });
    }
  };
  
  const cancelEdit = () => {
    setEditingStepId(null);
    setCurrentStep({
      name: '',
      statusOptions: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.steps.length === 0) {
      toast.error('Please fill in all required fields and add at least one step.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert the form data to the format expected by the service
      const templateData = {
        name: formData.name,
        description: formData.description,
        status: formData.status
      };
      
      const stepsData = formData.steps.map(step => ({
        name: step.name,
        description: step.description,
        status_options: step.statusOptions,
        display_order: 0 // This will be set by the service based on the index
      }));
      
      let result;
      if (isEditMode && editProcessId) {
        // Update existing process
        result = await updateProcessTemplate(editProcessId, templateData, stepsData);
        toast.success('Process updated successfully!');
      } else {
        // Create new process
        result = await createProcessTemplate(templateData, stepsData);
        toast.success('Process created successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'draft',
        steps: []
      });
      
      // Navigate to the list view
      router.push('/ngo/resources/tools/ProcessMakers');
      router.refresh();
      
      // Also dispatch event to update the UI
      const event = new CustomEvent('switchTab', {
        detail: { tab: 'list' }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error saving process:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} process. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-[#556B2F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading process data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditMode ? 'Edit Process' : 'Create New Process'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditMode 
            ? 'Update the workflow process and its steps' 
            : 'Define a new workflow process for your organization'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Process Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                placeholder="e.g., Volunteer Onboarding"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Process Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Process Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
              placeholder="Describe the purpose and goals of this process"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Process Steps</h3>
            
            {formData.steps.length > 0 && (
              <div className="mb-6 space-y-4">
                {formData.steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`relative p-4 border rounded-lg ${
                      editingStepId === step.id 
                        ? 'border-[#556B2F] bg-[#556B2F]/5' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="absolute -left-3 -top-3 w-6 h-6 bg-[#556B2F] text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{step.name}</h4>
                        <p className="text-sm text-gray-600">
                          Possible statuses: {step.statusOptions.join(', ')}
                        </p>
                        {step.description && (
                          <p className="text-sm text-gray-500 mt-2">{step.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          type="button" 
                          onClick={() => editStep(step.id)}
                          disabled={editingStepId !== null}
                          className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                          title="Edit step"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeStep(step.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove step"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {editingStepId === step.id && (
                      <div className="mt-2 text-xs text-[#556B2F] font-medium">
                        Currently editing this step. Make changes in the form below.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className={`bg-gray-50 p-4 rounded-lg border ${editingStepId ? 'border-[#556B2F]' : 'border-dashed border-gray-300'}`}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {editingStepId ? 'Edit Step' : 'Add New Step'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="stepName" className="block text-sm text-gray-600 mb-1">
                    Step Name*
                  </label>
                  <input
                    type="text"
                    id="stepName"
                    name="name"
                    value={currentStep.name}
                    onChange={handleStepChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                    placeholder="e.g., Initiation"
                  />
                </div>
                <div>
                  <label htmlFor="statusOptions" className="block text-sm text-gray-600 mb-1">
                    Possible Status Values*
                  </label>
                  <input
                    type="text"
                    id="statusOptions"
                    name="statusOptions"
                    value={currentStep.statusOptions}
                    onChange={handleStepChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                    placeholder="e.g., done, not done, on going (comma separated)"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="stepDescription" className="block text-sm text-gray-600 mb-1">
                  Step Description (Optional)
                </label>
                <textarea
                  id="stepDescription"
                  name="description"
                  value={currentStep.description}
                  onChange={handleStepChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                  placeholder="Describe what happens in this step"
                />
              </div>
              <div className="flex space-x-2">
                {editingStepId ? (
                  <>
                    <button
                      type="button"
                      onClick={addStep}
                      disabled={!currentStep.name || !currentStep.statusOptions}
                      className="py-2 px-4 bg-[#556B2F] text-white rounded-lg hover:bg-[#4A5F29] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Update Step
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={addStep}
                    disabled={!currentStep.name || !currentStep.statusOptions}
                    className="py-2 px-4 bg-[#556B2F] text-white rounded-lg hover:bg-[#4A5F29] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add Step
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={() => {
                // Navigate back to list view
                const event = new CustomEvent('switchTab', {
                  detail: { tab: 'list' }
                });
                window.dispatchEvent(event);
              }}
              className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.description || formData.steps.length === 0}
              className="py-2 px-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center text-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <DocumentCheckIcon className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Process' : 'Create Process'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 