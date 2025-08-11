import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching NGO profiles from ngo_profile table');

    // Fetch all NGO profiles with user information
    const { data: ngoProfiles, error: ngoError } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        user:users!user_id(full_name, email, user_type)
      `)
      .order('created_at', { ascending: false });

    if (ngoError) {
      console.error('Error fetching NGO profiles:', ngoError);
      return NextResponse.json({ error: 'Failed to fetch NGO profiles' }, { status: 500 });
    }

    console.log('Found NGO profiles:', ngoProfiles?.length || 0);

    // Get statistics for each NGO
    const ngosWithStats = await Promise.all(
      (ngoProfiles || []).map(async (ngoProfile) => {
        try {
          // Get opportunities created by this NGO user
          const { data: opportunities, error: oppError } = await supabase
            .from('opportunity_description')
            .select('id, opportunity_id, status, title')
            .eq('user_id', ngoProfile.user_id);

          if (oppError) {
            console.error('Error fetching opportunities:', oppError);
          }

          const opportunitiesCount = opportunities?.length || 0;
          const activeOpportunitiesCount = opportunities?.filter(o => 
            o.status === 'published' || o.status === 'active'
          ).length || 0;

          // Get applications count
          let applicationsCount = 0;
          if (opportunities && opportunities.length > 0) {
            const opportunityIds = opportunities.map(o => o.opportunity_id).filter(Boolean);
            const { data: applications, error: appError } = await supabase
              .from('opportunity_applications')
              .select('id')
              .in('opportunity_id', opportunityIds);
            
            if (!appError) {
              applicationsCount = applications?.length || 0;
            }
          }

          return {
            id: ngoProfile.id,
            user_id: ngoProfile.user_id,
            name: ngoProfile.name,
            email: ngoProfile.email,
            year_created: ngoProfile.year_created,
            legal_rep_name: ngoProfile.legal_rep_name,
            legal_rep_email: ngoProfile.legal_rep_email,
            legal_rep_phone: ngoProfile.legal_rep_phone,
            legal_rep_function: ngoProfile.legal_rep_function,
            profile_image_url: ngoProfile.profile_image_url,
            created_at: ngoProfile.created_at,
            updated_at: ngoProfile.updated_at,
            approval_status: ngoProfile.approval_status || 'pending',
            admin_notes: ngoProfile.admin_notes,
            approved_at: ngoProfile.approved_at,
            approved_by: ngoProfile.approved_by,
            opportunities_count: opportunitiesCount,
            applications_count: applicationsCount,
            active_opportunities_count: activeOpportunitiesCount,
            user: ngoProfile.user
          };
        } catch (statError) {
          console.error(`Error fetching stats for NGO ${ngoProfile.id}:`, statError);
          return {
            id: ngoProfile.id,
            user_id: ngoProfile.user_id,
            name: ngoProfile.name,
            email: ngoProfile.email,
            year_created: ngoProfile.year_created,
            legal_rep_name: ngoProfile.legal_rep_name,
            legal_rep_email: ngoProfile.legal_rep_email,
            legal_rep_phone: ngoProfile.legal_rep_phone,
            legal_rep_function: ngoProfile.legal_rep_function,
            profile_image_url: ngoProfile.profile_image_url,
            created_at: ngoProfile.created_at,
            updated_at: ngoProfile.updated_at,
            approval_status: ngoProfile.approval_status || 'pending',
            admin_notes: ngoProfile.admin_notes,
            approved_at: ngoProfile.approved_at,
            approved_by: ngoProfile.approved_by,
            opportunities_count: 0,
            applications_count: 0,
            active_opportunities_count: 0,
            user: ngoProfile.user
          };
        }
      })
    );

    console.log('Processed NGOs with stats:', ngosWithStats.length);

    return NextResponse.json({ 
      ngos: ngosWithStats,
      total: ngosWithStats.length
    });

  } catch (error) {
    console.error('Error in GET /api/admin/ngos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This could be used for admin-created NGO profiles if needed
    const ngoData = {
      name: body.name,
      email: body.email,
      year_created: body.year_created,
      legal_rep_name: body.legal_rep_name,
      legal_rep_email: body.legal_rep_email,
      legal_rep_phone: body.legal_rep_phone,
      legal_rep_function: body.legal_rep_function,
      profile_image_url: body.profile_image_url,
      user_id: body.user_id,
    };

    const { data: ngoProfile, error } = await supabase
      .from('ngo_profile')
      .insert(ngoData)
      .select()
      .single();

    if (error) {
      console.error('Error creating NGO profile:', error);
      return NextResponse.json({ error: 'Failed to create NGO profile' }, { status: 500 });
    }

    return NextResponse.json({ ngoProfile });
  } catch (error) {
    console.error('Error in POST /api/admin/ngos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: ngoProfile, error } = await supabase
      .from('ngo_profile')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating NGO profile:', error);
      return NextResponse.json({ error: 'Failed to update NGO profile' }, { status: 500 });
    }

    return NextResponse.json({ ngoProfile });
  } catch (error) {
    console.error('Error in PATCH /api/admin/ngos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'NGO ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ngo_profile')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting NGO profile:', error);
      return NextResponse.json({ error: 'Failed to delete NGO profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/ngos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 