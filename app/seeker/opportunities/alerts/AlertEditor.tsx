'use client';

import React, { useState } from 'react';
import {
  ALERT_CRITERIA,
  ALERT_TYPE_LABELS,
  type AlertDraft,
  type AlertFilters,
  type OpportunityAlertType,
  type SeekerOpportunityAlert,
} from '@/app/lib/opportunityAlerts';
import MultiSelectFilter from '../MultiSelectFilter';
import { AcademicCapIcon, BanknotesIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const TYPE_OPTIONS: { id: OpportunityAlertType; icon: typeof BriefcaseIcon; hint: string }[] = [
  { id: 'job', icon: BriefcaseIcon, hint: 'Contract, level, sector, location' },
  { id: 'funding', icon: BanknotesIcon, hint: 'Type, eligibility, amount, purpose' },
  { id: 'training', icon: AcademicCapIcon, hint: 'Format, duration, level, cost' },
];

interface AlertEditorProps {
  initial?: SeekerOpportunityAlert | null;
  saving: boolean;
  onSave: (draft: AlertDraft) => void;
  onCancel?: () => void;
}

export default function AlertEditor({ initial, saving, onSave, onCancel }: AlertEditorProps) {
  const [name, setName] = useState(initial?.name || '');
  const [opportunityType, setOpportunityType] = useState<OpportunityAlertType | ''>(initial?.opportunityType || '');
  const [filters, setFilters] = useState<AlertFilters>(initial?.filters || {});
  const [customSector, setCustomSector] = useState('');
  const [error, setError] = useState<string | null>(null);

  const criteria = opportunityType ? ALERT_CRITERIA[opportunityType] : [];

  const updateFilter = (key: keyof AlertFilters, values: string[]) => {
    setFilters((current) => {
      const next = { ...current };
      if (values.length === 0) delete next[key];
      else next[key] = values;
      return next;
    });
  };

  const addCustomSector = () => {
    const value = customSector.trim();
    if (!value) return;
    const current = filters.sector || [];
    if (!current.some((item) => item.toLowerCase() === value.toLowerCase())) {
      updateFilter('sector', [...current, value]);
    }
    setCustomSector('');
  };

  const handleTypeChange = (nextType: OpportunityAlertType) => {
    if (nextType === opportunityType) return;
    setOpportunityType(nextType);
    setFilters({});
    setCustomSector('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give this alert a name.');
      return;
    }
    if (!opportunityType) {
      setError('Select an opportunity type.');
      return;
    }
    setError(null);
    onSave({ name: trimmed, opportunityType, filters });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-olive-100 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {initial ? 'Edit alert' : 'New alert'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose the opportunity type, then select the values you want for each criterion.
          A criterion left empty matches every value. Results stay listed until the opportunity deadline has passed.
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="alert-name" className="block text-sm font-medium text-gray-700 mb-2">
          Alert name
        </label>
        <input
          id="alert-name"
          type="text"
          value={name}
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Remote education jobs in Morocco"
          className="w-full px-3 py-2.5 border border-olive-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
        />
      </div>

      <div className="mb-6">
        <p className="block text-sm font-medium text-gray-700 mb-2">Opportunity type</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = opportunityType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleTypeChange(option.id)}
                className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                  selected
                    ? 'border-olive bg-olive/10 ring-2 ring-olive'
                    : 'border-olive-200 hover:border-olive-400 bg-white'
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-gray-800">
                  <Icon className={`h-5 w-5 ${selected ? 'text-olive' : 'text-olive-600'}`} />
                  {ALERT_TYPE_LABELS[option.id]}
                </span>
                <span className="mt-1 block text-xs text-gray-500">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {opportunityType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {criteria.map((criterion) => {
            const selected = filters[criterion.key] || [];
            const options =
              criterion.key === 'sector'
                ? Array.from(new Set([...criterion.options, ...selected])).map((value) => ({ value, label: value }))
                : criterion.options.map((value) => ({ value, label: value }));

            return (
              <div key={criterion.key} className={criterion.key === 'country' ? 'md:col-span-2' : undefined}>
                <MultiSelectFilter
                  label={criterion.label}
                  options={options}
                  selected={selected}
                  onChange={(values) => updateFilter(criterion.key, values)}
                  placeholder="Any"
                  searchable={criterion.searchable || options.length > 8}
                  searchPlaceholder={`Search ${criterion.label.toLowerCase()}`}
                />
                {criterion.key === 'sector' && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={customSector}
                      onChange={(event) => setCustomSector(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addCustomSector();
                        }
                      }}
                      placeholder="Add another sector"
                      className="flex-1 px-3 py-2 border border-olive-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomSector}
                      className="px-3 py-2 text-sm rounded-lg border border-olive-200 text-olive-800 hover:bg-olive-50"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-olive-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Save alert'}
        </button>
      </div>
    </form>
  );
}
