'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import type { OpportunityTypeLabel } from '../../descriptionEnhancer/types';
import DescriptionEnhanceModal from './DescriptionEnhanceModal';

const RichTextEditor = dynamic(() => import('../RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 animate-pulse flex-col items-center justify-center rounded-lg border border-gray-300 bg-gray-50 p-6">
      <p className="text-sm text-gray-500">Loading rich text editor...</p>
    </div>
  ),
});

interface DescriptionEditorWithAIProps {
  value: string;
  onChange: (content: string) => void;
  title?: string;
  opportunityType?: OpportunityTypeLabel;
}

export default function DescriptionEditorWithAI({
  value,
  onChange,
  title,
  opportunityType,
}: DescriptionEditorWithAIProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');

  const handleEnhance = async () => {
    if (isEnhancing) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/ngo/opportunities/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value,
          title,
          opportunityType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance description');
      }

      setEnhancedText(data.enhanced);
      setIsModalOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enhance description';
      toast.error(message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApprove = () => {
    onChange(enhancedText);
    setIsModalOpen(false);
    setEnhancedText('');
    toast.success('Description updated with AI-enhanced version');
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEnhancedText('');
  };

  return (
    <>
      <div className="group relative">
        <button
          type="button"
          onClick={handleEnhance}
          disabled={isEnhancing}
          className="group/btn absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-[#556B2F]/20 bg-white/95 p-2 text-[#556B2F] shadow-sm opacity-0 transition-all hover:border-[#556B2F]/40 hover:bg-[#556B2F]/5 hover:shadow-md group-hover:opacity-100 disabled:cursor-wait disabled:opacity-70"
          aria-label="Enhance with AI"
        >
          {isEnhancing ? (
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
          <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/btn:opacity-100">
            Enhance with AI
          </span>
        </button>

        <RichTextEditor value={value} onChange={onChange} />
      </div>

      <DescriptionEnhanceModal
        isOpen={isModalOpen}
        originalText={value}
        enhancedText={enhancedText}
        onApprove={handleApprove}
        onClose={handleClose}
      />
    </>
  );
}
