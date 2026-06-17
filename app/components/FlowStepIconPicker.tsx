'use client';

import {
  FLOW_STEP_ICON_OPTIONS,
  FlowStepIcon,
  resolveFlowStepIcon,
  type FlowStepIconKey,
} from '@/app/lib/flowStepIcons';

interface FlowStepIconPickerProps {
  value?: string;
  onChange: (icon: FlowStepIconKey) => void;
}

export default function FlowStepIconPicker({ value, onChange }: FlowStepIconPickerProps) {
  const selected = resolveFlowStepIcon(value);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Step icon</label>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {FLOW_STEP_ICON_OPTIONS.map(({ key, label }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                isSelected
                  ? 'border-[#556B2F] bg-[#556B2F]/10 ring-2 ring-[#556B2F]/30 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-[#556B2F]/40 hover:bg-[#556B2F]/5'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <FlowStepIcon icon={key} className="h-4 w-4" />
              </span>
              <span className="text-[10px] leading-tight text-gray-600 text-center line-clamp-2">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
