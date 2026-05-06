import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

/** Unified shape for landing page + seeker links */
export type RecentOpportunityItem = {
  id: string;
  title: string;
  opportunity_type: 'job' | 'funding' | 'training';
  created_at: string;
  description_title: string;
  description: string;
  location: string;
  hours: string;
  status: string;
  source: 'ngo' | 'scraped' | 'extracted';
  source_url?: string | null;
  company?: string | null;
};

const LIMIT = 30;

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      return NextResponse.json([]);
    }

    const items: RecentOpportunityItem[] = [];

    const { data: internal, error: internalError } = await supabase
      .from('opportunities')
      .select(
        `
        id,
        title,
        opportunity_type,
        created_at,
        opportunity_description!inner (
          title,
          description,
          location,
          hours,
          status
        )
      `
      )
      .eq('opportunity_description.status', 'published')
      .order('created_at', { ascending: false })
      .limit(LIMIT);

    if (internalError) {
      console.error('recent opportunities — NGO:', internalError);
    } else {
      for (const opp of internal || []) {
        const desc = Array.isArray(opp.opportunity_description)
          ? opp.opportunity_description[0]
          : opp.opportunity_description;
        items.push({
          id: opp.id,
          title: opp.title,
          opportunity_type: opp.opportunity_type as RecentOpportunityItem['opportunity_type'],
          created_at: opp.created_at,
          description_title: desc?.title || opp.title,
          description: (desc?.description as string) || '',
          location: (desc?.location as string) || '',
          hours: (desc?.hours as string) || '',
          status: 'published',
          source: 'ngo',
        });
      }
    }

    const { data: scraped, error: scrapedError } = await supabase
      .from('scraped_opportunities')
      .select(
        `
        id,
        title,
        opportunity_type,
        source_url,
        created_at,
        scraped_at,
        scraped_opportunity_details (
          description,
          location,
          hours,
          company,
          metadata
        )
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(LIMIT);

    if (scrapedError) {
      console.error('recent opportunities — scraped:', scrapedError);
    } else {
      for (const opp of scraped || []) {
        const details = Array.isArray(opp.scraped_opportunity_details)
          ? opp.scraped_opportunity_details[0]
          : opp.scraped_opportunity_details;
        const meta = details?.metadata as Record<string, unknown> | undefined;
        const link =
          (typeof meta?.link === 'string' && meta.link) ||
          opp.source_url ||
          null;
        items.push({
          id: `scraped_${opp.id}`,
          title: opp.title,
          opportunity_type: opp.opportunity_type as RecentOpportunityItem['opportunity_type'],
          created_at: opp.scraped_at || opp.created_at,
          description_title: opp.title,
          description: (details?.description as string) || '',
          location: (details?.location as string) || '',
          hours: (details?.hours as string) || '',
          status: 'active',
          source: 'scraped',
          source_url: link,
          company: (details?.company as string) || null,
        });
      }
    }

    const { data: extracted, error: extractedError } = await supabase
      .from('extracted_opportunity_content')
      .select(
        `
        id,
        title,
        opportunity_type,
        source_url,
        description,
        raw_content,
        company,
        location,
        job_type,
        extracted_at,
        created_at,
        ngo_profile (
          id,
          name
        )
      `
      )
      .eq('extraction_status', 'completed')
      .order('extracted_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(LIMIT);

    if (extractedError) {
      console.error('recent opportunities — extracted:', extractedError);
    } else {
      for (const row of extracted || []) {
        const ngoRaw = row.ngo_profile;
        const ngo = Array.isArray(ngoRaw) ? ngoRaw[0] : ngoRaw;
        const orgName = (ngo as { name?: string } | null)?.name || row.company || null;
        const bodyText =
          (row.description as string) ||
          (row.raw_content as string)?.slice(0, 2000) ||
          '';
        items.push({
          id: `extracted_${row.id}`,
          title: row.title,
          opportunity_type: row.opportunity_type as RecentOpportunityItem['opportunity_type'],
          created_at: row.extracted_at || row.created_at,
          description_title: row.title,
          description: bodyText,
          location: row.location || '',
          hours: row.job_type || '',
          status: 'published',
          source: 'extracted',
          source_url: row.source_url || null,
          company: orgName,
        });
      }
    }

    items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error in GET /api/opportunities/recent:', error);
    return NextResponse.json([]);
  }
}
