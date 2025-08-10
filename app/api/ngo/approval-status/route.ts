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

    console.log('Current user:', user.email);

    // Fetch NGO approval status from ngo_profile table
    const { data: ngoProfile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('approval_status, admin_notes, approved_at, approved_by')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found, return pending status
        console.log('No NGO profile found for user:', user.id);
        return NextResponse.json({
          approval_status: 'pending',
          admin_notes: null,
          approved_at: null,
          approved_by: null
        });
      }
      console.error('Error fetching NGO profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch approval status' }, { status: 500 });
    }

    console.log('NGO profile found:', ngoProfile);

    // Return the approval status from ngo_profile (primary source)
    return NextResponse.json({
      approval_status: ngoProfile?.approval_status || 'pending',
      admin_notes: ngoProfile?.admin_notes || null,
      approved_at: ngoProfile?.approved_at || null,
      approved_by: ngoProfile?.approved_by || null
    });

  } catch (error: any) {
    console.error('Error in approval status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
