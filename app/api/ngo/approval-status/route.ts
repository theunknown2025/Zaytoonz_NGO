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
      .select('approval_status, admin_notes, approved_at, approved_by, launchingstatus')
      .eq('user_id', userId)
      .maybeSingle();

    // Note: Only ngo_profile table exists, no ngo_details table

    // If we have an error that's not "not found", return error immediately
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching NGO profile:', profileError);
      console.error('Error details:', JSON.stringify(profileError, null, 2));
      return NextResponse.json({ 
        error: 'Failed to fetch approval status', 
        details: profileError.message,
        code: profileError.code
      }, { status: 500 });
    }

    // If no profile found, check if user exists and create a default profile
    let userData: any = null;
    if (!ngoProfile) {
      console.log('No NGO profile found, checking if user exists');
      
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id, email, user_type')
        .eq('id', userId)
        .maybeSingle();
        
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
            approved_at: approvedAt,
            launchingstatus: 'not_shown'
          })
          .select('approval_status, admin_notes, approved_at, approved_by, launchingstatus')
          .maybeSingle();

        if (!createError && newProfile) {
          ngoProfile = newProfile;
          profileError = null;
          console.log(`Created default NGO profile with ${approvalStatus} status`);
        } else {
          console.error('Error creating NGO profile:', createError);
          // Don't fail completely, just continue with default values
        }
      }
    }

    // Return the approval status (auto-approve assistant_ngo users)
    let approvalStatus = ngoProfile?.approval_status || 'pending';
    let launchingStatus = ngoProfile?.launchingstatus || 'not_shown';
    
    // Auto-approve assistant_ngo users even if no profile exists
    if (!ngoProfile && userData?.user_type === 'assistant_ngo') {
      approvalStatus = 'approved';
    }
    
    console.log('Final approval status:', approvalStatus, 'Launching status:', launchingStatus);

    return NextResponse.json({
      approval_status: approvalStatus,
      admin_notes: ngoProfile?.admin_notes || null,
      approved_at: ngoProfile?.approved_at || null,
      approved_by: ngoProfile?.approved_by || null,
      launchingstatus: launchingStatus
    });

  } catch (error: any) {
    console.error('Error in approval status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
