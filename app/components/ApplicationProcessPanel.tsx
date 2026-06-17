'use client';

import { useState, useEffect } from 'react';
import ProcessTimeline from '@/app/components/ProcessTimeline';
import { getStepStatus } from '@/app/lib/opportunityFlow';
import type { OpportunityFlowStep } from '@/app/lib/opportunityFlow';
import { toast } from 'react-hot-toast';

interface ApplicationProcessPanelProps {
  applicationId: string;
  mode: 'seeker' | 'ngo';
  onUpdated?: () => void;
}

interface ProcessState {
  application: {
    currentStepIndex: number;
    processStatus: string;
    status: string;
  };
  steps: OpportunityFlowStep[];
  submissions: Record<string, { submissionData: Record<string, unknown> }>;
  navigableStepIndices: number[];
}

export default function ApplicationProcessPanel({
  applicationId,
  mode,
  onUpdated,
}: ApplicationProcessPanelProps) {
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [state, setState] = useState<ProcessState | null>(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [formStructure, setFormStructure] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [submittingForm, setSubmittingForm] = useState(false);

  const loadProcess = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/applications/${applicationId}/process`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load process');
      setState(data);
      setViewIndex(data.application.currentStepIndex);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcess();
  }, [applicationId]);

  useEffect(() => {
    if (!state) return;
    const step = state.steps[viewIndex];
    if (!step?.formId) {
      setFormStructure(null);
      return;
    }
    fetch(`/api/forms/${step.formId}`)
      .then((r) => r.json())
      .then((d) => setFormStructure(d.form || null))
      .catch(() => setFormStructure(null));
  }, [state, viewIndex]);

  const submissionFlags = Object.fromEntries(
    Object.keys(state?.submissions || {}).map((id) => [id, true])
  );

  const handleAction = async (action: 'advance_step' | 'reject', notes?: string) => {
    setActing(true);
    try {
      const res = await fetch(`/api/opportunities/applications/${applicationId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setState(data);
      setViewIndex(data.application.currentStepIndex);
      toast.success(action === 'advance_step' ? 'Moved to next step' : 'Application rejected');
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const handleSubmitStepForm = async () => {
    if (!state) return;
    const step = state.steps[state.application.currentStepIndex];
    if (!step) return;

    setSubmittingForm(true);
    try {
      const res = await fetch(`/api/opportunities/applications/${applicationId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_step_form', submissionData: formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit form');
      setState(data);
      setFormData({});
      toast.success('Form submitted');
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setSubmittingForm(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500 animate-pulse">Loading process...</p>;
  }

  if (!state || state.steps.length === 0) {
    return null;
  }

  const { application, steps } = state;
  const viewedStep = steps[viewIndex];
  const currentStep = steps[application.currentStepIndex];
  const viewedSubmission = viewedStep ? state.submissions[viewedStep.id] : null;
  const stepStatus = getStepStatus(
    viewIndex,
    application.currentStepIndex,
    application.processStatus,
    Boolean(viewedStep?.formId),
    Boolean(viewedSubmission)
  );

  const canFillForm =
    mode === 'seeker' &&
    viewIndex === application.currentStepIndex &&
    viewedStep?.formId &&
    !viewedSubmission &&
    application.processStatus === 'in_progress';

  const canNgoAct =
    mode === 'ngo' &&
    application.processStatus === 'in_progress' &&
    viewIndex === application.currentStepIndex &&
    (!currentStep?.formId || Boolean(state.submissions[currentStep.id]));

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Application Process</h4>

      <ProcessTimeline
        steps={steps}
        currentStepIndex={application.currentStepIndex}
        processStatus={application.processStatus}
        submissions={submissionFlags}
        mode="progress"
        activeViewIndex={viewIndex}
        onStepClick={(index) => {
          if (index <= application.currentStepIndex) setViewIndex(index);
        }}
      />

      {viewedStep && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-800">{viewedStep.name}</h5>
          {viewedStep.description && (
            <p className="text-sm text-gray-600 mt-1">{viewedStep.description}</p>
          )}

          {viewedSubmission && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-green-700">Form submitted</p>
              {Object.entries(viewedSubmission.submissionData || {}).map(([key, value]) => (
                <div key={key} className="bg-white p-2 rounded text-sm">
                  <span className="text-gray-500">{key}: </span>
                  <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {canFillForm && formStructure && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-amber-800">Complete the form for this step</p>
              {(formStructure.sections || []).map((section: any) => (
                <div key={section.id} className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase">{section.title}</p>
                  {(section.questions || []).map((q: any) => (
                    <div key={q.id}>
                      <label className="block text-sm text-gray-700 mb-1">{q.label}</label>
                      {q.type === 'textarea' ? (
                        <textarea
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={(formData[q.id] as string) || ''}
                          onChange={(e) => setFormData({ ...formData, [q.id]: e.target.value })}
                        />
                      ) : q.type === 'checkbox' && q.options ? (
                        <div className="space-y-1">
                          {q.options.map((opt: string) => (
                            <label key={opt} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={((formData[q.id] as string[]) || []).includes(opt)}
                                onChange={(e) => {
                                  const prev = (formData[q.id] as string[]) || [];
                                  setFormData({
                                    ...formData,
                                    [q.id]: e.target.checked
                                      ? [...prev, opt]
                                      : prev.filter((v) => v !== opt),
                                  });
                                }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={(formData[q.id] as string) || ''}
                          onChange={(e) => setFormData({ ...formData, [q.id]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={handleSubmitStepForm}
                disabled={submittingForm}
                className="px-4 py-2 bg-olive-dark text-white text-sm rounded-lg hover:bg-olive-medium disabled:opacity-50"
              >
                {submittingForm ? 'Submitting...' : 'Submit Step Form'}
              </button>
            </div>
          )}

          {stepStatus === 'locked' && (
            <p className="mt-2 text-xs text-gray-500">This step is not yet available.</p>
          )}
        </div>
      )}

      {canNgoAct && (
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            disabled={acting}
            onClick={() => handleAction('advance_step')}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Accept — move to next step
          </button>
          <button
            type="button"
            disabled={acting}
            onClick={() => handleAction('reject')}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Reject application
          </button>
        </div>
      )}

      {application.processStatus === 'completed' && (
        <p className="text-sm text-green-700 font-medium">All process steps completed.</p>
      )}
      {application.processStatus === 'rejected' && (
        <p className="text-sm text-red-700 font-medium">Application was rejected.</p>
      )}
    </div>
  );
}
