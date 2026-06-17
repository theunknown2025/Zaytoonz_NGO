'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatDescriptionForDisplay } from '../formatDescription';

interface DescriptionEnhanceModalProps {
  isOpen: boolean;
  originalText: string;
  enhancedText: string;
  isApplying?: boolean;
  onApprove: () => void;
  onClose: () => void;
}

export default function DescriptionEnhanceModal({
  isOpen,
  originalText,
  enhancedText,
  isApplying = false,
  onApprove,
  onClose,
}: DescriptionEnhanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isApplying ? undefined : onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enhance-description-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 id="enhance-description-title" className="text-lg font-semibold text-gray-900">
              AI-Enhanced Description
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review the improved version below. Approving will replace your current description.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Current version</h3>
            <div
              className="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
              dangerouslySetInnerHTML={{
                __html: formatDescriptionForDisplay(originalText) || '<p class="text-gray-400 italic">Empty</p>',
              }}
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-[#556B2F]">Enhanced version</h3>
            <div
              className="prose prose-sm max-w-none rounded-lg border border-[#556B2F]/30 bg-[#556B2F]/5 p-4 text-sm text-gray-800"
              dangerouslySetInnerHTML={{
                __html: formatDescriptionForDisplay(enhancedText),
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Keep original
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={isApplying}
            className="inline-flex items-center rounded-md bg-gradient-to-r from-[#556B2F] to-[#6B8E23] px-4 py-2 text-sm font-medium text-white hover:shadow-md disabled:opacity-50"
          >
            {isApplying ? 'Applying...' : 'Approve & replace'}
          </button>
        </div>
      </div>
    </div>
  );
}
