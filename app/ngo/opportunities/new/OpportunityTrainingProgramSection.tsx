'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import {
  PlusIcon,
  TrashIcon,
  AcademicCapIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import FlowStepIconPicker from '@/app/components/FlowStepIconPicker';
import TrainingProgramDisplay from '@/app/components/TrainingProgramDisplay';
import type { FlowStepIconKey } from '@/app/lib/flowStepIcons';
import {
  TRAINING_FORMAT_OPTIONS,
  createEmptyTrainingActivity,
  createEmptyTrainingDay,
  type TrainingActivity,
  type TrainingDay,
} from '@/app/lib/opportunityTrainingProgram';
import { saveTrainingProgram } from '../services/opportunityTrainingProgramService';
import { toast } from 'react-hot-toast';

interface OpportunityTrainingProgramSectionProps {
  trainingDays: TrainingDay[];
  opportunityId?: string;
  onDaysReplace: (days: TrainingDay[]) => void;
  includeTrainingProgram?: boolean;
  onIncludeTrainingProgramChange?: (enabled: boolean) => void;
  embedded?: boolean;
}

export interface OpportunityTrainingProgramHandle {
  validateAndSave: () => Promise<boolean>;
}

const OpportunityTrainingProgramSection = forwardRef<
  OpportunityTrainingProgramHandle,
  OpportunityTrainingProgramSectionProps
