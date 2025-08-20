import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'NGO ID is required' }, { status: 400 });
    }

    // Get NGO profile with user information
    const { data: ngoProfile, error: profileError } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        user:users!user_id(full_name, email, user_type)
      `)
      .eq('id', id)
      .single();

    if (profileError) {
      console.error('Error fetching NGO profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch NGO profile' }, { status: 500 });
    }

    if (!ngoProfile) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    // Get documents uploaded by this NGO
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('profile_id', id)
      .order('created_at', { ascending: false });

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      // Don't fail the entire request if documents fail to load
    }

    // Ensure documents is always an array
    const documentsArray = documents || [];

    // Get additional information for this NGO
    const { data: additionalInfo, error: additionalInfoError } = await supabase
      .from('additional_info')
      .select('*')
      .eq('profile_id', id)
      .order('created_at', { ascending: false });

    if (additionalInfoError) {
      console.error('Error fetching additional info:', additionalInfoError);
      // Don't fail the entire request if additional info fails to load
    }

    // Ensure additionalInfo is always an array
    const additionalInfoArray = additionalInfo || [];

    // Get statistics for this NGO
    let opportunitiesCount = 0;
    let applicationsCount = 0;
    let activeOpportunitiesCount = 0;

    try {
      // Get opportunities created by this NGO user
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunity_description')
        .select('id, opportunity_id, status, title')
        .eq('user_id', ngoProfile.user_id);

      if (!oppError && opportunities) {
        opportunitiesCount = opportunities.length;
        activeOpportunitiesCount = opportunities.filter(o => 
          o.status === 'published' || o.status === 'active'
        ).length;

        // Get applications count
        if (opportunities.length > 0) {
          const opportunityIds = opportunities.map(o => o.opportunity_id).filter(Boolean);
          const { data: applications, error: appError } = await supabase
            .from('opportunity_applications')
            .select('id')
            .in('opportunity_id', opportunityIds);
          
          if (!appError) {
            applicationsCount = applications?.length || 0;
          }
        }
      }
    } catch (statError) {
      console.error(`Error fetching stats for NGO ${id}:`, statError);
      // Don't fail the entire request if stats fail to load
    }

    // Combine all the data
    const ngoWithDetails = {
      ...ngoProfile,
      opportunities_count: opportunitiesCount,
      applications_count: applicationsCount,
      active_opportunities_count: activeOpportunitiesCount,
      documents: documentsArray,
      additionalInfo: additionalInfoArray,
    };

    return NextResponse.json(ngoWithDetails);
  } catch (error) {
    console.error('Error in NGO details API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
