import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Retrieve all applications for NGO's published opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoUserId = searchParams.get('ngoUserId');

    if (!ngoUserId) {
      // If no user ID provided, use the default NGO user for testing
      const defaultNgoUserId = 'dd5af954-5c94-4dca-b3ce-072e767fe9c6';
      
      const modifiedUrl = new URL(request.url);
      modifiedUrl.searchParams.set('ngoUserId', defaultNgoUserId);
      return GET(new NextRequest(modifiedUrl.toString()));
    }

    // Use a simpler approach - first get opportunity descriptions, then join with opportunities
    const { data: opportunityDescriptions, error: descError } = await supabase
      .from('opportunity_description')
      .select(`
        opportunity_id,
        title,
        description,
        location,
        status,
        created_at,
        user_id
      `)
      .eq('user_id', ngoUserId)
      .eq('status', 'published');



    if (descError) {
      console.error('Error fetching opportunity descriptions:', descError);
      return NextResponse.json(
        { error: 'Failed to fetch opportunity descriptions' },
        { status: 500 }
      );
    }

    if (!opportunityDescriptions || opportunityDescriptions.length === 0) {

      return NextResponse.json(
        { opportunities: [] },
        { status: 200 }
      );
    }

    // Get the corresponding opportunities data
    const opportunityIds = opportunityDescriptions.map(desc => desc.opportunity_id);
    const { data: ngoOpportunities, error: opportunitiesError } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        opportunity_type,
        created_at
      `)
      .in('id', opportunityIds)
      .order('created_at', { ascending: false });



    if (opportunitiesError) {
      console.error('Error fetching NGO opportunities:', opportunitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch opportunities' },
        { status: 500 }
      );
    }

    if (!ngoOpportunities || ngoOpportunities.length === 0) {
      return NextResponse.json(
        { opportunities: [] },
        { status: 200 }
      );
    }

    // Use the opportunity IDs we already have

    // Fetch all applications for these opportunities
    const { data: applications, error: applicationsError } = await supabase
      .from('opportunity_applications')
      .select(`
        id,
        opportunity_id,
        seeker_user_id,
        form_id,
        application_data,
        selected_cv_id,
        selected_cv_name,
        status,
        submitted_at,
        updated_at,
        notes,
        forms_templates(
          id,
          title,
          description,
          sections
        )
      `)
      .in('opportunity_id', opportunityIds)
      .order('submitted_at', { ascending: false });



    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Fetch seeker profile information for each application
    const seekerUserIds = Array.from(new Set(applications?.map(app => app.seeker_user_id) || []));
    
    let seekerProfiles: any[] = [];
    if (seekerUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          user_type,
          created_at
        `)
        .in('id', seekerUserIds);

      if (!profilesError && profiles) {
        seekerProfiles = profiles;
      }
    }

    // Group applications by opportunity
    const opportunitiesWithApplications = ngoOpportunities.map(opportunity => {
      const opportunityApplications = applications?.filter(
        app => app.opportunity_id === opportunity.id
      ) || [];

      // Add seeker profile information to each application
      const applicationsWithProfiles = opportunityApplications.map(app => {
        const seekerProfile = seekerProfiles.find(profile => profile.id === app.seeker_user_id);
        return {
          ...app,
          seeker_profile: seekerProfile || null
        };
      });

      // Find the corresponding opportunity description
      const description = opportunityDescriptions.find(desc => desc.opportunity_id === opportunity.id);

      return {
        opportunity_id: opportunity.id,
        title: description?.title || opportunity.title,
        description: description?.description || '',
        location: description?.location || '',
        created_at: description?.created_at || opportunity.created_at,
        opportunities: {
          id: opportunity.id,
          title: opportunity.title,
          opportunity_type: opportunity.opportunity_type,
          created_at: opportunity.created_at
        },
        applications: applicationsWithProfiles,
        application_count: applicationsWithProfiles.length
      };
    });

    return NextResponse.json(
      { opportunities: opportunitiesWithApplications },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the application status
    const { data: application, error } = await supabase
      .from('opportunity_applications')
      .update({
        status,
        notes: notes || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
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