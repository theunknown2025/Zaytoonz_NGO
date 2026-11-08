'use client';

import React, { useRef, useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { CVData } from '../types';

interface CvSettingsMenuProps {
  onExtracted: (payload: {
    cvData: CVData;
    addedSections: string[];
    availableSections: string[];
  }) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = '.txt,.pdf,.docx';

export default function CvSettingsMenu({ onExtracted, disabled }: CvSettingsMenuProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cv-maker/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract CV content');
      }

      onExtracted({
        cvData: result.cvData,
        addedSections: result.addedSections,
        availableSections: result.availableSections,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload CV';
      const { toast } = await import('react-hot-toast');
      toast.error(message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Upload CV</h2>
            <p className="text-sm text-gray-600 mt-1">Upload is assisted by our AI AGENT</p>
            <p className="text-xs text-gray-500 mt-1">Supports .txt, .pdf, and .docx</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-olive-dark text-white rounded-md flex items-center justify-center gap-2 hover:bg-olive-medium transition-colors disabled:opacity-50 shrink-0"
            onClick={handleUploadClick}
            disabled={disabled || isExtracting}
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Upload CV
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isExtracting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
            <div className="animate-spin mb-4">
              <svg
                className="w-12 h-12 text-olive-medium"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center text-gray-800">
              Analyzing your CV
            </h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Your original wording is being placed into CV Maker sections…
            </p>
          </div>
        </div>
      )}
    </>
  );
}
