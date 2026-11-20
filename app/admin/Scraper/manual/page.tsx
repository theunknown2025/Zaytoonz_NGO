'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  TrashIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';

type OpportunityType = 'job' | 'funding' | 'training';

/** Normalized shape expected by POST /api/admin/scraped-opportunities/bulk */
interface NormalizedOpportunity {
  title: string;
  company?: string;
  location?: string;
  description?: string;
  job_type?: string;
  salary_range?: string | null;
  deadline?: string | null;
  url?: string;
  original: Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
}

function stripHtml(html: string, max = 180): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Accepts either the rich scraper export format
 * (entity_name / post_title / job_description / …)
 * or the already-normalized ScrapedJob shape.
 */
export function normalizeManualJsonItem(
  raw: Record<string, unknown>
): NormalizedOpportunity | null {
  const title =
    asString(raw.post_title) ||
    asString(raw.title) ||
    asString(raw.name) ||
    asString(raw.job_title);
  if (!title) return null;

  const company =
    asString(raw.entity_name) ||
    asString(raw.company) ||
    asString(raw.organization) ||
    asString(raw.org);

  const location =
    asString(raw.post_location) ||
    asString(raw.location) ||
    asString(raw.country);

  const description =
    asString(raw.job_description) ||
    asString(raw.description) ||
    asString(raw.content);

  const url =
    asString(raw.job_post_url) ||
    asString(raw.url) ||
    asString(raw.link) ||
    asString(raw.apply_url) ||
    asString(raw.opportunity_url);

  return {
    title,
    company,
    location,
    description,
    job_type: asString(raw.job_type) || asString(raw.type),
    salary_range: asString(raw.salary_range) ?? null,
    deadline: asString(raw.deadline) ?? asString(raw.application_deadline) ?? null,
    url,
    original: raw,
  };
}

function parseManualJson(text: string): {
  items: NormalizedOpportunity[];
  error?: string;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { items: [], error: 'Invalid JSON file. Please upload a valid .json array.' };
  }

  const rows = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { opportunities?: unknown }).opportunities)
      ? ((parsed as { opportunities: unknown[] }).opportunities)
      : parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as { jobs?: unknown }).jobs)
        ? ((parsed as { jobs: unknown[] }).jobs)
        : null;

  if (!rows) {
    return {
      items: [],
      error: 'JSON must be an array of opportunities (or { opportunities: [...] } / { jobs: [...] }).',
    };
  }

  const items: NormalizedOpportunity[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const normalized = normalizeManualJsonItem(row as Record<string, unknown>);
    if (normalized) items.push(normalized);
  }

  if (items.length === 0) {
    return {
      items: [],
      error: 'No valid opportunities found. Expected fields like post_title / title.',
    };
  }

  return { items };
}

