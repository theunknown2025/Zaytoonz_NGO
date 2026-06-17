'use client';

import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { FlowStepIcon } from '@/app/lib/flowStepIcons';
import {
  getTrainingFormatLabel,
  getVisibleTrainingDays,
  type TrainingDay,
} from '@/app/lib/opportunityTrainingProgram';

interface TrainingProgramDisplayProps {
  days: TrainingDay[];
  mode?: 'preview' | 'display';
}

export default function TrainingProgramDisplay({
  days,
  mode = 'display',
}: TrainingProgramDisplayProps) {
  const visibleDays = getVisibleTrainingDays(days);

  if (visibleDays.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {visibleDays.map((day, dayIndex) => (
        <div
          key={day.id}
          className={`rounded-xl border ${
            mode === 'preview'
              ? 'border-[#556B2F]/20 bg-white'
              : 'border-olive-200/80 bg-olive-50/40'
          } p-4 sm:p-5`}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${
                mode === 'preview'
                  ? 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23]'
                  : 'bg-olive-700'
              }`}
            >
              {dayIndex + 1}
            </div>
            <h3
              className={`text-base font-semibold ${
                mode === 'preview' ? 'text-[#556B2F]' : 'text-olive-900'
              }`}
            >
              {day.title || `Day ${dayIndex + 1}`}
            </h3>
          </div>

          <div className="space-y-3">
            {day.activities.map((activity, activityIndex) => (
              <div
                key={activity.id}
                className={`flex gap-3 rounded-lg border p-3 sm:p-4 ${
                  mode === 'preview'
                    ? 'border-gray-200 bg-gray-50/80'
                    : 'border-olive-100 bg-white'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                    mode === 'preview'
                      ? 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23]'
                      : 'bg-olive-600'
                  }`}
                >
                  <FlowStepIcon icon={activity.icon} className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p
                      className={`font-medium ${
                        mode === 'preview' ? 'text-gray-900' : 'text-olive-900'
                      }`}
                    >
                      {activity.name}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        mode === 'preview'
                          ? 'bg-[#556B2F]/10 text-[#556B2F]'
                          : 'bg-olive-100 text-olive-800'
                      }`}
                    >
                      {getTrainingFormatLabel(activity.format)}
                    </span>
                  </div>

                  <div
                    className={`mt-2 flex flex-wrap gap-4 text-sm ${
                      mode === 'preview' ? 'text-gray-600' : 'text-olive-700'
                    }`}
                  >
                    {activity.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 shrink-0" />
                        {activity.duration}
                      </span>
                    )}
                    {activity.format && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 shrink-0" />
                        {getTrainingFormatLabel(activity.format)}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    mode === 'preview' ? 'text-gray-400' : 'text-olive-500'
                  }`}
                >
                  #{activityIndex + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
