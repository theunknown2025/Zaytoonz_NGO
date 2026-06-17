'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import FlowStepIconPicker from '@/app/components/FlowStepIconPicker';
import OpportunityFaqDisplay from '@/app/components/OpportunityFaqDisplay';
import type { FlowStepIconKey } from '@/app/lib/flowStepIcons';
import { createEmptyFaqItem, type OpportunityFaqItem } from '@/app/lib/opportunityFaq';
import { saveOpportunityFaqItems } from '../services/opportunityFaqService';
import { toast } from 'react-hot-toast';

interface OpportunityFaqSectionProps {
  faqItems: OpportunityFaqItem[];
  opportunityId?: string;
  onFaqItemsReplace: (items: OpportunityFaqItem[]) => void;
  embedded?: boolean;
}

export interface OpportunityFaqHandle {
  validateAndSave: () => Promise<boolean>;
}

const OpportunityFaqSection = forwardRef<OpportunityFaqHandle, OpportunityFaqSectionProps>(
  function OpportunityFaqSection({ faqItems, opportunityId, onFaqItemsReplace, embedded = false }, ref) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const updateItem = (itemId: string, field: keyof OpportunityFaqItem, value: string) => {
      onFaqItemsReplace(
        faqItems.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
      );
    };

    const addItem = () => {
      onFaqItemsReplace([...faqItems, createEmptyFaqItem(faqItems.length)]);
    };

    const removeItem = (itemId: string) => {
      onFaqItemsReplace(
        faqItems
          .filter((item) => item.id !== itemId)
          .map((item, index) => ({ ...item, faqOrder: index }))
      );
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      faqItems.forEach((item) => {
        const hasQuestion = item.question.trim().length > 0;
        const hasAnswer = item.answer.trim().length > 0;

        if (hasQuestion && !hasAnswer) {
          newErrors[`faq-${item.id}-answer`] = 'Answer is required when a question is provided';
        }
        if (!hasQuestion && hasAnswer) {
          newErrors[`faq-${item.id}-question`] = 'Question is required when an answer is provided';
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const persistFaq = async (silent = false) => {
      if (!opportunityId) {
        toast.error('Opportunity ID is required to save FAQ');
        return false;
      }

      try {
        setIsSaving(true);
        const saved = await saveOpportunityFaqItems(opportunityId, faqItems);
        onFaqItemsReplace(saved);
        if (!silent) {
          toast.success('FAQ saved');
        }
        return true;
      } catch (error: unknown) {
        console.error('Error saving FAQ:', error);
        const message = error instanceof Error ? error.message : 'Failed to save FAQ';
        toast.error(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    const validateAndSave = async (): Promise<boolean> => {
      const hasContent = faqItems.some(
        (item) => item.question.trim().length > 0 || item.answer.trim().length > 0
      );
      if (!hasContent) return true;
      if (!validateForm()) return false;
      return persistFaq(true);
    };

    useImperativeHandle(ref, () => ({ validateAndSave }));

    const editorContent = (
      <div className="space-y-4">
        {faqItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#556B2F]/30 bg-white/70 p-6 text-center">
            <p className="mb-4 text-sm text-gray-600">
              Add frequently asked questions to help applicants understand this opportunity.
            </p>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center rounded-md bg-[#556B2F] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B8E23]"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add first question
            </button>
          </div>
        ) : (
          faqItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#556B2F]/20 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#556B2F]">Question {index + 1}</span>
                {faqItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-md p-2 text-red-500 hover:bg-red-50"
                    aria-label="Remove question"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Question</label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#556B2F] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    placeholder="e.g. Who is eligible to apply?"
                  />
                  {errors[`faq-${item.id}-question`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`faq-${item.id}-question`]}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Answer</label>
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#556B2F] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    placeholder="Provide a clear answer for applicants"
                  />
                  {errors[`faq-${item.id}-answer`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`faq-${item.id}-answer`]}</p>
                  )}
                </div>

                <div>
                  <FlowStepIconPicker
                    value={item.icon}
                    onChange={(icon: FlowStepIconKey) => updateItem(item.id, 'icon', icon)}
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {faqItems.length > 0 && (
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center rounded-md border border-[#556B2F]/30 bg-white px-4 py-2 text-sm font-medium text-[#556B2F] hover:bg-[#556B2F]/5"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add question
          </button>
        )}

        {faqItems.some((item) => item.question.trim() && item.answer.trim()) && (
          <div className="rounded-xl border border-[#556B2F]/20 bg-[#556B2F]/5 p-5">
            <h4 className="mb-4 text-sm font-semibold text-[#556B2F]">Preview</h4>
            <OpportunityFaqDisplay items={faqItems} mode="preview" />
          </div>
        )}

        {!embedded && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => persistFaq()}
              disabled={isSaving}
              className="rounded-md bg-[#556B2F] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B8E23] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save FAQ'}
            </button>
          </div>
        )}
      </div>
    );

    return editorContent;
  }
);

export default OpportunityFaqSection;
