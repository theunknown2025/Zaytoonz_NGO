'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { saveOpportunityFlowSteps } from '../services/opportunityFlowService';
import ProcessTimeline from '@/app/components/ProcessTimeline';
import FlowStepIconPicker from '@/app/components/FlowStepIconPicker';
import type { OpportunityFlowStep } from '@/app/lib/opportunityFlow';
import { DEFAULT_FLOW_STEP_ICON } from '@/app/lib/flowStepIcons';
import type { FlowStepIconKey } from '@/app/lib/flowStepIcons';
import { toast } from 'react-hot-toast';

interface OpportunityProcessProps {
  flowSteps: OpportunityFlowStep[];
  opportunityId?: string;
  onStepAdd: (step: OpportunityFlowStep) => void;
  onStepRemove: (id: string) => void;
  onStepChange: (id: string, field: string, value: string) => void;
  onStepsReplace: (steps: OpportunityFlowStep[]) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  embedded?: boolean;
}

export interface OpportunityProcessHandle {
  validateAndSave: () => Promise<boolean>;
}

function createEmptyStep(order: number): OpportunityFlowStep {
  return {
    id: `temp-${Date.now()}-${order}`,
    name: '',
    description: '',
    deadline: '',
    formId: '',
    formTitle: '',
    stepOrder: order,
    icon: DEFAULT_FLOW_STEP_ICON,
  };
}

const OpportunityProcess = forwardRef<OpportunityProcessHandle, OpportunityProcessProps>(function OpportunityProcess({
  flowSteps,
  opportunityId,
  onStepAdd,
  onStepRemove,
  onStepChange,
  onStepsReplace,
  onPrevious,
  onNext,
  embedded = false,
}, ref) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const namedSteps = flowSteps.filter((s) => s.name.trim());

    namedSteps.forEach((step, index) => {
      if (!step.name.trim()) {
        newErrors[`step-${step.id}-name`] = 'Step name is required';
      }
      if (!step.deadline) {
        newErrors[`step-${step.id}-deadline`] = 'Deadline is required';
      }
      if (index > 0 && step.deadline && namedSteps[index - 1].deadline) {
        if (new Date(step.deadline) < new Date(namedSteps[index - 1].deadline!)) {
          newErrors[`step-${step.id}-deadline`] = 'Deadline must be after previous step';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStep = () => {
    onStepAdd(createEmptyStep(flowSteps.length));
  };

  const persistSteps = async (silent = false) => {
    if (!opportunityId) {
      toast.error('Opportunity ID is required to save process');
      return false;
    }

    const validSteps = flowSteps.filter((s) => s.name.trim());
    try {
      setIsSaving(true);
      const saved = await saveOpportunityFlowSteps(opportunityId, validSteps);
      onStepsReplace(saved);
      if (!silent) {
        toast.success('Process steps saved');
      }
      return true;
    } catch (error: unknown) {
      console.error('Error saving process:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save process steps';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    if (flowSteps.some((s) => s.name.trim())) {
      const ok = await persistSteps();
      if (!ok) return;
    }
    onNext?.();
  };

  const saveEmbeddedSteps = async (): Promise<boolean> => {
    if (!flowSteps.some((s) => s.name.trim())) return true;
    if (!validateForm()) return false;
    return persistSteps(true);
  };

  useImperativeHandle(ref, () => ({
    validateAndSave: saveEmbeddedSteps,
  }));

  const handleSaveProgress = async () => {
    if (!validateForm()) return;
    await persistSteps();
  };

  const validPreviewSteps = flowSteps.filter((s) => s.name.trim());

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Process Flow</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define the steps applicants will follow. Each step needs a name and deadline. Descriptions are optional.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {flowSteps.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm mb-4">No steps yet. Add your first process step.</p>
            <button
              type="button"
              onClick={handleAddStep}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#556B2F] border border-[#556B2F] rounded-md hover:bg-[#556B2F]/10"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Step
            </button>
          </div>
        )}

        {flowSteps.map((step, index) => (
          <div
            key={step.id}
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-[#556B2F]">Step {index + 1}</span>
              <button
                type="button"
                onClick={() => onStepRemove(step.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                title="Remove step"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={step.name}
                  onChange={(e) => onStepChange(step.id, 'name', e.target.value)}
                  placeholder="e.g. Initial Review"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#556B2F] focus:border-[#556B2F]"
                />
                {errors[`step-${step.id}-name`] && (
                  <p className="mt-1 text-xs text-red-600">{errors[`step-${step.id}-name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={step.deadline || ''}
                    onChange={(e) => onStepChange(step.id, 'deadline', e.target.value)}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:ring-[#556B2F] focus:border-[#556B2F]"
                  />
                </div>
                {errors[`step-${step.id}-deadline`] && (
                  <p className="mt-1 text-xs text-red-600">{errors[`step-${step.id}-deadline`]}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <FlowStepIconPicker
                  value={step.icon}
                  onChange={(icon: FlowStepIconKey) => onStepChange(step.id, 'icon', icon)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={step.description || ''}
                  onChange={(e) => onStepChange(step.id, 'description', e.target.value)}
                  rows={2}
                  placeholder="Describe what happens in this step..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#556B2F] focus:border-[#556B2F]"
                />
              </div>
            </div>
          </div>
        ))}

        {flowSteps.length > 0 && (
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#556B2F] border border-dashed border-[#556B2F] rounded-md hover:bg-[#556B2F]/10 w-full justify-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Another Step
          </button>
        )}
      </div>

      {validPreviewSteps.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Timeline preview</h3>
          <p className="text-sm text-gray-500 mb-4">
            This is how applicants will see your process steps and dates.
          </p>
          <div className="rounded-xl border border-[#556B2F]/15 bg-gradient-to-br from-[#556B2F]/5 via-white to-[#6B8E23]/5 p-4 sm:p-6">
            <ProcessTimeline steps={validPreviewSteps} mode="preview" />
          </div>
        </div>
      )}

      {!embedded && (
        <div className="pt-5">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onPrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous Step
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-[#556B2F] shadow-sm text-sm font-medium rounded-md text-[#556B2F] bg-white hover:bg-[#556B2F]/10 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Progress'}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23]"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default OpportunityProcess;
