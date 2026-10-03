import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force runtime execution - don't execute during build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase client to avoid build-time execution
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// PUT - Update an application
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const applicationId = params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { applicationData, notes, selectedCVId, selectedCVName, status } = body;

    if (!applicationData) {
      return NextResponse.json(
        { error: 'Missing application data' },
        { status: 400 }
      );
    }

    const { data: current, error: currentError } = await supabase
      .from('opportunity_applications')
      .select('id, status, opportunity_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (currentError || !current) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (current.status !== 'draft') {
      return NextResponse.json(
        { error: 'This application has already been submitted and can no longer be edited' },
        { status: 409 }
      );
    }

    const saveAsDraft = status !== 'submitted';
    const now = new Date().toISOString();
    let hasProcess = false;
    if (!saveAsDraft) {
      const { data: flowSteps, error: flowError } = await supabase
        .from('opportunity_flow_steps')
        .select('id')
        .eq('opportunity_id', current.opportunity_id);
      if (!flowError) hasProcess = (flowSteps?.length || 0) > 0;
    }

    const { data: application, error } = await supabase
      .from('opportunity_applications')
      .update({
        application_data: applicationData,
        notes,
        selected_cv_id: selectedCVId || null,
        selected_cv_name: selectedCVName || null,
        updated_at: now,
        ...(saveAsDraft
          ? { status: 'draft', process_status: 'draft' }
          : {
              status: hasProcess ? 'in_progress' : 'submitted',
              process_status: hasProcess ? 'in_progress' : 'completed',
              current_step_index: 0,
              submitted_at: now,
            }),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const applicationId = params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application ID' },
        { status: 400 }
      );
    }

    // Delete the application
    const { error } = await supabase
      .from('opportunity_applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 