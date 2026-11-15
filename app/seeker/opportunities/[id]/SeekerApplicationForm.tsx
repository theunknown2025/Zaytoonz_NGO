'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Opportunity } from '@/app/lib/opportunities';
import { useAuth } from '@/app/lib/auth';
import { getCVs } from '@/app/seeker/tools/cv-maker/supabaseService';

type AnswerValue = string | string[];

type SavedCv = { id: string; name: string };

type ExistingApplication = {
  id: string;
  status: string;
  application_data?: Record<string, AnswerValue> | null;
  selected_cv_id?: string | null;
  selected_cv_name?: string | null;
};

function formSections(form: Opportunity['applicationForm']) {
  const structure = form?.form_structure;
  if (Array.isArray(structure)) return structure;
  if (structure && typeof structure === 'object') return Object.values(structure);
  return [];
}

function isSubmittedStatus(status?: string | null) {
  return Boolean(status && status !== 'draft');
}

export default function SeekerApplicationForm({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const { user } = useAuth();
  const sections = formSections(opportunity.applicationForm);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existing, setExisting] = useState<ExistingApplication | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [savedCvs, setSavedCvs] = useState<SavedCv[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [skipCvConfirmed, setSkipCvConfirmed] = useState(false);
  const [showCvPrompt, setShowCvPrompt] = useState(false);
  const [cvPromptIntent, setCvPromptIntent] = useState<'choice' | 'submit'>('choice');
  const cvSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoadingExisting(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/opportunities/applications?seekerUserId=${user.id}`);
        const data = await response.json();
        if (!response.ok || cancelled) return;
        const match = (data.applications || []).find(
          (app: ExistingApplication & { opportunity_id?: string }) => app.opportunity_id === opportunity.id
        );
        if (!match || cancelled) return;
        setExisting(match);
        setAnswers(match.application_data || {});
        if (match.selected_cv_id) {
          setSelectedCvId(match.selected_cv_id);
          setSkipCvConfirmed(false);
        }
      } catch (error) {
        console.error('Error loading existing application:', error);
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, opportunity.id]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setCvLoading(true);
      const { data, error } = await getCVs();
      if (!cancelled) {
        if (!error && data) setSavedCvs(data);
        setCvLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: '' }));
    }
  };

  const selectedCvName = savedCvs.find((cv) => cv.id === selectedCvId)?.name || existing?.selected_cv_name || null;
  const hasCv = Boolean(selectedCvId);

  const openCvPrompt = (intent: 'choice' | 'submit') => {
    setCvPromptIntent(intent);
    setShowCvPrompt(true);
  };

  const closeCvPrompt = () => {
    setShowCvPrompt(false);
    cvSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const persist = async (mode: 'draft' | 'submit', options?: { allowMissingCv?: boolean }) => {
    setSubmitError(null);
    if (!user) {
      setSubmitError('Sign in to save this application.');
      return;
    }
    if (!opportunity.applicationForm?.id) {
      setSubmitError('This opportunity does not have an application form.');
      return;
    }
    if (isSubmittedStatus(existing?.status)) return;

    if (mode === 'submit') {
      const nextErrors: Record<string, string> = {};
      sections.forEach((section: { questions?: Array<{ id: string; label: string; required?: boolean }> }) => {
        section.questions?.forEach((question) => {
          if (!question.required) return;
          const value = answers[question.id];
          const empty =
            value == null ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'string' && value.trim() === '');
          if (empty) nextErrors[question.id] = `${question.label} is required`;
        });
      });
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      if (!hasCv && !options?.allowMissingCv && !skipCvConfirmed) {
        openCvPrompt('submit');
        return;
      }
    }

    setSaving(mode);
    try {
      const payload = {
        opportunityId: opportunity.id,
        seekerUserId: user.id,
        formId: opportunity.applicationForm.id,
        applicationData: answers,
        selectedCVId: hasCv ? selectedCvId : null,
        selectedCVName: hasCv ? selectedCvName : null,
        notes: mode === 'draft'
          ? `Draft saved for ${opportunity.title}`
          : `Application submitted for ${opportunity.title}`,
        status: mode === 'draft' ? 'draft' : 'submitted',
      };
      const response = await fetch(
        existing?.id ? `/api/opportunities/applications/${existing.id}` : '/api/opportunities/applications',
        {
          method: existing?.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save application');
      setExisting(result.application);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save application');
    } finally {
      setSaving(null);
    }
  };

  const confirmWithoutCv = () => {
    setSkipCvConfirmed(true);
    setSelectedCvId('');
    setShowCvPrompt(false);
    if (cvPromptIntent === 'submit') {
      void persist('submit', { allowMissingCv: true });
    }
  };

  useEffect(() => {
    if (!showCvPrompt) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCvPrompt();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCvPrompt]);

  if (loadingExisting) {
    return <p className="text-sm text-olive-600">Checking your application…</p>;
  }

  if (isSubmittedStatus(existing?.status)) {
    return (
      <div className="rounded-xl border border-olive-200 bg-olive-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-olive-700" />
          <div>
            <h3 className="text-base font-semibold text-olive-900">You have already applied</h3>
            <p className="mt-2 text-sm leading-relaxed text-olive-800">
              This application has been submitted and can no longer be edited. Follow its progress in My Applications.
            </p>
            <Link
              href="/seeker/opportunities/applications"
              className="mt-4 inline-flex rounded-xl bg-olive-700 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-800"
            >
              My Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        persist('submit');
      }}
      className="space-y-8"
    >
      {existing?.status === 'draft' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          You have a draft of this application. Continue editing your answers, then submit when you are ready.
          You can also find this draft in{' '}
          <Link href="/seeker/opportunities/applications" className="font-semibold underline">
            My Applications
          </Link>
          .
        </div>
      )}

      {sections.length === 0 ? (
        <p className="text-sm text-olive-600">This application form has no questions yet.</p>
      ) : (
        sections.map((section: { id?: string; title?: string; questions?: any[] }, sectionIndex: number) => (
          <div key={section.id || sectionIndex} className="space-y-4">
            {section.title && (
              <h3 className="border-b border-olive-100 pb-2 text-base font-semibold text-olive-900">
                {section.title}
              </h3>
            )}
            <div className="space-y-4">
              {section.questions?.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  error={errors[question.id]}
                  onChange={setAnswer}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <div ref={cvSectionRef} className="rounded-xl border border-olive-200 bg-olive-50/60 p-4">
        <p className="text-sm font-semibold text-olive-900">
          Add a CV <span className="text-red-500">*</span>
        </p>
        <p className="mt-1 text-xs text-olive-700">
          Select one of your saved CVs to include with this application.
        </p>
        <div className="mt-4">
          {cvLoading ? (
            <p className="text-sm text-olive-600">Loading your CVs…</p>
          ) : savedCvs.length === 0 ? (
            <p className="text-sm text-olive-700">
              You have no saved CVs.{' '}
              <Link href="/seeker/tools/cv-maker" className="font-semibold underline">
                Create one in CV Maker
              </Link>
              .
            </p>
          ) : (
            <select
              value={selectedCvId}
              onChange={(event) => {
                setSelectedCvId(event.target.value);
                if (event.target.value) setSkipCvConfirmed(false);
              }}
              disabled={skipCvConfirmed}
              className="w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm text-olive-900 disabled:bg-olive-100 disabled:text-olive-500"
            >
              <option value="">Select a saved CV</option>
              {savedCvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.name}
                </option>
              ))}
              {selectedCvId && !savedCvs.some((cv) => cv.id === selectedCvId) && existing?.selected_cv_name && (
                <option value={selectedCvId}>{existing.selected_cv_name}</option>
              )}
            </select>
          )}
          <label className="mt-4 flex items-start gap-2 text-sm text-olive-800">
            <input
              type="checkbox"
              checked={skipCvConfirmed}
              onChange={() => {
                if (skipCvConfirmed) {
                  setSkipCvConfirmed(false);
                  return;
                }
                openCvPrompt('choice');
              }}
              className="mt-0.5 rounded border-olive-300 text-olive-700 focus:ring-olive-500"
            />
            <span>I don&apos;t want to add a CV</span>
          </label>
          {skipCvConfirmed && (
            <p className="mt-2 text-sm text-amber-800">
              You confirmed this application will be sent without a CV.
            </p>
          )}
        </div>
      </div>

      {showCvPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeCvPrompt}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="missing-cv-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h3 id="missing-cv-title" className="text-lg font-semibold text-olive-900">
                  You didn&apos;t include a CV
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-olive-700">
                  A CV is part of this application, and you haven&apos;t added one. Go back to select a saved CV, or
                  confirm that you want to continue without it.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCvPrompt}
                className="rounded-xl border border-olive-200 px-4 py-2 text-sm font-medium text-olive-800 hover:bg-olive-50"
              >
                Add a CV
              </button>
              <button
                type="button"
                onClick={confirmWithoutCv}
                className="rounded-xl bg-olive-700 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-800"
              >
                {cvPromptIntent === 'submit' ? 'Submit without a CV' : 'Confirm, continue without a CV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <p className="flex items-start gap-2 text-sm text-red-700">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => persist('draft')}
          disabled={saving !== null}
          className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-olive-700 px-6 py-3.5 text-sm font-semibold text-olive-800 hover:bg-olive-50 disabled:opacity-60"
        >
          {saving === 'draft' ? 'Saving draft…' : 'Save draft'}
        </button>
        <button
          type="submit"
          disabled={saving !== null}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-olive-700 px-6 py-3.5 text-sm font-semibold text-white hover:bg-olive-800 disabled:opacity-60"
        >
          {saving === 'submit' ? 'Submitting…' : 'Submit application'}
        </button>
      </div>
    </form>
  );
}

function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: {
    id: string;
    type?: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
  };
  value: AnswerValue | undefined;
  error?: string;
  onChange: (id: string, value: AnswerValue) => void;
}) {
  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm text-olive-900 focus:outline-none focus:ring-2 focus:ring-olive-500 ${
    error ? 'border-red-400' : 'border-olive-200'
  }`;

  let control: React.ReactNode;
  if (question.type === 'textarea') {
    control = (
      <textarea
        value={(value as string) || ''}
        onChange={(event) => onChange(question.id, event.target.value)}
        placeholder={question.placeholder}
        rows={4}
        className={`${inputClass} resize-y`}
      />
    );
  } else if (question.type === 'select') {
    control = (
      <select
        value={(value as string) || ''}
        onChange={(event) => onChange(question.id, event.target.value)}
        className={inputClass}
      >
        <option value="">Select an option</option>
        {question.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else if (question.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    control = (
      <div className="space-y-2">
        {question.options?.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-olive-800">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => {
                onChange(
                  question.id,
                  event.target.checked ? [...selected, option] : selected.filter((item) => item !== option)
                );
              }}
              className="rounded border-olive-300 text-olive-700 focus:ring-olive-500"
            />
            {option}
          </label>
        ))}
      </div>
    );
  } else if (question.type === 'radio') {
    control = (
      <div className="space-y-2">
        {question.options?.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-olive-800">
            <input
              type="radio"
              name={question.id}
              checked={value === option}
              onChange={() => onChange(question.id, option)}
              className="border-olive-300 text-olive-700 focus:ring-olive-500"
            />
            {option}
          </label>
        ))}
      </div>
    );
  } else {
    const inputType =
      question.type === 'email' || question.type === 'tel' || question.type === 'date' ? question.type : 'text';
    control = (
      <input
        type={inputType}
        value={(value as string) || ''}
        onChange={(event) => onChange(question.id, event.target.value)}
        placeholder={question.placeholder}
        className={inputClass}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-olive-800">
        {question.label}
        {question.required && <span className="text-red-500"> *</span>}
      </label>
      {control}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
