'use client';

import React from 'react';
import type { Opportunity } from '@/app/lib/opportunities';
import UnifiedSeekerOpportunityDetail from './UnifiedSeekerOpportunityDetail';

interface LandingStyleOpportunityDetailProps {
  opportunity: Opportunity;
  pageUrl: string;
}

/** Admin / platform-curated postings: full detail on Zaytoonz; application is not gated. */
export default function LandingStyleOpportunityDetail({ opportunity, pageUrl }: LandingStyleOpportunityDetailProps) {
  return (
    <UnifiedSeekerOpportunityDetail
      opportunity={opportunity}
      pageUrl={pageUrl}
      applyAuthRequired={false}
      listingKind="platform_curated"
      richDescription
    />
  );
}
