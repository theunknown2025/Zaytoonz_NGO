import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // job, funding, training
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the query using the view for complete information
    // Order by scraped_at first (when the opportunity was scraped), then by created_at as fallback
    let query = supabase
      .from('scraped_opportunities_complete')
      .select('*')
      .eq('status', status)
      .order('scraped_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by opportunity type if specified
    if (type && ['job', 'funding', 'training'].includes(type)) {
      query = query.eq('opportunity_type', type);
    }

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Error fetching scraped opportunities:', error);
      return NextResponse.json({ error: 'Failed to fetch scraped opportunities' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('scraped_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (type && ['job', 'funding', 'training'].includes(type)) {
      countQuery = countQuery.eq('opportunity_type', type);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting scraped opportunities:', countError);
    }

    const scraped = (opportunities || []).map((o: Record<string, unknown>) => ({ ...o, source: 'scraped' }));

    // Extracted (full-content) listings are published as soon as extraction completes,
    // so they only belong in the "active" list.
    let extracted: Record<string, unknown>[] = [];
    let extractedCount = 0;
    if (status === 'active') {
      let extractedQuery = supabase
        .from('extracted_opportunity_content')
        .select(
          'id, title, opportunity_type, source_url, description, location, company, salary_range, job_type, deadline, extracted_at, created_at, ngo_profile ( id, name )',
          { count: 'exact' }
        )
        .eq('extraction_status', 'completed')
        .order('extracted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type && ['job', 'funding', 'training'].includes(type)) {
        extractedQuery = extractedQuery.eq('opportunity_type', type);
      }

      const { data: extractedRows, error: extractedError, count: exCount } = await extractedQuery;
      if (extractedError) {
        console.error('Error fetching extracted opportunities:', extractedError);
      } else {
        extractedCount = exCount || 0;
        extracted = (extractedRows || []).map((row: any) => {
          const ngo = Array.isArray(row.ngo_profile) ? row.ngo_profile[0] : row.ngo_profile;
          return {
            id: `extracted_${row.id}`,
            title: row.title,
            opportunity_type: row.opportunity_type,
            source_url: row.source_url,
            status: 'active',
            scraped_at: row.extracted_at || row.created_at,
            created_at: row.created_at,
            description: row.description,
            location: row.location,
            company: ngo?.name || row.company,
            hours: null,
            salary_range: row.salary_range,
            deadline: row.deadline,
            tags: row.job_type ? [row.job_type] : [],
            source: 'extracted',
          };
        });
      }
    }

    const merged = [...scraped, ...extracted].sort(
      (a: any, b: any) =>
        new Date(b.scraped_at || b.created_at || 0).getTime() -
        new Date(a.scraped_at || a.created_at || 0).getTime()
    );

    return NextResponse.json({ 
      opportunities: merged,
      total: (count || 0) + extractedCount,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in GET /api/admin/scraped-opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    if (!['active', 'inactive', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (String(id).startsWith('extracted_')) {
      return NextResponse.json(
        { error: 'Extracted opportunities have no status; delete them from the Extracted Opportunities page instead' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('scraped_opportunities')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scraped opportunity:', error);
      return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
    }

    return NextResponse.json({ opportunity: data });

  } catch (error) {
    console.error('Error in PATCH /api/admin/scraped-opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
    }

    const isExtracted = id.startsWith('extracted_');
    const { error } = await supabase
      .from(isExtracted ? 'extracted_opportunity_content' : 'scraped_opportunities')
      .delete()
      .eq('id', isExtracted ? id.slice('extracted_'.length) : id);

    if (error) {
      console.error('Error deleting scraped opportunity:', error);
      return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/admin/scraped-opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 