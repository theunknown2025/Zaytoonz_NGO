import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET - Fetch a single saved source by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: source, error } = await supabase
      .from('saved_sources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      }
      console.error('Error fetching saved source:', error);
      return NextResponse.json({ error: 'Failed to fetch saved source' }, { status: 500 });
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Error in GET /api/admin/saved-sources/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a saved source
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, description, opportunity_type, fields, use_pagination, pagination_details, is_active } = body;

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (url !== undefined) {
      // Validate URL format
      try {
        new URL(url);
        updateData.url = url;
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }
    }
    if (description !== undefined) updateData.description = description;
    if (opportunity_type !== undefined) {
      if (!['job', 'funding', 'training'].includes(opportunity_type)) {
        return NextResponse.json(
          { error: 'Invalid opportunity type. Must be job, funding, or training' },
          { status: 400 }
        );
      }
      updateData.opportunity_type = opportunity_type;
    }
    if (fields !== undefined) updateData.fields = fields;
    if (use_pagination !== undefined) updateData.use_pagination = use_pagination;
    if (pagination_details !== undefined) updateData.pagination_details = pagination_details;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: source, error } = await supabase
      .from('saved_sources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      }
      console.error('Error updating saved source:', error);
      return NextResponse.json({ error: 'Failed to update saved source' }, { status: 500 });
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Error in PUT /api/admin/saved-sources/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a saved source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('saved_sources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting saved source:', error);
      return NextResponse.json({ error: 'Failed to delete saved source' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/saved-sources/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update last_scraped_at and increment scrape_count
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First get the current scrape_count
    const { data: currentSource, error: fetchError } = await supabase
      .from('saved_sources')
      .select('scrape_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const { data: source, error } = await supabase
      .from('saved_sources')
      .update({
        last_scraped_at: new Date().toISOString(),
        scrape_count: (currentSource?.scrape_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scrape info:', error);
      return NextResponse.json({ error: 'Failed to update scrape info' }, { status: 500 });
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Error in PATCH /api/admin/saved-sources/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

