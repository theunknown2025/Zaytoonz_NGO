'use client';

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { FlowStepIcon } from '@/app/lib/flowStepIcons';
import {
  normalizeActionButtonUrl,
  type OpportunityActionButton,
} from '@/app/lib/opportunityActionButtons';

interface OpportunityActionButtonsDisplayProps {
  buttons: OpportunityActionButton[];
  /** When true, render buttons only (parent provides the card shell). */
  embedded?: boolean;
  mode?: 'preview' | 'display';
}

export default function OpportunityActionButtonsDisplay({
  buttons,
  embedded = false,
  mode = 'display',
}: OpportunityActionButtonsDisplayProps) {
  const visibleButtons = buttons.filter(
    (button) => button.title.trim().length > 0 && button.linkUrl.trim().length > 0
  );

  if (!visibleButtons.length) return null;

  const isPreview = mode === 'preview';

  const buttonList = (
    <div className="flex flex-wrap gap-3">
      {visibleButtons.map((button) => {
        const href = normalizeActionButtonUrl(button.linkUrl);

        return (
          <a
            key={button.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition shrink-0 ${
              isPreview
                ? 'bg-[#556B2F] text-white hover:bg-[#6B8E23] shadow-sm'
                : 'bg-olive-700 text-white hover:bg-olive-800 shadow-sm'
            }`}
          >
            {button.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={button.iconUrl}
                alt=""
                className="h-5 w-5 rounded object-cover shrink-0"
              />
            ) : (
              <FlowStepIcon icon={button.icon} className="h-5 w-5 shrink-0" />
            )}
            <span>{button.title}</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-80 shrink-0" />
          </a>
        );
      })}
    </div>
  );

  if (embedded) return buttonList;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPreview ? 'border-[#556B2F]/20 bg-[#556B2F]/5' : 'border-olive-100 bg-olive-50'
      }`}
    >
      <h2
        className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
          isPreview ? 'text-[#556B2F]' : 'text-olive-900'
        }`}
      >
        Action buttons
      </h2>
      {buttonList}
    </div>
  );
}
