import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET - Fetch all saved sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityType = searchParams.get('opportunity_type');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('saved_sources')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by opportunity type if specified
    if (opportunityType && ['job', 'funding', 'training'].includes(opportunityType)) {
      query = query.eq('opportunity_type', opportunityType);
    }

    // Filter by active status if specified
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: sources, error } = await query;

    if (error) {
      console.error('Error fetching saved sources:', error);
      return NextResponse.json({ error: 'Failed to fetch saved sources' }, { status: 500 });
    }

    return NextResponse.json({ sources: sources || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/saved-sources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new saved source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, description, opportunity_type, fields, use_pagination, pagination_details } = body;

    // Validation
    if (!name || !url || !opportunity_type) {
      return NextResponse.json(
        { error: 'Name, URL, and opportunity type are required' },
        { status: 400 }
      );
    }

    if (!['job', 'funding', 'training'].includes(opportunity_type)) {
      return NextResponse.json(
        { error: 'Invalid opportunity type. Must be job, funding, or training' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const { data: source, error } = await supabase
      .from('saved_sources')
      .insert({
        name,
        url,
        description: description || null,
        opportunity_type,
        fields: fields || [],
        use_pagination: use_pagination || false,
        pagination_details: pagination_details || null,
        is_active: true,
        scrape_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating saved source:', error);
      return NextResponse.json({ error: 'Failed to create saved source' }, { status: 500 });
    }

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/saved-sources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

