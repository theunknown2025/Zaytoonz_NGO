'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder = 'All',
  icon: Icon,
  searchable = false,
  searchPlaceholder = 'Search...',
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (option: MultiSelectOption) =>
    !normalizedQuery || option.label.toLowerCase().includes(normalizedQuery);

  const selectedOptions = options.filter((option) => selected.includes(option.value));
  const visibleSelected = selectedOptions.filter(matchesSearch);
  const unselectedOptions = options.filter((option) => !selected.includes(option.value));
  const visibleUnselected = unselectedOptions.filter(matchesSearch);

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (selectedOptions[0]?.label ?? selected[0])
        : `${selected.length} selected`;

  const renderOption = (option: MultiSelectOption, isSelected: boolean) => (
    <button
      key={option.value}
      type="button"
      onClick={() => toggle(option.value)}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-olive-700 hover:bg-olive-50 transition-colors"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          isSelected ? 'border-olive-600 bg-olive-600' : 'border-olive-300 bg-white'
        }`}
        aria-hidden
      >
        {isSelected && <CheckIcon className="h-3 w-3 text-white stroke-[3]" />}
      </span>
      <span className="truncate">{option.label}</span>
    </button>
  );

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative w-full flex items-center rounded-lg border border-olive-200 bg-white py-2.5 text-sm text-olive-700 hover:border-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-500 ${
          Icon ? 'pl-9 pr-8' : 'px-3 pr-8'
        }`}
      >
        {Icon && <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />}
        <span className={`flex-1 truncate text-left ${selected.length === 0 ? 'text-olive-500' : ''}`}>
          {summary}
        </span>
        <ChevronDownIcon
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-lg border border-olive-200 bg-white shadow-lg">
          {searchable && (
            <div className="sticky top-0 z-10 border-b border-olive-100 bg-white p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-olive-200 px-3 py-2 text-sm text-olive-700 placeholder:text-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {visibleSelected.length > 0 && (
            <div>
              <p className="border-b border-olive-100 bg-olive-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-olive-500">
                Selected
              </p>
              {visibleSelected.map((option) => renderOption(option, true))}
            </div>
          )}

          {visibleSelected.length > 0 && visibleUnselected.length > 0 && (
            <div className="border-t border-olive-100" />
          )}

          {visibleUnselected.length > 0 && (
            <div>
              {visibleSelected.length > 0 && (
                <p className="border-b border-olive-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-olive-400">
                  Other options
                </p>
              )}
              {visibleUnselected.map((option) => renderOption(option, false))}
            </div>
          )}

          {options.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-olive-500">No options available</p>
          )}

          {options.length > 0 && visibleSelected.length === 0 && visibleUnselected.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-olive-500">No matches found</p>
          )}
        </div>
      )}
    </div>
  );
}
