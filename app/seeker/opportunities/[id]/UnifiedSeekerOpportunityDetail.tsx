'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AcademicCapIcon,
  BanknotesIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { Opportunity, RelatedOpportunitySummary } from '@/app/lib/opportunities';
import { displayOpportunityCountry } from '@/app/lib/locationNormalize';
import type { User } from '@/app/lib/auth';
import { AuthService } from '@/app/lib/auth';
import ShareOpportunity from './ShareOpportunity';
import FavoriteOpportunity from './FavoriteOpportunity';
import OpportunityDescriptionRich from './OpportunityDescriptionRich';
import ProcessTimeline from '@/app/components/ProcessTimeline';
import TrainingProgramDisplay from '@/app/components/TrainingProgramDisplay';
import OpportunityFaqDisplay from '@/app/components/OpportunityFaqDisplay';
import OpportunityDocumentsList from '@/app/components/OpportunityDocumentsList';

export type SeekerListingKind = 'ngo_partner' | 'platform_curated' | 'external_feed';

export interface UnifiedSeekerOpportunityDetailProps {
  opportunity: Opportunity;
  pageUrl: string;
  /** NGO postings: require sign-in before showing apply / contact actions */
  applyAuthRequired: boolean;
  listingKind: SeekerListingKind;
  /** When false, render description as plain pre-wrapped text (e.g. long raw extractions) */
  richDescription?: boolean;
  relatedOpportunities?: RelatedOpportunitySummary[];
  /** Resolved NGO profile id for "View all" link when organizationProfile.id is missing */
  ngoPageId?: string | null;
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

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-olive-100 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-olive-50 text-olive-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-olive-500">{label}</p>
        <p className="text-sm font-medium text-olive-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function UnifiedSeekerOpportunityDetail({
  opportunity,
  pageUrl,
  applyAuthRequired,
  listingKind,
  richDescription = true,
  relatedOpportunities = [],
  ngoPageId = null,
}: UnifiedSeekerOpportunityDetailProps) {
  const orgId = ngoPageId ?? opportunity.organizationProfile?.id;
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

  const compensation =
    opportunity.compensation && !/^competitive$/i.test(String(opportunity.compensation))
      ? opportunity.compensation
      : null;

  const showType =
    opportunity.type &&
    opportunity.type !== 'Job Opportunity' &&
    opportunity.type !== 'Funding Opportunity' &&
    opportunity.type !== 'Training Program';

  const country = displayOpportunityCountry(opportunity.location);

  const getCategoryIcon = (category: RelatedOpportunitySummary['category']) => {
    switch (category) {
      case 'job':
        return <BriefcaseIcon className="h-4 w-4" />;
      case 'funding':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'training':
        return <AcademicCapIcon className="h-4 w-4" />;
      default:
        return <BriefcaseIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-olive-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-100">
                  {opportunity.category}
                </span>
                <span className="text-olive-200/90">·</span>
                <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold text-white">
                  {kind.pill}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-sm text-white max-w-4xl">
                {opportunity.title}
              </h1>
              <p className="mt-4 md:mt-5 text-olive-100 text-sm md:text-base">
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
            </div>

            {opportunity.organizationProfile?.profileImage && (
              orgId ? (
                <Link
                  href={`/public/ngo/${orgId}`}
                  className="hidden md:block shrink-0 rounded-2xl border border-white/30 bg-white/10 p-1.5 hover:bg-white/20 transition"
                  aria-label={`Visit ${orgName} page`}
                >
                  <img
                    src={opportunity.organizationProfile.profileImage}
                    alt={`${orgName} logo`}
                    className="h-20 w-20 lg:h-24 lg:w-24 rounded-xl object-cover"
                  />
                </Link>
              ) : (
                <div className="hidden md:block shrink-0 rounded-2xl border border-white/30 bg-white/10 p-1.5">
                  <img
                    src={opportunity.organizationProfile.profileImage}
                    alt={`${orgName} logo`}
                    className="h-20 w-20 lg:h-24 lg:w-24 rounded-xl object-cover"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-16 md:pb-20">
        <nav className="mb-4 text-sm text-olive-600" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-olive-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/seeker/opportunities" className="hover:text-olive-800">
                Opportunities
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-olive-800 font-medium truncate max-w-[60ch]">{opportunity.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-2.5 xl:gap-3 items-stretch mb-3 md:mb-3.5">
          <div className="h-full rounded-xl border border-olive-100 bg-white px-5 py-4 md:px-6 md:py-5 shadow-sm">
            <p className="text-sm md:text-[15px] text-olive-700 leading-relaxed pl-4 border-l-[3px] border-olive-400">
              {kind.hint}
            </p>
          </div>
          <div className="h-full rounded-xl border border-olive-100 bg-white px-5 py-4 md:px-6 md:py-5 shadow-sm flex items-center">
            <div className="grid w-full grid-cols-2 gap-2 [&>button]:w-full [&>button]:justify-center">
              <FavoriteOpportunity opportunityId={opportunity.id} title={opportunity.title} />
              <ShareOpportunity title={opportunity.title} pageUrl={pageUrl} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-3 xl:gap-3.5 items-start">
          {/* Left column — body, dates, action */}
          <div className="space-y-3 min-w-0">
            <section className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7 md:p-9">
              <h2 className="text-xl font-semibold text-olive-900 mb-5 md:mb-6">About this opportunity</h2>
              <div className="text-olive-800 text-base leading-relaxed min-w-0 overflow-x-hidden">
                {richDescription ? (
                  <OpportunityDescriptionRich description={opportunity.description || ''} />
                ) : (
                  <div className="whitespace-pre-line">{opportunity.description || ''}</div>
                )}
              </div>
            </section>

            {opportunity.processSteps && opportunity.processSteps.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7 md:p-9">
                <h2 className="text-xl font-semibold text-olive-900 mb-2">Important Dates & Process</h2>
                <p className="text-sm text-olive-700 mb-7 leading-relaxed">
                  Key milestones and deadlines for this opportunity.
                </p>
                <div className="rounded-xl border border-olive-200/80 bg-olive-50/50 p-5 sm:p-6 overflow-x-auto">
                  <ProcessTimeline steps={opportunity.processSteps} mode="preview" />
                </div>
              </section>
            )}

            {opportunity.category === 'training' &&
              opportunity.trainingProgram &&
              opportunity.trainingProgram.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7 md:p-9">
                  <h2 className="text-xl font-semibold text-olive-900 mb-2">Training Program</h2>
                  <p className="text-sm text-olive-700 mb-7 leading-relaxed">
                    Day-by-day schedule of activities, duration, and delivery format.
                  </p>
                  <TrainingProgramDisplay days={opportunity.trainingProgram} mode="display" />
                </section>
              )}

            {opportunity.faqItems && opportunity.faqItems.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7 md:p-9">
                <h2 className="text-xl font-semibold text-olive-900 mb-2">Frequently Asked Questions</h2>
                <p className="text-sm text-olive-700 mb-7 leading-relaxed">
                  Common questions and answers about this opportunity.
                </p>
                <OpportunityFaqDisplay items={opportunity.faqItems} mode="display" />
              </section>
            )}

            <section className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7 md:p-9">
              <h2 className="text-xl font-semibold text-olive-900 mb-6">Apply now</h2>

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
                      className="inline-flex flex-1 items-center justify-center px-6 py-3.5 rounded-xl bg-olive-700 text-white font-semibold shadow-sm hover:bg-olive-800 transition"
                    >
                      Apply on original site
                    </a>
                  )}
                  {showMailto && (
                    <a
                      href={`mailto:${opportunity.contactEmails![0]}`}
                      className="inline-flex flex-1 items-center justify-center px-6 py-3.5 rounded-xl border-2 border-olive-700 text-olive-800 font-semibold shadow-sm hover:bg-olive-50 transition"
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
                  {showFormApply && (
                    <Link
                      href={`/seeker/opportunities/${opportunity.id}/form`}
                      className="inline-flex flex-1 items-center justify-center px-6 py-3.5 rounded-xl bg-olive-700 text-white font-semibold shadow-sm hover:bg-olive-800 transition text-center"
                    >
                      Apply with form
                    </Link>
                  )}
                  {showMailto && (
                    <a
                      href={`mailto:${opportunity.contactEmails![0]}`}
                      className={`inline-flex flex-1 items-center justify-center px-6 py-3.5 rounded-xl font-semibold shadow-sm transition ${
                        showFormApply
                          ? 'border-2 border-olive-700 text-olive-800 hover:bg-olive-50'
                          : 'bg-olive-700 text-white hover:bg-olive-800'
                      }`}
                    >
                      Apply via email
                    </a>
                  )}
                </div>
              )}

              {!applyBlocked && !isExternal && !showMailto && !showFormApply && (
                <p className="text-sm text-olive-600">No application method is configured for this opportunity yet.</p>
              )}
            </section>
          </div>

          {/* Right column — general info + documents */}
          <aside className="space-y-3 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7">
              <h2 className="text-lg font-semibold text-olive-900 mb-5">General information</h2>
              <div>
                <InfoRow
                  icon={BuildingOffice2Icon}
                  label="Organization"
                  value={
                    orgId ? (
                      <Link href={`/public/ngo/${orgId}`} className="hover:text-olive-700 underline underline-offset-2">
                        {orgName}
                      </Link>
                    ) : (
                      orgName
                    )
                  }
                />
                <InfoRow icon={TagIcon} label="Category" value={<span className="capitalize">{opportunity.category}</span>} />
                {country && (
                  <InfoRow icon={MapPinIcon} label="Location" value={country} />
                )}
                {compensation && <InfoRow icon={BanknotesIcon} label="Compensation" value={compensation} />}
                {showType && <InfoRow icon={ClockIcon} label="Type" value={opportunity.type} />}
                {opportunity.hours && <InfoRow icon={ClockIcon} label="Hours" value={opportunity.hours} />}
                {opportunity.deadline && (
                  <InfoRow icon={CalendarDaysIcon} label="Deadline" value={opportunity.deadline} />
                )}
                {opportunity.posted && (
                  <InfoRow icon={CalendarDaysIcon} label="Posted" value={opportunity.posted} />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7">
              <h2 className="text-lg font-semibold text-olive-900 mb-5 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-olive-700" />
                Files and Documents
              </h2>
              {opportunity.documents && opportunity.documents.length > 0 ? (
                <OpportunityDocumentsList documents={opportunity.documents} embedded />
              ) : (
                <p className="text-sm text-olive-600 italic">No documents attached to this opportunity.</p>
              )}
            </div>

            {relatedOpportunities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-olive-100 p-7">
                <h2 className="text-lg font-semibold text-olive-900 mb-1">Opportunities from the same NGO</h2>
                <p className="text-sm text-olive-600 mb-5">Latest postings from {orgName}</p>
                <ul className="space-y-3">
                  {relatedOpportunities.map((related) => (
                    <li key={related.id}>
                      <Link
                        href={`/seeker/opportunities/${related.id}`}
                        className="group flex items-start gap-3 rounded-xl border border-olive-100 p-3 hover:border-olive-300 hover:bg-olive-50/60 transition"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-olive-50 text-olive-700">
                          {getCategoryIcon(related.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-olive-900 line-clamp-2 group-hover:text-olive-700">
                            {related.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-olive-600">
                            <span className="capitalize">{related.category}</span>
                            {displayOpportunityCountry(related.location) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                <span className="truncate max-w-[140px]">{displayOpportunityCountry(related.location)}</span>
                              </span>
                            )}
                            <span>Posted {related.posted}</span>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-olive-400 group-hover:text-olive-600 mt-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {orgId && (
                  <Link
                    href={`/public/ngo/${orgId}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-olive-700 hover:text-olive-900"
                  >
                    View all from {orgName}
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
