import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
    }

    console.log('Fixing NGO profile for user:', userId);

    // First, check if the user exists and is an NGO
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, user_type')
      .eq('id', userId)
      .single();

    if (userError || !userData || userData.user_type !== 'NGO') {
      return NextResponse.json({ error: 'User not found or not an NGO' }, { status: 400 });
    }

    // Check if ngo_profile table has the approval_status column
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'ngo_profile')
      .eq('column_name', 'approval_status');

    const hasApprovalStatus = columns && columns.length > 0;

    if (!hasApprovalStatus) {
      console.log('approval_status column does not exist, adding it...');
      
      // Try to add the column (this might fail if migration hasn't been run)
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE ngo_profile 
          ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
          CHECK (approval_status IN ('pending', 'approved', 'rejected'));
          
          ALTER TABLE ngo_profile 
          ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
          ADD COLUMN IF NOT EXISTS admin_notes TEXT;
        `
      });

      if (alterError) {
        console.log('Could not add columns via RPC, columns may already exist or migration needed');
      }
    }

    // Check if NGO profile exists
    let { data: profile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Creating NGO profile...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('ngo_profile')
        .insert({
          user_id: userId,
          name: userData.full_name || 'NGO Organization',
          email: userData.email,
          year_created: new Date().getFullYear().toString(),
          legal_rep_name: 'Not specified',
          legal_rep_email: userData.email,
          legal_rep_phone: 'Not specified',
          legal_rep_function: 'Not specified',
          approval_status: 'pending'
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ error: 'Failed to create NGO profile' }, { status: 500 });
      }

      profile = newProfile;
      console.log('Created new NGO profile');
    } else if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch NGO profile' }, { status: 500 });
    }

    // Ensure the profile has approval_status field
    if (!profile.approval_status) {
      console.log('Profile exists but missing approval_status, updating...');
      
      const { error: updateError } = await supabase
        .from('ngo_profile')
        .update({ approval_status: 'pending' })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        profile.approval_status = 'pending';
        console.log('Updated profile with approval_status');
      }
    }

    return NextResponse.json({
      success: true,
      profile: profile,
      message: 'NGO profile fixed successfully'
    });

  } catch (error: any) {
    console.error('Error in fix profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
