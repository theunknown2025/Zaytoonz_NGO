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

    // Extracted listings attributed to this NGO (admin scraper → extract flow)
    const { data: extractedForNgo, error: extractedErr } = await supabase
      .from('extracted_opportunity_content')
      .select('id, title, opportunity_type, created_at')
      .eq('ngo_profile_id', id)
      .eq('extraction_status', 'completed')
      .order('created_at', { ascending: false });

    if (extractedErr) {
      console.error('Error fetching extracted opportunities for NGO:', extractedErr);
    }

    const formattedExtracted = (extractedForNgo || []).map((row: any) => ({
      id: `extracted_${row.id}`,
      title: row.title || 'Untitled Opportunity',
      type: row.opportunity_type,
      created_at: row.created_at,
    }));

    const allPublicOpportunities = [...formattedOpportunities, ...formattedExtracted].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Count opportunities by type
    const jobsCount = allPublicOpportunities.filter((o: any) => o.type === 'job').length;
    const fundingsCount = allPublicOpportunities.filter((o: any) => o.type === 'funding').length;
    const trainingsCount = allPublicOpportunities.filter((o: any) => o.type === 'training').length;

    return NextResponse.json({
      profile: ngoProfile,
      opportunities: allPublicOpportunities,
      stats: {
        jobs_count: jobsCount,
        fundings_count: fundingsCount,
        trainings_count: trainingsCount,
        total_opportunities: allPublicOpportunities.length
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
