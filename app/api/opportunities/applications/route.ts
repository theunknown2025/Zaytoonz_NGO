import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST - Submit an application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, seekerUserId, formId, applicationData, selectedCVId, selectedCVName, notes } = body;

    if (!opportunityId || !seekerUserId || !formId || !applicationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if application already exists for this user and opportunity
    const { data: existingApplication } = await supabase
      .from('opportunity_applications')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('seeker_user_id', seekerUserId)
      .eq('form_id', formId)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already submitted for this opportunity' },
        { status: 409 }
      );
    }

    // Insert new application
    const { data: application, error } = await supabase
      .from('opportunity_applications')
      .insert({
        opportunity_id: opportunityId,
        seeker_user_id: seekerUserId,
        form_id: formId,
        application_data: applicationData,
        selected_cv_id: selectedCVId,
        selected_cv_name: selectedCVName,
        notes,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve applications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seekerUserId = searchParams.get('seekerUserId');

    if (!seekerUserId) {
      return NextResponse.json(
        { error: 'Missing seekerUserId parameter' },
        { status: 400 }
      );
    }

    // Fetch applications with related data using a simpler approach
    const { data: applications, error } = await supabase
      .from('opportunity_applications')
      .select(`
        id,
        opportunity_id,
        seeker_user_id,
        form_id,
        application_data,
        status,
        submitted_at,
        updated_at,
        notes,
        selected_cv_id,
        selected_cv_name,
        opportunities!inner(
          id,
          title,
          opportunity_type
        ),
        forms_templates!inner(
          title,
          description
        )
      `)
      .eq('seeker_user_id', seekerUserId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Now fetch opportunity descriptions separately
    const opportunityIds = applications?.map(app => app.opportunity_id) || [];
    
    if (opportunityIds.length > 0) {
      const { data: descriptions, error: descError } = await supabase
        .from('opportunity_description')
        .select('*')
        .in('opportunity_id', opportunityIds);

      if (!descError && descriptions) {
        // Merge the descriptions into the applications
        const applicationsWithDescriptions = applications?.map(app => {
          const description = descriptions.find(desc => desc.opportunity_id === app.opportunity_id);
          return {
            ...app,
            opportunity_description: description || null
          };
        });

        return NextResponse.json({ applications: applicationsWithDescriptions }, { status: 200 });
      }
    }

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 