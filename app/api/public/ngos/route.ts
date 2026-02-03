import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get only approved NGOs
    const { data: ngoProfiles, error } = await supabase
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

    if (error) {
      console.error('Error fetching NGO profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch NGO profiles' },
        { status: 500 }
      );
    }

    // Get opportunity counts for each NGO by type
    const ngosWithStats = await Promise.all(
      (ngoProfiles || []).map(async (ngo) => {
        try {
          // Get all published opportunities for this NGO using the user_id column in opportunities table
          const { data: opportunities, error: oppError } = await supabase
            .from('opportunities')
            .select(`
              id,
              opportunity_type,
              user_id,
              opportunity_description!inner(
                status
              )
            `)
            .eq('user_id', ngo.user_id)
            .eq('opportunity_description.status', 'published');

          if (oppError) {
            console.error(`Error fetching opportunities for NGO ${ngo.id}:`, oppError);
            return {
              ...ngo,
              jobs_count: 0,
              fundings_count: 0,
              trainings_count: 0,
              total_opportunities: 0
            };
          }

          // Count opportunities by type
          const jobsCount = opportunities?.filter(o => o.opportunity_type === 'job').length || 0;
          const fundingsCount = opportunities?.filter(o => o.opportunity_type === 'funding').length || 0;
          const trainingsCount = opportunities?.filter(o => o.opportunity_type === 'training').length || 0;
          const totalOpportunities = opportunities?.length || 0;

          return {
            ...ngo,
            jobs_count: jobsCount,
            fundings_count: fundingsCount,
            trainings_count: trainingsCount,
            total_opportunities: totalOpportunities
          };
        } catch (statError) {
          console.error(`Error fetching stats for NGO ${ngo.id}:`, statError);
          return {
            ...ngo,
            jobs_count: 0,
            fundings_count: 0,
            trainings_count: 0,
            total_opportunities: 0
          };
        }
      })
    );

    // Return all approved NGOs, even if they have no opportunities yet
    // This ensures all admin_ngo and approved NGOs are displayed on the landing page
    return NextResponse.json({ ngos: ngosWithStats, error: null });
  } catch (error: any) {
    console.error('Error in GET /api/public/ngos:', error);
    return NextResponse.json(
      { error: 'Internal server error', ngos: [] },
      { status: 500 }
    );
  }
}
