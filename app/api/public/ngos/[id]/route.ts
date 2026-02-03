import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get NGO profile
    const { data: ngoProfile, error: profileError } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        additional_info(*),
        documents(*)
      `)
      .eq('id', id)
      .eq('approval_status', 'approved')
      .single();

    if (profileError || !ngoProfile) {
      return NextResponse.json(
        { error: 'NGO profile not found' },
        { status: 404 }
      );
    }

    // Get opportunities created by this NGO
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select(`
        id,
        opportunity_type,
        created_at,
        opportunity_description!inner(
          id,
          title,
          status,
          user_id
        )
      `)
      .eq('opportunity_description.user_id', ngoProfile.user_id)
      .eq('opportunity_description.status', 'published')
      .order('created_at', { ascending: false });

    if (oppError) {
      console.error('Error fetching opportunities:', oppError);
    }

    // Format opportunities with type and title
    const formattedOpportunities = (opportunities || []).map((opp: any) => {
      // opportunity_description is an array from the join
      const description = Array.isArray(opp.opportunity_description) 
        ? opp.opportunity_description[0] 
        : opp.opportunity_description;
      
      return {
        id: opp.id,
        title: description?.title || 'Untitled Opportunity',
        type: opp.opportunity_type,
        created_at: opp.created_at
      };
    });

    // Count opportunities by type
    const jobsCount = formattedOpportunities.filter((o: any) => o.type === 'job').length;
    const fundingsCount = formattedOpportunities.filter((o: any) => o.type === 'funding').length;
    const trainingsCount = formattedOpportunities.filter((o: any) => o.type === 'training').length;

    return NextResponse.json({
      profile: ngoProfile,
      opportunities: formattedOpportunities,
      stats: {
        jobs_count: jobsCount,
        fundings_count: fundingsCount,
        trainings_count: trainingsCount,
        total_opportunities: formattedOpportunities.length
      },
      error: null
    });
  } catch (error: any) {
    console.error('Error in GET /api/public/ngos/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
