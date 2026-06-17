'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Cog6ToothIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    setIsOpen(false);
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
      <div ref={menuRef} className="relative">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled || isExtracting}
          title="CV settings"
          aria-label="CV settings"
          aria-expanded={isOpen}
        >
          <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <button
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 flex items-center gap-2"
              onClick={handleUploadClick}
            >
              <ArrowUpTrayIcon className="w-5 h-5 text-olive-dark" />
              Upload CV
            </button>
            <p className="px-4 pb-3 text-xs text-gray-500">
              Supports .txt, .pdf, and .docx
            </p>
          </div>
        )}

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
              OpenAI is restructuring your content into CV Maker sections…
            </p>
          </div>
        </div>
      )}
    </>
  );
}
