'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Opportunity } from '@/app/lib/opportunities';
import type { User } from '@/app/lib/auth';
import { AuthService } from '@/app/lib/auth';
import ShareOpportunity from './ShareOpportunity';
import FavoriteOpportunity from './FavoriteOpportunity';
import OpportunityDescriptionRich from './OpportunityDescriptionRich';

export type SeekerListingKind = 'ngo_partner' | 'platform_curated' | 'external_feed';

export interface UnifiedSeekerOpportunityDetailProps {
  opportunity: Opportunity;
  pageUrl: string;
  /** NGO postings: require sign-in before showing apply / contact actions */
  applyAuthRequired: boolean;
  listingKind: SeekerListingKind;
  /** When false, render description as plain pre-wrapped text (e.g. long raw extractions) */
  richDescription?: boolean;
}

const KIND_COPY: Record<
  SeekerListingKind,
  { pill: string; hint: string }
> = {
  ngo_partner: {
    pill: 'Partner posting',
    hint: 'This opportunity was published by an NGO partner on Zaytoonz. Sign in to use the application form and submit your details securely.'
  },
  platform_curated: {
    pill: 'Zaytoonz curated',
    hint: 'Curated and published by the Zaytoonz team for the community.'
  },
  external_feed: {
    pill: 'External listing',
    hint: 'Sourced from the web. Review the details below, then complete your application on the original site.'
  }
};

