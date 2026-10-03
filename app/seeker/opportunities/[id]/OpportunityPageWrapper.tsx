'use client';

import React from 'react';
import type { Opportunity, RelatedOpportunitySummary } from '@/app/lib/opportunities';
import UnifiedSeekerOpportunityDetail, {
  type OpportunityDetailAudience,
} from './UnifiedSeekerOpportunityDetail';

interface OpportunityPageWrapperProps {
  opportunity: Opportunity;
  relatedOpportunities?: RelatedOpportunitySummary[];
  ngoPageId?: string | null;
  audience?: OpportunityDetailAudience;
}

/** NGO partner postings: same layout as curated listings; application requires sign-in. */
export default function OpportunityPageWrapper({
  opportunity,
  relatedOpportunities = [],
  ngoPageId = null,
  audience = 'seeker',
}: OpportunityPageWrapperProps) {
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${opportunity.id}`;

  return (
    <UnifiedSeekerOpportunityDetail
      opportunity={opportunity}
      pageUrl={pageUrl}
      applyAuthRequired
      listingKind="ngo_partner"
      richDescription
      relatedOpportunities={relatedOpportunities}
      ngoPageId={ngoPageId}
      audience={audience}
    />
  );
}
