import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Supabase auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is an admin
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (userError || adminUser?.user_type !== 'Admin') {
      console.error('User not admin:', userError, adminUser);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Admin user authenticated:', user.email);

    // Fetch all NGO profiles
    const { data: ngoProfiles, error: ngoError } = await supabase
      .from('ngo_profile')
      .select(`
        id,
        user_id,
        name,
        email,
        year_created,
        legal_rep_name,
        legal_rep_email,
        legal_rep_phone,
        legal_rep_function,
        profile_image_url,
        created_at,
        updated_at,
        approval_status,
        admin_notes,
        approved_at,
        approved_by
      `)
      .order('created_at', { ascending: false });

    if (ngoError) {
      console.error('Error fetching NGO profiles:', ngoError);
      return NextResponse.json({ error: 'Failed to fetch NGO profiles' }, { status: 500 });
    }

    console.log('Found NGO profiles:', ngoProfiles?.length || 0);

    // Get statistics for each NGO
    const ngosWithStats = await Promise.all(
      (ngoProfiles || []).map(async (ngo) => {
        try {
          // Method 1: Get opportunities directly created by this NGO user
          const { data: directOpportunities, error: oppError1 } = await supabase
            .from('opportunity_description')
            .select('id, opportunity_id, status, title')
            .eq('user_id', ngo.user_id);

          // Method 2: Also look for opportunities that might be related by email domain or name similarity
          // Get the user's email domain
          const emailDomain = ngo.email.split('@')[1];
          
          // Look for other users with similar email domain who might have created opportunities
          const { data: relatedUsers, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .like('email', `%${emailDomain}%`);

          let relatedOpportunities: any[] = [];
          if (relatedUsers && relatedUsers.length > 0) {
            const relatedUserIds = relatedUsers.map(u => u.id);
            const { data: relatedOpps, error: oppError2 } = await supabase
              .from('opportunity_description')
              .select('id, opportunity_id, status, title, user_id')
              .in('user_id', relatedUserIds);
            
            relatedOpportunities = relatedOpps || [];
          }

          // Combine direct and related opportunities
          const allOpportunities = [
            ...(directOpportunities || []),
            ...relatedOpportunities.filter(ro => 
              !directOpportunities?.some(do_ => do_.id === ro.id)
            )
          ];

          // Get unique opportunity IDs
          const opportunityIds = allOpportunities.map(o => o.opportunity_id).filter(Boolean);
          const uniqueOpportunityIds = Array.from(new Set(opportunityIds));
          const opportunitiesCount = uniqueOpportunityIds.length;

          // Count active opportunities (status = 'published' or 'active')
          const activeOpportunitiesCount = allOpportunities.filter(o => 
            o.status === 'published' || o.status === 'active'
          ).length || 0;

          // Get applications count for all related opportunities
          let applicationsCount = 0;
          if (uniqueOpportunityIds.length > 0) {
            const { data: applications, error: appError } = await supabase
              .from('opportunity_applications')
              .select('id')
              .in('opportunity_id', uniqueOpportunityIds);
            
            applicationsCount = applications?.length || 0;
          }

          return {
            id: ngo.id,
            user_id: ngo.user_id,
            name: ngo.name,
            email: ngo.email,
            year_created: ngo.year_created,
            legal_rep_name: ngo.legal_rep_name,
            legal_rep_email: ngo.legal_rep_email,
            legal_rep_phone: ngo.legal_rep_phone,
            legal_rep_function: ngo.legal_rep_function,
            profile_image_url: ngo.profile_image_url,
            created_at: ngo.created_at,
            updated_at: ngo.updated_at,
            approval_status: ngo.approval_status || 'pending',
            admin_notes: ngo.admin_notes,
            approved_at: ngo.approved_at,
            approved_by: ngo.approved_by,
            opportunities_count: opportunitiesCount,
            applications_count: applicationsCount,
            active_opportunities_count: activeOpportunitiesCount,
          };
        } catch (statError) {
          console.error(`Error fetching stats for NGO ${ngo.id}:`, statError);
          return {
            id: ngo.id,
            user_id: ngo.user_id,
            name: ngo.name,
            email: ngo.email,
            year_created: ngo.year_created,
            legal_rep_name: ngo.legal_rep_name,
            legal_rep_email: ngo.legal_rep_email,
            legal_rep_phone: ngo.legal_rep_phone,
            legal_rep_function: ngo.legal_rep_function,
            profile_image_url: ngo.profile_image_url,
            created_at: ngo.created_at,
            updated_at: ngo.updated_at,
            approval_status: ngo.approval_status || 'pending',
            admin_notes: ngo.admin_notes,
            approved_at: ngo.approved_at,
            approved_by: ngo.approved_by,
            opportunities_count: 0,
            applications_count: 0,
            active_opportunities_count: 0,
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