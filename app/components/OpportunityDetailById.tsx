import React from 'react';
import {
  getOpportunityById,
  getRelatedOpportunitiesForOpportunity,
  opportunityFromExtractedRecord,
  opportunityFromScrapedRecord
} from '@/app/lib/opportunities';
import OpportunityPageWrapper from '@/app/seeker/opportunities/[id]/OpportunityPageWrapper';
import LandingStyleOpportunityDetail from '@/app/seeker/opportunities/[id]/LandingStyleOpportunityDetail';
import UnifiedSeekerOpportunityDetail from '@/app/seeker/opportunities/[id]/UnifiedSeekerOpportunityDetail';
import { supabase } from '@/app/lib/supabase';

export type OpportunityDetailAudience = 'seeker' | 'ngo';

function publicShareUrl(opportunityId: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/${opportunityId}`;
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-olive-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-800">{title}</h3>
          <p className="text-red-700 mt-2">{message}</p>
        </div>
      </div>
    </div>
  );
}

/** Shared opportunity detail renderer for seeker and NGO routes. */
export default async function OpportunityDetailById({
  id,
  audience = 'seeker',
}: {
  id: string;
  audience?: OpportunityDetailAudience;
}) {
  try {
    if (id.startsWith('extracted_')) {
      const extractedId = id.replace('extracted_', '');
      const { data: extracted, error: extractedError } = await supabase
        .from('extracted_opportunity_content')
        .select(`
          *,
          ngo_profile (
            id,
            name,
            email,
            profile_image_url
          )
        `)
        .eq('id', extractedId)
        .single();

      if (extractedError || !extracted) {
        return (
          <ErrorState
            title="Extracted opportunity not found"
            message={extractedError?.message || 'This extracted opportunity is no longer available.'}
          />
        );
      }

      const oppBase = opportunityFromExtractedRecord(extracted);
      const extractedOpportunity = {
        ...oppBase,
        description:
          (extracted as { raw_content?: string; description?: string }).raw_content ||
          (extracted as { raw_content?: string; description?: string }).description ||
          oppBase.description
      };
      const { opportunities: relatedOpportunities, ngoProfileId: relatedNgoProfileId } =
        await getRelatedOpportunitiesForOpportunity(extractedOpportunity, 3);

      return (
        <UnifiedSeekerOpportunityDetail
          opportunity={extractedOpportunity}
          pageUrl={publicShareUrl(extractedOpportunity.id)}
          applyAuthRequired={false}
          listingKind="external_feed"
          richDescription={false}
          relatedOpportunities={relatedOpportunities}
          ngoPageId={
            relatedNgoProfileId ??
            extractedOpportunity.organizationProfile?.id ??
            extractedOpportunity.ngoProfileId ??
            null
          }
          audience={audience}
        />
      );
    }

    if (id.startsWith('scraped_')) {
      const scrapedId = id.replace('scraped_', '');
      const { data: scrapedRow, error: scrapedError } = await supabase
        .from('scraped_opportunities')
        .select(
          `
          *,
          scraped_opportunity_details (
            *
          )
        `
        )
        .eq('id', scrapedId)
        .eq('status', 'active')
        .single();

      if (scrapedError || !scrapedRow) {
        return (
          <ErrorState
            title="Error"
            message="Scraped opportunity not found or no longer available"
          />
        );
      }

      const scrapedOpportunity = opportunityFromScrapedRecord(scrapedRow);
      const { opportunities: relatedOpportunities, ngoProfileId: relatedNgoProfileId } =
        await getRelatedOpportunitiesForOpportunity(scrapedOpportunity, 3);

      return (
        <UnifiedSeekerOpportunityDetail
          opportunity={scrapedOpportunity}
          pageUrl={publicShareUrl(scrapedOpportunity.id)}
          applyAuthRequired={false}
          listingKind="external_feed"
          richDescription
          relatedOpportunities={relatedOpportunities}
          ngoPageId={relatedNgoProfileId}
          audience={audience}
        />
      );
    }

    const { opportunity, error } = await getOpportunityById(id);

    if (error || !opportunity) {
      return (
        <ErrorState
          title="Error"
          message={error || 'Failed to load opportunity'}
        />
      );
    }

    const pageUrl = publicShareUrl(opportunity.id);
    const { opportunities: relatedOpportunities, ngoProfileId: relatedNgoProfileId } =
      await getRelatedOpportunitiesForOpportunity(opportunity, 3);
    const ngoPageId =
      relatedNgoProfileId ?? opportunity.organizationProfile?.id ?? opportunity.ngoProfileId ?? null;

    if (opportunity.isAdminPosted) {
      return (
        <LandingStyleOpportunityDetail
          opportunity={opportunity}
          pageUrl={pageUrl}
          relatedOpportunities={relatedOpportunities}
          ngoPageId={ngoPageId}
          audience={audience}
        />
      );
    }

    return (
      <OpportunityPageWrapper
        opportunity={opportunity}
        relatedOpportunities={relatedOpportunities}
        ngoPageId={ngoPageId}
        audience={audience}
      />
    );
  } catch (error) {
    console.error('Error in OpportunityDetailById:', error);
    return (
      <ErrorState title="Error" message="An unexpected error occurred" />
    );
  }
}
