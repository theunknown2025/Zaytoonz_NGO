'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarDaysIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface PostedDateRange {
  from: string | null;
  to: string | null;
  tillToday: boolean;
}

export const initialPostedDateRange: PostedDateRange = {
  from: null,
  to: null,
  tillToday: true,
};

interface PostedDateRangeFilterProps {
  value: PostedDateRange;
  onChange: (value: PostedDateRange) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildSummary(value: PostedDateRange): string {
  if (!value.from) return 'Any time';
  const fromLabel = formatDisplayDate(value.from);
  if (value.tillToday) return `${fromLabel} – Today`;
  if (value.to) return `${fromLabel} – ${formatDisplayDate(value.to)}`;
  return `Since ${fromLabel}`;
}

export default function PostedDateRangeFilter({ value, onChange }: PostedDateRangeFilterProps) {
  const [open, setOpen] = useState(false);
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

  const summary = buildSummary(value);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Posted</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex w-full items-center rounded-lg border border-olive-200 bg-white py-2.5 pl-9 pr-8 text-sm text-olive-700 hover:border-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-500"
      >
        <CalendarDaysIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
        <span className={`flex-1 truncate text-left ${!value.from ? 'text-olive-500' : ''}`}>{summary}</span>
        <ChevronDownIcon
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] rounded-lg border border-olive-200 bg-white p-4 shadow-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="posted-from" className="mb-1.5 block text-xs font-medium text-olive-600">
                Since
              </label>
              <input
                id="posted-from"
                type="date"
                value={value.from ?? ''}
                max={value.tillToday ? todayIso() : value.to ?? undefined}
                onChange={(e) =>
                  onChange({
                    ...value,
                    from: e.target.value || null,
                  })
                }
                className="w-full rounded-lg border border-olive-200 px-3 py-2 text-sm text-olive-700 focus:outline-none focus:ring-2 focus:ring-olive-500"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={value.tillToday}
                onChange={(e) =>
                  onChange({
                    ...value,
                    tillToday: e.target.checked,
                    to: e.target.checked ? null : value.to,
                  })
                }
                className="h-4 w-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
              />
              <span className="text-sm text-olive-700">Till today</span>
            </label>

            {!value.tillToday && (
              <div>
                <label htmlFor="posted-to" className="mb-1.5 block text-xs font-medium text-olive-600">
                  Till
                </label>
                <input
                  id="posted-to"
                  type="date"
                  value={value.to ?? ''}
                  min={value.from ?? undefined}
                  max={todayIso()}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      to: e.target.value || null,
                    })
                  }
                  className="w-full rounded-lg border border-olive-200 px-3 py-2 text-sm text-olive-700 focus:outline-none focus:ring-2 focus:ring-olive-500"
                />
              </div>
            )}

            {value.from && (
              <button
                type="button"
                onClick={() => onChange(initialPostedDateRange)}
                className="w-full rounded-lg border border-olive-200 px-3 py-2 text-sm font-medium text-olive-600 hover:bg-olive-50"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function opportunityMatchesPostedRange(
  opp: { posted: string; sortTimestamp?: number },
  range: PostedDateRange,
  parsePostedDate: (posted: string) => Date | null
): boolean {
  if (!range.from) return true;

  const postedAt = opp.sortTimestamp
    ? new Date(opp.sortTimestamp)
    : parsePostedDate(opp.posted);
  if (!postedAt || Number.isNaN(postedAt.getTime())) return false;

  const from = new Date(`${range.from}T00:00:00`);
  const toEnd = range.tillToday
    ? new Date()
    : range.to
      ? new Date(`${range.to}T23:59:59`)
      : new Date();

  from.setHours(0, 0, 0, 0);
  toEnd.setHours(23, 59, 59, 999);

  return postedAt >= from && postedAt <= toEnd;
}
