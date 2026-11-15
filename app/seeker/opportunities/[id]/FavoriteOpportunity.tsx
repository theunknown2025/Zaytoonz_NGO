'use client';

import React, { useEffect, useState } from 'react';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/app/lib/auth';
import {
  FAVORITES_CHANGED_EVENT,
  readFavoriteIds,
  toggleFavoriteId,
} from '../favoriteOpportunities';

interface FavoriteOpportunityProps {
  opportunityId: string;
  title: string;
}

export default function FavoriteOpportunity({ opportunityId, title }: FavoriteOpportunityProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    const sync = () => setIsSaved(readFavoriteIds().includes(opportunityId));
    sync();
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [opportunityId]);

  const handleToggle = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { saved } = toggleFavoriteId(opportunityId);
      setIsSaved(saved);
      setShowSavedToast(saved);
      if (saved) {
        setTimeout(() => setShowSavedToast(false), 1500);
      }
    } catch (err) {
      console.error('Failed to save favorite', err);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-olive-200 text-olive-800 hover:bg-olive-50 transition text-sm font-medium"
      >
        {isSaved ? <HeartSolidIcon className="h-5 w-5 text-rose-600" /> : <HeartIcon className="h-5 w-5" />}
        {isSaved ? 'Saved' : 'Save to favorites'}
      </button>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-olive-500 hover:text-olive-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <p className="text-sm uppercase tracking-wide text-olive-500 mb-2">Save to favorites</p>
            <h3 className="text-lg font-semibold text-olive-900">Create an account to save opportunities</h3>
            <p className="text-olive-700 text-sm mt-2">
              Sign up or sign in to keep “{title}” in your favorites and access it anytime.
            </p>

            <div className="mt-4 flex gap-3">
              <a
                href="/auth/signup"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-olive-700 text-white font-semibold hover:bg-olive-800 transition"
              >
                Subscribe (Sign up)
              </a>
              <a
                href="/auth/signin"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-olive-200 text-olive-800 hover:bg-olive-50 transition font-semibold"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      )}

      {showSavedToast && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl bg-olive-800 text-white shadow-lg text-sm">
          Saved to favorites
        </div>
      )}
    </>
  );
}

