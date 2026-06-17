'use client';

import React from 'react';
import type { Opportunity, RelatedOpportunitySummary } from '@/app/lib/opportunities';
import UnifiedSeekerOpportunityDetail from './UnifiedSeekerOpportunityDetail';

interface LandingStyleOpportunityDetailProps {
  opportunity: Opportunity;
  pageUrl: string;
  relatedOpportunities?: RelatedOpportunitySummary[];
  ngoPageId?: string | null;
}

/** Admin / platform-curated postings: full detail on Zaytoonz; application is not gated. */
export default function LandingStyleOpportunityDetail({
  opportunity,
  pageUrl,
  relatedOpportunities = [],
  ngoPageId = null,
}: LandingStyleOpportunityDetailProps) {
  return (
    <UnifiedSeekerOpportunityDetail
      opportunity={opportunity}
      pageUrl={pageUrl}
      applyAuthRequired={false}
      listingKind="platform_curated"
      richDescription
      relatedOpportunities={relatedOpportunities}
      ngoPageId={ngoPageId}
    />
  );
}