export default function ManualScraperPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [opportunityType, setOpportunityType] = useState<OpportunityType | ''>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [items, setItems] = useState<NormalizedOpportunity[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState<NormalizedOpportunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const allSelected = items.length > 0 && selected.size === items.length;

  const typeLabel = useMemo(() => {
    if (opportunityType === 'job') return 'Jobs';
    if (opportunityType === 'funding') return 'Funding';
    if (opportunityType === 'training') return 'Training';
    return '';
  }, [opportunityType]);

  const resetFile = () => {
    setFileName(null);
    setItems([]);
    setSelected(new Set());
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file: File | null) => {
    setError(null);
    setSuccess(null);
    if (!file) return;
    if (!opportunityType) {
      setError('Select an opportunity type first (Job, Funding, or Training).');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please upload a .json file.');
      return;
    }

    try {
      const text = await file.text();
      const { items: parsed, error: parseError } = parseManualJson(text);
      if (parseError) {
        setError(parseError);
        resetFile();
        return;
      }
      setFileName(file.name);
      setItems(parsed);
      setSelected(new Set(parsed.map((_, i) => i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
      resetFile();
    }
  };

  const toggleOne = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((_, i) => i)));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!opportunityType) {
      setError('Select an opportunity type first.');
      return;
    }
    const toSave = items.filter((_, i) => selected.has(i));
    if (toSave.length === 0) {
      setError('Select at least one opportunity to save.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/scraped-opportunities/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunities: toSave.map((item) => ({
            title: item.title,
            company: item.company,
            location: item.location,
            description: item.description,
            job_type: item.job_type,
            salary_range: item.salary_range,
            deadline: item.deadline,
            url: item.url,
          })),
          opportunity_type: opportunityType,
          source_url: `manual-json:${fileName || 'upload'}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save opportunities');
        return;
      }
      const failed = Array.isArray(data.errors) ? data.errors.length : 0;
      setSuccess(
        `Saved ${data.saved} of ${data.total} ${typeLabel.toLowerCase() || 'opportunities'}${
          failed ? ` (${failed} failed)` : ''
        }.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save opportunities');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/Scraper"
            className="inline-flex items-center text-sm text-[#556B2F] hover:underline mb-3"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Scraper
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Manual Scraper</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload a JSON file of opportunities, preview them, then save into scraped
            opportunities.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Step 1 — type */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            1. Select opportunity type
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Required before uploading. All rows in the file will be saved as this type.
          </p>
          <div className="flex flex-wrap gap-3">
            {([
              { value: 'job', label: 'Job' },
              { value: 'funding', label: 'Funding' },
              { value: 'training', label: 'Training' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOpportunityType(opt.value);
                  setError(null);
                  setSuccess(null);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  opportunityType === opt.value
                    ? 'bg-[#556B2F] text-white border-[#556B2F]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#556B2F] hover:text-[#556B2F]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 — upload */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">2. Upload JSON file</h2>
          <p className="text-xs text-gray-500 mb-4">
            Expected fields: <code>entity_name</code>, <code>post_title</code>,{' '}
            <code>post_location</code>, <code>job_description</code>, <code>job_post_url</code>,{' '}
            <code>job_type</code>, <code>salary_range</code>, <code>deadline</code> (or the
            normalized scraper shape with <code>title</code> / <code>company</code> / …).
          </p>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              opportunityType
                ? 'border-[#556B2F]/40 bg-[#556B2F]/5 hover:bg-[#556B2F]/10'
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <ArrowUpTrayIcon className="h-10 w-10 mx-auto text-[#556B2F] mb-3" />
            <p className="text-sm text-gray-700 mb-3">
              {fileName ? (
                <>
                  Loaded <span className="font-semibold">{fileName}</span> ({items.length}{' '}
                  opportunities)
                </>
              ) : (
                'Drop a .json file here or click to browse'
              )}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              disabled={!opportunityType}
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={!opportunityType}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 rounded-full bg-[#556B2F] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#455624]"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Choose JSON
              </button>
              {fileName && (
                <button
                  type="button"
                  onClick={resetFile}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear
                </button>
              )}
            </div>
            {!opportunityType && (
              <p className="mt-3 text-xs text-amber-700">
                Select a type above before uploading.
              </p>
            )}
          </div>
        </section>

        {/* Step 3 — preview + save */}
        {items.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  3. Review & save ({selected.size}/{items.length} selected)
                </h2>
                <p className="text-xs text-gray-500">
                  Type: <span className="font-medium text-[#556B2F]">{typeLabel}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  type="button"
                  disabled={isSaving || selected.size === 0 || !opportunityType}
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-[#556B2F] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#455624]"
                >
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving…' : `Save ${selected.size} to database`}
                </button>
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {items.map((item, index) => {
                const isChecked = selected.has(index);
                return (
                  <li
                    key={`${item.title}-${index}`}
                    className={`px-6 py-4 flex gap-4 ${isChecked ? 'bg-white' : 'bg-gray-50/60'}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleOne(index)}
                      className={`mt-1 h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        isChecked
                          ? 'bg-[#556B2F] border-[#556B2F] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                      aria-label={isChecked ? 'Deselect' : 'Select'}
                    >
                      {isChecked && <CheckIconSolid className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                            {item.company && (
                              <span className="inline-flex items-center">
                                <BuildingOfficeIcon className="h-3.5 w-3.5 mr-1" />
                                {item.company}
                              </span>
                            )}
                            {item.location && (
                              <span className="inline-flex items-center">
                                <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                                {item.location}
                              </span>
                            )}
                            {item.job_type && (
                              <span className="rounded-full bg-olive-50 text-[#556B2F] px-2 py-0.5">
                                {item.job_type}
                              </span>
                            )}
                            {item.deadline && <span>Deadline: {item.deadline}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreview(item)}
                          className="inline-flex items-center text-xs text-[#556B2F] hover:underline"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View content
                        </button>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                          {stripHtml(item.description)}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-blue-600 hover:underline truncate max-w-full"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{preview.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {[preview.company, preview.location, preview.deadline]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div
              className="px-6 py-4 overflow-y-auto prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{
                __html: preview.description || '<p>No description.</p>',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
