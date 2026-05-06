import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

type TypeCounts = { job: number; funding: number; training: number };

function emptyCounts(): TypeCounts {
  return { job: 0, funding: 0, training: 0 };
}

function bumpType(counts: TypeCounts, opportunityType: string | null) {
  if (opportunityType === 'job') counts.job += 1;
  else if (opportunityType === 'funding') counts.funding += 1;
  else if (opportunityType === 'training') counts.training += 1;
}

/** Strip SQL LIKE wildcards and quotes so `or()` filter strings stay safe. */
function sanitizeForIlike(raw: string): string {
  return raw
    .replace(/[%_\\]/g, '')
    .replace(/"/g, '')
    .trim()
    .slice(0, 200);
}

/** PostgREST `or()` ilike on name and email; values quoted so `.` in emails does not break parsing. */
function orIlikeNameOrEmail(safe: string): string {
  const pattern = `%${safe}%`.replace(/"/g, '""');
  return `name.ilike."${pattern}",email.ilike."${pattern}"`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = searchParams.get('limit');
    let maxRows: number | undefined;
    if (rawLimit !== null && rawLimit !== '') {
      const n = parseInt(rawLimit, 10);
      if (!Number.isNaN(n) && n > 0) {
        maxRows = Math.min(n, 100);
      }
    }

    const rawOffset = searchParams.get('offset');
    let offset = 0;
    if (rawOffset !== null && rawOffset !== '') {
      const o = parseInt(rawOffset, 10);
      if (!Number.isNaN(o) && o >= 0) {
        offset = o;
      }
    }

    const qRaw = searchParams.get('q')?.trim() ?? '';
    const hasQuery = qRaw.length > 0;
    const safe = hasQuery ? sanitizeForIlike(qRaw) : '';

    if (maxRows !== undefined && hasQuery && safe.length === 0) {
      return NextResponse.json({
        ngos: [],
        error: null,
        has_more: false,
        total_approved: 0
      });
    }

    let totalApproved: number | null = null;
    if (maxRows !== undefined) {
      let countQuery = supabase
        .from('ngo_profile')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved');

      if (safe) {
        countQuery = countQuery.or(orIlikeNameOrEmail(safe));
      }

      const { count, error: countError } = await countQuery;

      if (!countError && count !== null) {
        totalApproved = count;
      }
    }

    // Approved NGOs, newest first. With `limit`, use `offset` for pagination (e.g. organizations page).
    let query = supabase
      .from('ngo_profile')
      .select(`
        id,
        name,
        email,
        year_created,
        profile_image_url,
        banner_url,
        logo_url,
        mission_statement,
        approval_status,
        user_id
      `)
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false });

    if (safe) {
      query = query.or(orIlikeNameOrEmail(safe));
    }

    if (maxRows !== undefined) {
      query = query.range(offset, offset + maxRows - 1);
    }

    const { data: ngoProfiles, error } = await query;

    if (error) {
      console.error('Error fetching NGO profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch NGO profiles' },
        { status: 500 }
      );
    }

    const profiles = ngoProfiles || [];
    const userIds = Array.from(
      new Set(profiles.map((p) => p.user_id).filter(Boolean))
    ) as string[];

    // Published NGO opportunities: same join as GET /api/public/ngos/[id]
    const publishedByUserId = new Map<string, TypeCounts>();
    if (userIds.length > 0) {
      const { data: publishedRows, error: pubErr } = await supabase
        .from('opportunities')
        .select(`
          id,
          opportunity_type,
          opportunity_description!inner(
            user_id,
            status
          )
        `)
        .eq('opportunity_description.status', 'published')
        .in('opportunity_description.user_id', userIds);

      if (pubErr) {
        console.error('Error batch-fetching published opportunities for NGOs:', pubErr);
      } else {
        for (const row of publishedRows || []) {
          const desc = Array.isArray(row.opportunity_description)
            ? row.opportunity_description[0]
            : row.opportunity_description;
          const uid = desc?.user_id as string | undefined;
          if (!uid) continue;
          if (!publishedByUserId.has(uid)) publishedByUserId.set(uid, emptyCounts());
          bumpType(publishedByUserId.get(uid)!, row.opportunity_type);
        }
      }
    }

    // Extracted (scraper) listings saved under an NGO — matches public NGO detail merge
    const extractedByNgoId = new Map<string, TypeCounts>();
    const { data: extractedRows, error: extErr } = await supabase
      .from('extracted_opportunity_content')
      .select('ngo_profile_id, opportunity_type')
      .eq('extraction_status', 'completed')
      .not('ngo_profile_id', 'is', null);

    if (extErr) {
      console.error('Error batch-fetching extracted opportunities for NGO stats:', extErr);
    } else {
      for (const row of extractedRows || []) {
        const ngoId = row.ngo_profile_id as string | null;
        if (!ngoId) continue;
        if (!extractedByNgoId.has(ngoId)) extractedByNgoId.set(ngoId, emptyCounts());
        bumpType(extractedByNgoId.get(ngoId)!, row.opportunity_type);
      }
    }

    const ngosWithStats = profiles.map((ngo) => {
      const pub = publishedByUserId.get(ngo.user_id) || emptyCounts();
      const ext = extractedByNgoId.get(ngo.id) || emptyCounts();
      const jobsCount = pub.job + ext.job;
      const fundingsCount = pub.funding + ext.funding;
      const trainingsCount = pub.training + ext.training;
      const totalOpportunities = jobsCount + fundingsCount + trainingsCount;

      return {
        ...ngo,
        jobs_count: jobsCount,
        fundings_count: fundingsCount,
        trainings_count: trainingsCount,
        total_opportunities: totalOpportunities
      };
    });

    const pageLength = ngosWithStats.length;
    const hasMore =
      maxRows !== undefined &&
      pageLength > 0 &&
      (totalApproved !== null
        ? offset + pageLength < totalApproved
        : pageLength === maxRows);

    // Return all approved NGOs when no `limit`; with `limit` + `offset`, clients use `has_more` to load the next page.
    return NextResponse.json({
      ngos: ngosWithStats,
      error: null,
      has_more: maxRows !== undefined ? hasMore : false,
      total_approved: totalApproved
    });
  } catch (error: any) {
    console.error('Error in GET /api/public/ngos:', error);
    return NextResponse.json(
      { error: 'Internal server error', ngos: [] },
      { status: 500 }
    );
  }
}
