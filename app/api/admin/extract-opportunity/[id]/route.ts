import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET - Get single extracted opportunity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('extracted_opportunity_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching extracted opportunity:', error);
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error in GET /api/admin/extract-opportunity/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete extracted opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('extracted_opportunity_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting extracted opportunity:', error);
      return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Opportunity deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/extract-opportunity/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update extracted opportunity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Only allow updating certain fields
    const allowedFields = [
      'title', 'description', 'company', 'location', 'salary_range',
      'job_type', 'deadline', 'requirements', 'benefits', 'responsibilities',
      'qualifications', 'application_instructions', 'contact_info', 'raw_content',
      'content_polished_at'
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('extracted_opportunity_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating extracted opportunity:', error);
      return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/extract-opportunity/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

