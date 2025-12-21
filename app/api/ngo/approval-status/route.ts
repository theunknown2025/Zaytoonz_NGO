import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { getUserId } from '@/app/lib/auth-utils';

// Force dynamic rendering since we use headers for authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the user ID using the authentication utility
    const userId = await getUserId(request);
    
    if (!userId) {
      console.error('No user ID found in request');
      return NextResponse.json({ error: 'Unauthorized - No user ID provided' }, { status: 401 });
    }

    console.log('Fetching approval status for user:', userId);

    // First, try to fetch from ngo_profile table
    let { data: ngoProfile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('approval_status, admin_notes, approved_at, approved_by')
      .eq('user_id', userId)
      .single();

    // Note: Only ngo_profile table exists, no ngo_details table

    // If still no profile found, check if user exists and create a default profile
    let userData: any = null;
    if (profileError && profileError.code === 'PGRST116') {
      console.log('No NGO profile found in either table, checking if user exists');
      
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id, email, user_type')
        .eq('id', userId)
        .single();
        
      userData = userDataResult;

      if (!userError && userData && (userData.user_type === 'NGO' || userData.user_type === 'admin_ngo' || userData.user_type === 'assistant_ngo')) {
        console.log('User exists and is NGO type, creating default profile');
        
        // Auto-approve assistant_ngo users, others need approval
        const approvalStatus = userData.user_type === 'assistant_ngo' ? 'approved' : 'pending';
        const approvedAt = userData.user_type === 'assistant_ngo' ? new Date().toISOString() : null;
        
        // Try to create a profile in ngo_profile table
        const { data: newProfile, error: createError } = await supabase
          .from('ngo_profile')
          .insert({
            user_id: userId,
            name: 'NGO Organization',
            email: userData.email,
            year_created: new Date().getFullYear().toString(),
            legal_rep_name: 'Not specified',
            legal_rep_email: userData.email,
            legal_rep_phone: 'Not specified',
            legal_rep_function: 'Not specified',
            approval_status: approvalStatus,
            approved_at: approvedAt
          })
          .select('approval_status, admin_notes, approved_at, approved_by')
          .single();

        if (!createError && newProfile) {
          ngoProfile = newProfile;
          profileError = null;
          console.log(`Created default NGO profile with ${approvalStatus} status`);
        } else {
          console.error('Error creating NGO profile:', createError);
        }
      }
    }

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching NGO profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch approval status' }, { status: 500 });
    }

    // Return the approval status (auto-approve assistant_ngo users)
    let approvalStatus = ngoProfile?.approval_status || 'pending';
    
    // Auto-approve assistant_ngo users even if no profile exists
    if (!ngoProfile && userData?.user_type === 'assistant_ngo') {
      approvalStatus = 'approved';
    }
    
    console.log('Final approval status:', approvalStatus);

    return NextResponse.json({
      approval_status: approvalStatus,
      admin_notes: ngoProfile?.admin_notes || null,
      approved_at: ngoProfile?.approved_at || null,
      approved_by: ngoProfile?.approved_by || null
    });

  } catch (error: any) {
    console.error('Error in approval status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
