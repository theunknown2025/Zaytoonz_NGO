'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { FlowStepIcon } from '@/app/lib/flowStepIcons';
import type { OpportunityFaqItem } from '@/app/lib/opportunityFaq';

interface OpportunityFaqDisplayProps {
  items: OpportunityFaqItem[];
  mode?: 'preview' | 'display';
}

export default function OpportunityFaqDisplay({
  items,
  mode = 'display',
}: OpportunityFaqDisplayProps) {
  const visibleItems = items.filter(
    (item) => item.question.trim().length > 0 && item.answer.trim().length > 0
  );

  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  if (visibleItems.length === 0) {
    return null;
  }

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isPreview = mode === 'preview';

  return (
    <div className="space-y-3">
      {visibleItems.map((item) => {
        const isOpen = openIds.has(item.id);

        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-xl border ${
              isPreview ? 'border-[#556B2F]/20 bg-white' : 'border-olive-200/80 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors sm:px-5 ${
                isOpen
                  ? isPreview
                    ? 'bg-[#556B2F]/5'
                    : 'bg-olive-50/60'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                  isPreview
                    ? 'bg-gradient-to-br from-[#556B2F] to-[#6B8E23]'
                    : 'bg-olive-700'
                }`}
              >
                <FlowStepIcon icon={item.icon} className="h-5 w-5" />
              </div>

              <span
                className={`min-w-0 flex-1 text-sm font-medium sm:text-base ${
                  isPreview ? 'text-gray-900' : 'text-olive-900'
                }`}
              >
                {item.question}
              </span>

              {isOpen ? (
                <ChevronUpIcon className={`h-5 w-5 shrink-0 ${isPreview ? 'text-[#556B2F]' : 'text-olive-600'}`} />
              ) : (
                <ChevronDownIcon className={`h-5 w-5 shrink-0 ${isPreview ? 'text-gray-400' : 'text-olive-500'}`} />
              )}
            </button>

            {isOpen && (
              <div
                className={`border-t px-4 py-4 text-sm leading-relaxed sm:px-5 ${
                  isPreview
                    ? 'border-[#556B2F]/10 text-gray-700'
                    : 'border-olive-100 text-olive-800'
                }`}
              >
                <p className="whitespace-pre-line">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
