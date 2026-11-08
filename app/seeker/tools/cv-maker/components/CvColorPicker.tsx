'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { CV_PALETTES, type CvPaletteId } from '../sectionConfig';

interface CvColorPickerProps {
  value: CvPaletteId;
  onChange: (palette: CvPaletteId) => void;
}

export default function CvColorPicker({ value, onChange }: CvColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = CV_PALETTES.find((palette) => palette.id === value) ?? CV_PALETTES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Colors"
        aria-expanded={isOpen}
        title="Colors"
      >
        <SwatchIcon className="w-5 h-5" style={{ color: selected.accentMedium }} />
        <span>Colors</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
          {CV_PALETTES.map((palette) => {
            const isSelected = palette.id === value;
            return (
              <button
                key={palette.id}
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 ${
                  isSelected ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  onChange(palette.id);
                  setIsOpen(false);
                }}
              >
                <span
                  className="h-5 w-5 flex-shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: palette.swatch }}
                />
                <span>{palette.label}</span>
                {isSelected && <CheckIcon className="ml-auto h-4 w-4 text-gray-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
