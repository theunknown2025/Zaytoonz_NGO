'use client';

import React from 'react';
import type { Opportunity } from '@/app/lib/opportunities';
import UnifiedSeekerOpportunityDetail from './UnifiedSeekerOpportunityDetail';

interface OpportunityPageWrapperProps {
  opportunity: Opportunity;
}

/** NGO partner postings: same layout as curated listings; application requires sign-in. */
export default function OpportunityPageWrapper({ opportunity }: OpportunityPageWrapperProps) {
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${opportunity.id}`;

  return (
    <UnifiedSeekerOpportunityDetail
      opportunity={opportunity}
      pageUrl={pageUrl}
      applyAuthRequired
      listingKind="ngo_partner"
      richDescription
    />
  );
}