>(function OpportunityTrainingProgramSection(
  {
    trainingDays,
    opportunityId,
    onDaysReplace,
    includeTrainingProgram = false,
    onIncludeTrainingProgramChange,
    embedded = false,
  },
  ref
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateDay = (dayId: string, patch: Partial<TrainingDay>) => {
    onDaysReplace(
      trainingDays.map((day) => (day.id === dayId ? { ...day, ...patch } : day))
    );
  };

  const updateActivity = (
    dayId: string,
    activityId: string,
    field: keyof TrainingActivity,
    value: string
  ) => {
    onDaysReplace(
      trainingDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.map((activity) =>
                activity.id === activityId ? { ...activity, [field]: value } : activity
              ),
            }
          : day
      )
    );
  };

  const addDay = () => {
    onDaysReplace([...trainingDays, createEmptyTrainingDay(trainingDays.length)]);
  };

  const removeDay = (dayId: string) => {
    onDaysReplace(
      trainingDays
        .filter((day) => day.id !== dayId)
        .map((day, index) => ({ ...day, dayOrder: index, title: day.title || `Day ${index + 1}` }))
    );
  };

  const addActivity = (dayId: string) => {
    onDaysReplace(
      trainingDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: [
                ...day.activities,
                createEmptyTrainingActivity(day.activities.length),
              ],
            }
          : day
      )
    );
  };

  const removeActivity = (dayId: string, activityId: string) => {
    onDaysReplace(
      trainingDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.filter((activity) => activity.id !== activityId),
            }
          : day
      )
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    trainingDays.forEach((day) => {
      const namedActivities = day.activities.filter((activity) => activity.name.trim());
      if (namedActivities.length === 0) {
        newErrors[`day-${day.id}`] = 'Each day needs at least one activity';
      }

      namedActivities.forEach((activity) => {
        if (!activity.format) {
          newErrors[`activity-${activity.id}-format`] = 'Format is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const persistProgram = async (silent = false) => {
    if (!opportunityId) {
      toast.error('Opportunity ID is required to save the training program');
      return false;
    }

    try {
      setIsSaving(true);
      const saved = await saveTrainingProgram(opportunityId, trainingDays);
      onDaysReplace(saved);
      if (!silent) {
        toast.success('Training program saved');
      }
      return true;
    } catch (error: unknown) {
      console.error('Error saving training program:', error);
      const message = error instanceof Error ? error.message : 'Failed to save training program';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const validateAndSave = async (): Promise<boolean> => {
    const hasContent = trainingDays.some((day) =>
      day.activities.some((activity) => activity.name.trim())
    );
    if (!hasContent) return true;
    if (!validateForm()) return false;
    return persistProgram(true);
  };

  useImperativeHandle(ref, () => ({ validateAndSave }));

  const editorContent = (
    <div className="space-y-6">
      {trainingDays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#556B2F]/30 bg-white/70 p-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Start by adding training days and activities for your program schedule.
          </p>
          <button
            type="button"
            onClick={addDay}
            className="inline-flex items-center rounded-md bg-[#556B2F] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B8E23]"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Day 1
          </button>
        </div>
      ) : (
        trainingDays.map((day, dayIndex) => (
          <div
            key={day.id}
            className="rounded-xl border border-[#556B2F]/20 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#556B2F] text-sm font-semibold text-white">
                  {dayIndex + 1}
                </div>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => updateDay(day.id, { title: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 focus:border-[#556B2F] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  placeholder={`Day ${dayIndex + 1}`}
                />
              </div>
              {trainingDays.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDay(day.id)}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50"
                  aria-label="Remove day"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {errors[`day-${day.id}`] && (
              <p className="mb-3 text-sm text-red-600">{errors[`day-${day.id}`]}</p>
            )}

            <div className="space-y-4">
              {day.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-gray-200 bg-gray-50/80 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Activity
                      </label>
                      <input
                        type="text"
                        value={activity.name}
                        onChange={(e) =>
                          updateActivity(day.id, activity.id, 'name', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#556B2F] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        placeholder="e.g. Introduction to project management"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Duration
                      </label>
                      <div className="relative">
                        <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={activity.duration}
                          onChange={(e) =>
                            updateActivity(day.id, activity.id, 'duration', e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-[#556B2F] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          placeholder="e.g. 2 hours"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Format
                      </label>
                      <select
                        value={activity.format}
                        onChange={(e) =>
                          updateActivity(day.id, activity.id, 'format', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#556B2F] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      >
                        <option value="">Select format</option>
                        {TRAINING_FORMAT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors[`activity-${activity.id}-format`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`activity-${activity.id}-format`]}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-medium text-gray-600">
                        Icon
                      </label>
                      <FlowStepIconPicker
                        value={activity.icon}
                        onChange={(icon: FlowStepIconKey) =>
                          updateActivity(day.id, activity.id, 'icon', icon)
                        }
                      />
                    </div>
                  </div>

                  {day.activities.length > 1 && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeActivity(day.id, activity.id)}
                        className="inline-flex items-center text-xs text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="mr-1 h-3.5 w-3.5" />
                        Remove activity
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addActivity(day.id)}
              className="mt-4 inline-flex items-center text-sm font-medium text-[#556B2F] hover:text-[#6B8E23]"
            >
              <PlusIcon className="mr-1.5 h-4 w-4" />
              Add activity
            </button>
          </div>
        ))
      )}

      {trainingDays.length > 0 && (
        <button
          type="button"
          onClick={addDay}
          className="inline-flex items-center rounded-md border border-[#556B2F]/30 bg-white px-4 py-2 text-sm font-medium text-[#556B2F] hover:bg-[#556B2F]/5"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add day
        </button>
      )}

      {trainingDays.some((day) => day.activities.some((activity) => activity.name.trim())) && (
        <div className="rounded-xl border border-[#556B2F]/20 bg-[#556B2F]/5 p-5">
          <h4 className="mb-4 text-sm font-semibold text-[#556B2F]">Preview</h4>
          <TrainingProgramDisplay days={trainingDays} mode="preview" />
        </div>
      )}

      {!embedded && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => persistProgram()}
            disabled={isSaving}
            className="rounded-md bg-[#556B2F] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B8E23] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save program'}
          </button>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return editorContent;
  }

  return (
    <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-xl p-6 border border-[#556B2F]/10 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#556B2F] text-white">
            <AcademicCapIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#556B2F]">Training Program</h3>
            <p className="mt-1 text-sm text-gray-600">
              Plan your training schedule by day with activities, duration, and format.
            </p>
          </div>
        </div>
        {onIncludeTrainingProgramChange && (
          <button
            type="button"
            role="switch"
            aria-checked={includeTrainingProgram}
            onClick={() => onIncludeTrainingProgramChange(!includeTrainingProgram)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2 ${
              includeTrainingProgram ? 'bg-[#556B2F]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                includeTrainingProgram ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {includeTrainingProgram && (
        <div className="mt-6 border-t border-[#556B2F]/20 pt-6">{editorContent}</div>
      )}
    </div>
  );
});

export default OpportunityTrainingProgramSection;
