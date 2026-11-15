'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  BanknotesIcon,
  BellIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { AuthService } from '@/app/lib/auth';
import { getOpportunities, type Opportunity } from '@/app/lib/opportunities';
import {
  ALERT_TYPE_LABELS,
  deleteSeekerAlert,
  describeAlertFilters,
  formatAlertDeadline,
  loadSeekerAlerts,
  matchingOpportunities,
  saveSeekerAlert,
  shortOpportunityDescription,
  type AlertDraft,
  type OpportunityAlertType,
  type SeekerOpportunityAlert,
} from '@/app/lib/opportunityAlerts';
import AlertEditor from './AlertEditor';

type Section = 'manage' | 'results';
type ManageTab = 'new' | 'list';

const TYPE_STYLES: Record<OpportunityAlertType, string> = {
  job: 'bg-blue-100 text-blue-800',
  funding: 'bg-green-100 text-green-800',
  training: 'bg-purple-100 text-purple-800',
};

function TypeIcon({ type, className }: { type: OpportunityAlertType; className?: string }) {
  if (type === 'funding') return <BanknotesIcon className={className} />;
  if (type === 'training') return <AcademicCapIcon className={className} />;
  return <BriefcaseIcon className={className} />;
}

export default function OpportunitiesAlertsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const section: Section = pathname?.includes('/alerts/results') ? 'results' : 'manage';
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storedLocally, setStoredLocally] = useState(false);
  const [alerts, setAlerts] = useState<SeekerOpportunityAlert[]>([]);
  const [manageTab, setManageTab] = useState<ManageTab>('new');
  const [editing, setEditing] = useState<SeekerOpportunityAlert | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [openAlertIds, setOpenAlertIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { user } = await AuthService.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUserId(user.id);
      try {
        const result = await loadSeekerAlerts(user.id);
        setAlerts(result.alerts);
        setStoredLocally(result.storedLocally);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load alerts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const loadResults = useCallback(async () => {
    setResultsLoading(true);
    setResultsError(null);
    const { opportunities: data, error } = await getOpportunities();
    if (error) setResultsError(error);
    else setOpportunities(data || []);
    setNow(Date.now());
    setResultsLoading(false);
  }, []);

  useEffect(() => {
    if (section !== 'results') return;
    loadResults();
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, [section, loadResults]);

  const results = useMemo(
    () => alerts.map((alert) => ({ alert, opportunities: matchingOpportunities(alert, opportunities, now) })),
    [alerts, opportunities, now]
  );

  const startNew = () => {
    setEditing(null);
    setFormKey((key) => key + 1);
    setManageTab('new');
    if (section !== 'manage') router.push('/seeker/opportunities/alerts');
  };

  const startEdit = (alert: SeekerOpportunityAlert) => {
    setEditing(alert);
    setFormKey((key) => key + 1);
    setManageTab('new');
    if (section !== 'manage') router.push('/seeker/opportunities/alerts');
  };

  const handleSave = async (draft: AlertDraft) => {
    if (!userId) return;
    setSaving(true);
    try {
      const saved = await saveSeekerAlert(userId, draft, editing?.id);
      setAlerts((current) => {
        const without = current.filter((alert) => alert.id !== saved.id);
        return [saved, ...without].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
      toast.success(editing ? 'Alert updated' : 'Alert saved');
      setEditing(null);
      setFormKey((key) => key + 1);
      setManageTab('list');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the alert');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!userId) return;
    setDeletingId(alertId);
    try {
      await deleteSeekerAlert(userId, alertId);
      setAlerts((current) => current.filter((alert) => alert.id !== alertId));
      if (editing?.id === alertId) {
        setEditing(null);
        setFormKey((key) => key + 1);
      }
      setConfirmDeleteId(null);
      toast.success('Alert deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete the alert');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAlert = (alertId: string) => {
    setOpenAlertIds((current) =>
      current.includes(alertId) ? current.filter((id) => id !== alertId) : [...current, alertId]
    );
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-olive" />
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">
          {section === 'results' ? 'Results' : 'Manage Alerts'}
        </h1>
      </header>

      <div className="p-6">
        <p className="text-gray-600 mb-6">
          {section === 'results'
            ? 'Open an alert to see the opportunities that still match it. A listing stays here until its deadline has passed.'
            : 'Save the jobs, funding, and training you want to follow. Choose New Alert or List of Alerts below.'}
        </p>

        {storedLocally && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Alerts are saved in this browser. Run <span className="font-medium">database/migrations/create_seeker_opportunity_alerts.sql</span> in Supabase to keep them on your account.
          </div>
        )}

        {section === 'manage' && (
          <>
            <div className="mb-4 flex gap-2 border-b border-olive-100">
              <button
                type="button"
                onClick={() => (editing ? setManageTab('new') : startNew())}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  manageTab === 'new'
                    ? 'border-olive text-olive'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {editing ? 'Edit Alert' : 'New Alert'}
              </button>
              <button
                type="button"
                onClick={() => setManageTab('list')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  manageTab === 'list'
                    ? 'border-olive text-olive'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                List of Alerts
              </button>
            </div>

            {manageTab === 'new' ? (
              <AlertEditor
                key={formKey}
                initial={editing}
                saving={saving}
                onSave={handleSave}
                onCancel={editing ? () => { setEditing(null); setManageTab('list'); } : undefined}
              />
            ) : alerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-olive-100 shadow-sm text-center py-14 px-6">
                <BellIcon className="w-14 h-14 text-olive-300 mx-auto mb-3" />
                <h2 className="text-lg font-medium text-gray-700">No alerts yet</h2>
                <p className="text-gray-500 mt-1 mb-4">Create an alert to follow opportunities that match your criteria.</p>
                <button
                  type="button"
                  onClick={startNew}
                  className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-olive-medium"
                >
                  New Alert
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const details = describeAlertFilters(alert.filters);
                  return (
                    <article key={alert.id} className="bg-white rounded-xl border border-olive-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[alert.opportunityType]}`}>
                              <TypeIcon type={alert.opportunityType} className="h-3.5 w-3.5" />
                              {ALERT_TYPE_LABELS[alert.opportunityType]}
                            </span>
                            <h2 className="text-lg font-medium text-gray-800">{alert.name}</h2>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {details.length > 0 ? details.map((detail) => (
                              <span key={detail} className="px-3 py-1 bg-olive-50 text-olive-800 text-sm rounded-full">
                                {detail}
                              </span>
                            )) : (
                              <span className="text-sm text-gray-500">All open {alert.opportunityType} opportunities</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(alert)}
                            className="p-2 text-gray-500 hover:text-olive rounded-full"
                            aria-label={`Edit ${alert.name}`}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(alert.id)}
                            className="p-2 text-gray-500 hover:text-red-600 rounded-full"
                            aria-label={`Delete ${alert.name}`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {confirmDeleteId === alert.id && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                          <p className="text-sm text-red-800">Delete this alert?</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === alert.id}
                              onClick={() => handleDelete(alert.id)}
                              className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white disabled:opacity-60"
                            >
                              {deletingId === alert.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {section === 'results' && (
          <div className="space-y-3">
            {resultsLoading && opportunities.length === 0 ? (
              <div className="flex justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-olive" />
              </div>
            ) : resultsError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{resultsError}</div>
            ) : alerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-olive-100 shadow-sm text-center py-14 px-6">
                <BellIcon className="w-14 h-14 text-olive-300 mx-auto mb-3" />
                <h2 className="text-lg font-medium text-gray-700">No alerts to check</h2>
                <p className="text-gray-500 mt-1 mb-4">Create an alert first, then matching opportunities will show up here.</p>
                <button
                  type="button"
                  onClick={startNew}
                  className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-olive-medium"
                >
                  New Alert
                </button>
              </div>
            ) : (
              results.map(({ alert, opportunities: matches }) => {
                const open = openAlertIds.includes(alert.id);
                const countLabel = matches.length === 1 ? '1 opportunity' : `${matches.length} opportunities`;
                return (
                  <section key={alert.id} className="bg-white rounded-xl border border-olive-100 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleAlert(alert.id)}
                      aria-expanded={open}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-olive-50/60"
                    >
                      <ChevronDownIcon className={`h-5 w-5 text-olive-600 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[alert.opportunityType]}`}>
                        <TypeIcon type={alert.opportunityType} className="h-3.5 w-3.5" />
                        {ALERT_TYPE_LABELS[alert.opportunityType]}
                      </span>
                      <span className="font-medium text-gray-800 truncate">{alert.name}</span>
                      <span className="ml-auto shrink-0 inline-flex items-center rounded-full bg-olive px-2.5 py-1 text-xs font-semibold text-white">
                        {countLabel}
                      </span>
                    </button>

                    {open && (
                      <div className="border-t border-olive-100 px-5 py-4 space-y-3">
                        {matches.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No open opportunities match this alert. Listings leave this alert as soon as their deadline has passed.
                          </p>
                        ) : (
                          matches.map((opportunity) => (
                            <article key={opportunity.id} className="rounded-lg border border-gray-200 p-4">
                              <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                              <p className="mt-1 text-sm text-gray-600">{shortOpportunityDescription(opportunity.description)}</p>
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {formatAlertDeadline(opportunity.deadline)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <BuildingOffice2Icon className="h-4 w-4" />
                                  {opportunity.organization || 'Organization not listed'}
                                </span>
                              </div>
                              <Link
                                href={`/seeker/opportunities/${opportunity.id}`}
                                className="inline-flex mt-3 text-sm font-medium text-olive hover:text-olive-medium"
                              >
                                View opportunity
                              </Link>
                            </article>
                          ))
                        )}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
