'use client';

import {
  CalendarIcon,
  CheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import type { OpportunityFlowStep } from '@/app/lib/opportunityFlow';
import { getStepStatus } from '@/app/lib/opportunityFlow';
import { FlowStepIcon } from '@/app/lib/flowStepIcons';

interface ProcessTimelineProps {
  steps: OpportunityFlowStep[];
  currentStepIndex?: number;
  processStatus?: string;
  submissions?: Record<string, boolean>;
  mode?: 'preview' | 'progress';
  activeViewIndex?: number;
  onStepClick?: (index: number) => void;
}

const STATUS_STYLES = {
  completed: 'from-[#556B2F] to-[#6B8E23] ring-[#556B2F]/20',
  current: 'from-blue-500 to-blue-600 ring-blue-100',
  locked: 'from-gray-300 to-gray-400 ring-gray-100',
  rejected: 'from-red-500 to-red-600 ring-red-100',
  awaiting_form: 'from-amber-500 to-amber-600 ring-amber-100',
};

function formatDeadline(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function HorizontalProcessTimeline({
  steps,
  currentStepIndex,
  processStatus,
  submissions,
  mode,
  activeViewIndex,
  onStepClick,
}: ProcessTimelineProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex items-start min-w-max py-2">
        {steps.map((step, index) => {
          const hasForm = Boolean(step.formId);
          const hasSubmission = Boolean(submissions?.[step.id]);
          const status: keyof typeof STATUS_STYLES =
            mode === 'preview'
              ? 'current'
              : getStepStatus(
                  index,
                  currentStepIndex ?? -1,
                  processStatus ?? 'in_progress',
                  hasForm,
                  hasSubmission
                );

          const isClickable =
            mode === 'progress' &&
            onStepClick &&
            index <= (currentStepIndex ?? -1) &&
            processStatus !== 'rejected';

          const isActiveView = activeViewIndex === index;
          const deadlineLabel = formatDeadline(step.deadline);

          return (
            <div key={step.id} className="flex items-start">
              <div
                className={`flex flex-col items-center w-40 sm:w-48 ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => isClickable && onStepClick?.(index)}
                role={isClickable ? 'button' : undefined}
              >
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-md ring-4 transition-all ${STATUS_STYLES[status]} ${
                    isActiveView ? 'scale-105 shadow-lg' : ''
                  }`}
                >
                  {mode === 'progress' && status === 'completed' ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : mode === 'progress' && status === 'locked' ? (
                    <LockClosedIcon className="h-5 w-5" />
                  ) : (
                    <FlowStepIcon icon={step.icon} className="h-6 w-6" />
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#556B2F] shadow border border-[#556B2F]/20">
                    {index + 1}
                  </span>
                </div>

                <div
                  className={`mt-3 w-full rounded-xl border px-3 py-2.5 text-center transition-all ${
                    isActiveView
                      ? 'border-[#556B2F] bg-[#556B2F]/5 shadow-sm'
                      : 'border-gray-200 bg-white shadow-sm'
                  } ${isClickable ? 'hover:border-[#556B2F]/40' : ''}`}
                >
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{step.name}</h3>

                  {deadlineLabel && (
                    <p className="mt-1.5 inline-flex items-center justify-center gap-1 text-xs font-medium text-[#556B2F]">
                      <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                      {deadlineLabel}
                    </p>
                  )}

                  {step.description && (
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>
                  )}

                  {mode === 'progress' && status === 'awaiting_form' && (
                    <span className="mt-2 inline-block text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Form required
                    </span>
                  )}
                  {mode === 'progress' && status === 'current' && (
                    <span className="mt-2 inline-block text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  {mode === 'progress' && status === 'completed' && (
                    <span className="mt-2 inline-block text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex items-center self-start pt-7 px-1 sm:px-2">
                  <div className="relative h-0.5 w-10 sm:w-16 bg-gradient-to-r from-[#556B2F]/80 to-[#6B8E23]/80 rounded-full">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#6B8E23]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerticalProcessTimeline({
  steps,
  currentStepIndex = -1,
  processStatus = 'in_progress',
  submissions = {},
  mode = 'progress',
  activeViewIndex,
  onStepClick,
}: ProcessTimelineProps) {
  return (
    <div className="relative pl-8 pt-2">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-[#556B2F]/70 to-[#6B8E23]/70 rounded-full" />

      {steps.map((step, index) => {
        const hasForm = Boolean(step.formId);
        const hasSubmission = Boolean(submissions[step.id]);
        const status: keyof typeof STATUS_STYLES = getStepStatus(
          index,
          currentStepIndex,
          processStatus,
          hasForm,
          hasSubmission
        );

        const isClickable =
          onStepClick && index <= currentStepIndex && processStatus !== 'rejected';
        const isActiveView = activeViewIndex === index;

        return (
          <div key={step.id} className="mb-6 relative last:mb-0">
            <div
              className={`absolute left-0 top-3 w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 bg-gradient-to-br text-white ring-4 ring-white ${STATUS_STYLES[status]}`}
            >
              {status === 'completed' ? (
                <CheckIcon className="h-4 w-4" />
              ) : status === 'locked' ? (
                <LockClosedIcon className="h-4 w-4" />
              ) : (
                <FlowStepIcon icon={step.icon} className="h-4 w-4" />
              )}
            </div>

            <div
              className={`ml-10 bg-white p-4 rounded-lg border transition-all duration-200 ${
                isActiveView ? 'border-[#556B2F] shadow-md' : 'border-gray-200 shadow-sm'
              } ${isClickable ? 'cursor-pointer hover:border-[#556B2F]/50 hover:shadow-md' : ''}`}
              onClick={() => isClickable && onStepClick?.(index)}
              role={isClickable ? 'button' : undefined}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-base font-semibold text-gray-900">{step.name}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                  Step {index + 1} of {steps.length}
                </span>
              </div>

              {step.description && (
                <p className="mt-2 text-gray-600 text-sm">{step.description}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                {step.deadline && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-[#556B2F]" />
                    Deadline: {formatDeadline(step.deadline)}
                  </span>
                )}
              </div>

              {status === 'awaiting_form' && (
                <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block">
                  Form required
                </p>
              )}
              {status === 'current' && mode === 'progress' && (
                <p className="mt-2 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">
                  Current step
                </p>
              )}
              {status === 'completed' && (
                <p className="mt-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                  Completed
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProcessTimeline(props: ProcessTimelineProps) {
  const { steps, mode = 'preview' } = props;

  if (steps.length === 0) {
    return <p className="text-sm text-gray-500 italic">No process steps configured.</p>;
  }

  if (mode === 'preview') {
    return <HorizontalProcessTimeline {...props} mode="preview" />;
  }

  return <VerticalProcessTimeline {...props} mode="progress" />;
}
