import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/app/lib/auth-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Retrieve all applications for NGO's published opportunities
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user ID
    const ngoUserId = await getUserId(request);

    if (!ngoUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user ID provided' },
        { status: 401 }
      );
    }

    console.log('Fetching applications for NGO user:', ngoUserId);

    // Debug: Check what opportunities exist in the database
    const { data: allOpportunities, error: debugError } = await supabase
      .from('opportunity_description')
      .select('opportunity_id, title, status, user_id')
      .in('status', ['published', 'completed']);
    
    console.log('All opportunities in database:', allOpportunities);
    console.log('Looking for user_id:', ngoUserId);

    // Use a simpler approach - first get opportunity descriptions, then join with opportunities
    // For now, let's get all opportunities regardless of user_id to debug the issue
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
      .in('status', ['published', 'completed']); // Include both published and completed opportunities



    if (descError) {
      console.error('Error fetching opportunity descriptions:', descError);
      return NextResponse.json(
        { error: 'Failed to fetch opportunity descriptions' },
        { status: 500 }
      );
    }

    console.log('Filtered opportunities for user:', opportunityDescriptions);

    // Filter to only show opportunities from NGO users
    const ngoUserIds = await supabase
      .from('users')
      .select('id')
      .eq('user_type', 'NGO');
    
    const ngoIds = ngoUserIds.data?.map(user => user.id) || [];
    const ngoOpportunities = opportunityDescriptions?.filter(opp => ngoIds.includes(opp.user_id)) || [];
    
    console.log('NGO user IDs:', ngoIds);
    console.log('NGO opportunities:', ngoOpportunities);

    if (!ngoOpportunities || ngoOpportunities.length === 0) {
      console.log('No NGO opportunities found');
      return NextResponse.json(
        { opportunities: [] },
        { status: 200 }
      );
    }

    // Get the corresponding opportunities data
    const opportunityIds = ngoOpportunities.map(desc => desc.opportunity_id);
    const { data: opportunitiesData, error: opportunitiesError } = await supabase
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

    if (!opportunitiesData || opportunitiesData.length === 0) {
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
    const opportunitiesWithApplications = opportunitiesData.map(opportunity => {
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
      const description = ngoOpportunities.find(desc => desc.opportunity_id === opportunity.id);

      return {
        opportunity_id: opportunity.id,
        title: description?.title || opportunity.title,
        description: description?.description || '',
        location: description?.location || '',
        status: description?.status || 'completed',
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

// PATCH - Publish opportunity
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, action } = body;

    if (!opportunityId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'publish') {
      // Update the opportunity status to 'published'
      const { data: opportunity, error } = await supabase
        .from('opportunity_description')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('opportunity_id', opportunityId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to publish opportunity' },
          { status: 500 }
        );
      }

      return NextResponse.json({ opportunity }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 