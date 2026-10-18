'use client';

import { useEffect, useState } from 'react';
import { ArrowPathIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  getAccessGateEnabled,
  setAccessGateEnabled,
} from '../services/accessManagementService';

export default function AccessManagementPage() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setEnabled(await getAccessGateEnabled());
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load access setting');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    setSaving(true);
    try {
      const { error } = await setAccessGateEnabled(next);
      if (error) {
        toast.error(error);
        return;
      }
      setEnabled(next);
      toast.success(next ? 'Access lock activated' : 'Access lock deactivated');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Access</h1>
        <p className="mt-1 text-sm text-gray-500">
          Activate or deactivate the lock on the SM page that protects access to the landing page
          and the rest of the web app.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                enabled ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {enabled ? (
                <LockClosedIcon className="h-6 w-6" />
              ) : (
                <LockOpenIcon className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {enabled ? 'Lock is active' : 'Lock is inactive'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {enabled
                  ? 'Visitors must sign in on the SM page before they can open the landing page (/app) and other protected routes.'
                  : 'Anyone can open the landing page and other routes from the SM page without exclusive access credentials.'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {enabled ? 'Deactivate lock' : 'Activate lock'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={saving}
              onClick={handleToggle}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-60 ${
                enabled ? 'bg-[#556B2F]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