export default function UnifiedSeekerOpportunityDetail({
  opportunity,
  pageUrl,
  applyAuthRequired,
  listingKind,
  richDescription = true
}: UnifiedSeekerOpportunityDetailProps) {
  const orgId = opportunity.organizationProfile?.id;
  const orgName = opportunity.organization || 'Organization';
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: u } = await AuthService.getUser();
        if (!cancelled) setUser(u ?? null);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mainInfo = [
    opportunity.location && opportunity.location !== 'Not specified' ? opportunity.location : null,
    opportunity.compensation && !/^competitive$/i.test(String(opportunity.compensation))
      ? opportunity.compensation
      : null,
    opportunity.type,
    opportunity.hours
  ]
    .filter(Boolean)
    .join(' • ');

  const showMailto = Boolean(opportunity.contactEmails && opportunity.contactEmails.length > 0);
  const showFormApply = Boolean(
    opportunity.applicationForm?.form_structure &&
      Array.isArray(opportunity.applicationForm.form_structure) &&
      opportunity.applicationForm.form_structure.length > 0
  );
  const sourceUrl = opportunity.sourceUrl?.trim();
  const isExternal = listingKind === 'external_feed';

  const authReady = user !== undefined;
  const applyBlocked = applyAuthRequired && authReady && !user;

  const kind = KIND_COPY[listingKind];

  return (
    <div className="min-h-screen bg-olive-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/image.png" alt="Zaytoonz" className="h-10 w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-olive-700 text-sm font-medium">
            <a href="/#home" className="hover:text-olive-600">
              Home
            </a>
            <a href="/#jobs" className="hover:text-olive-600">
              Jobs
            </a>
            <a href="/#training" className="hover:text-olive-600">
              Training
            </a>
            <a href="/#funding" className="hover:text-olive-600">
              Funding
            </a>
            <a href="/#about" className="hover:text-olive-600">
              About
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/auth/signin"
              className="text-olive-700 hover:text-olive-600 text-sm font-medium"
            >
              Sign in
            </a>
            <a
              href="/auth/signup"
              className="bg-olive-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-olive-800 transition"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden bg-gradient-to-r from-olive-900 via-olive-800 to-olive-600 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 30%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.15), transparent 35%)'
          }}
        />
        <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-100">
              {opportunity.category}
            </span>
            <span className="text-olive-200/90">·</span>
            <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-3 py-0.5 text-xs font-semibold text-white">
              {kind.pill}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-sm text-white">
            {opportunity.title}
          </h1>
          <p className="mt-2 text-olive-100 text-sm">
            {orgId ? (
              <Link
                href={`/public/ngo/${orgId}`}
                className="underline decoration-olive-200/80 hover:text-white"
              >
                {orgName}
              </Link>
            ) : (
              orgName
            )}
          </p>
          {mainInfo ? <p className="mt-1 text-olive-100/90 text-sm">{mainInfo}</p> : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {opportunity.location && opportunity.location !== 'Not specified' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                📍 {opportunity.location}
              </span>
            )}
            {opportunity.compensation && !/^competitive$/i.test(String(opportunity.compensation)) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                💰 {opportunity.compensation}
              </span>
            )}
            {opportunity.type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                📝 {opportunity.type}
              </span>
            )}
            {opportunity.hours && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                ⏱ {opportunity.hours}
              </span>
            )}
            {opportunity.deadline && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                ⏰ Deadline: {opportunity.deadline}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-olive-100 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-2">
              <FavoriteOpportunity opportunityId={opportunity.id} title={opportunity.title} />
              <ShareOpportunity title={opportunity.title} pageUrl={pageUrl} />
            </div>
          </div>

          <p className="mt-4 text-sm text-olive-700/90 leading-relaxed border-l-4 border-olive-300 pl-4 py-1">
            {kind.hint}
          </p>

          <div className="mt-6 grid gap-6">
            <div className="bg-olive-50 border border-olive-100 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-olive-900 mb-2">Opportunity details</h2>
              <div className="text-olive-800 text-sm leading-relaxed min-w-0 overflow-x-hidden">
                {richDescription ? (
                  <OpportunityDescriptionRich description={opportunity.description || ''} />
                ) : (
                  <div className="whitespace-pre-line">{opportunity.description || ''}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-olive-900 mb-4">Application</h2>

            {applyAuthRequired && !authReady && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-olive-600" />
              </div>
            )}

            {applyBlocked && (
              <div className="rounded-xl border border-olive-200 bg-olive-50/80 p-6 space-y-4">
                <h3 className="text-base font-semibold text-olive-900">Sign in to apply</h3>
                <p className="text-sm text-olive-800 leading-relaxed">
                  Partner opportunities use Zaytoonz to collect applications. Create a free account or sign in to open
                  the application form and share your information with the organization.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/auth/signin"
                    className="inline-flex flex-1 items-center justify-center px-6 py-3 rounded-xl bg-olive-700 text-white font-semibold shadow-sm hover:bg-olive-800 transition text-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex flex-1 items-center justify-center px-6 py-3 rounded-xl border-2 border-olive-700 text-olive-800 font-semibold shadow-sm hover:bg-olive-50 transition text-center"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            )}

            {!applyBlocked && isExternal && (
              <div className="flex flex-col sm:flex-row gap-3">
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center px-6 py-3 rounded-xl bg-olive-700 text-white font-semibold shadow-sm hover:bg-olive-800 transition"
                  >
                    Apply on original site
                  </a>
                )}
                {showMailto && (
                  <a
                    href={`mailto:${opportunity.contactEmails![0]}`}
                    className="inline-flex flex-1 items-center justify-center px-6 py-3 rounded-xl border-2 border-olive-700 text-olive-800 font-semibold shadow-sm hover:bg-olive-50 transition"
                  >
                    Contact
                  </a>
                )}
                {!sourceUrl && !showMailto && (
                  <p className="text-sm text-olive-600">No application link is available for this listing.</p>
                )}
              </div>
            )}

            {!applyBlocked && !isExternal && (showMailto || showFormApply) && (
              <div className="flex flex-col sm:flex-row gap-3">
                {showMailto && (
                  <a
                    href={`mailto:${opportunity.contactEmails![0]}`}
                    className="inline-flex flex-1 items-center justify-center px-6 py-3 rounded-xl bg-olive-700 text-white font-semibold shadow-sm hover:bg-olive-800 transition"
                  >
                    Apply via email
                  </a>
                )}
                {showFormApply && (
                  <Link
                    href={`/seeker/opportunities/${opportunity.id}/form`}
                    className="inline-flex flex-1 items-center justify-center px-6 py-3 rounded-xl border-2 border-olive-700 text-olive-800 font-semibold shadow-sm hover:bg-olive-50 transition text-center"
                  >
                    Apply with form
                  </Link>
                )}
              </div>
            )}

            {!applyBlocked && !isExternal && !showMailto && !showFormApply && (
              <p className="text-sm text-olive-600">No application method is configured for this opportunity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
