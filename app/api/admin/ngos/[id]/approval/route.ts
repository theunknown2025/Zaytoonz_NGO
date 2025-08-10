import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, notes } = body;

    console.log('Approval request:', { id, action, notes });

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the current admin user
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

    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    // Update ngo_profile table
    const { error: profileError } = await supabase
      .from('ngo_profile')
      .update({
        approval_status: approvalStatus,
        admin_notes: notes || null,
        approved_at: action === 'approve' ? now : null,
        approved_by: action === 'approve' ? user.id : null,
        updated_at: now
      })
      .eq('id', id);

    if (profileError) {
      console.error('Error updating ngo_profile:', profileError);
      return NextResponse.json({ error: 'Failed to update NGO profile' }, { status: 500 });
    }

    console.log('Successfully updated NGO profile approval status');

    // Also update ngo_details table for consistency
    const { data: ngoProfile } = await supabase
      .from('ngo_profile')
      .select('user_id')
      .eq('id', id)
      .single();

    if (ngoProfile?.user_id) {
      const { error: detailsError } = await supabase
        .from('ngo_details')
        .update({
          approval_status: approvalStatus,
          admin_notes: notes || null,
          approved_at: action === 'approve' ? now : null,
          approved_by: action === 'approve' ? user.id : null
        })
        .eq('user_id', ngoProfile.user_id);

      if (detailsError) {
        console.error('Error updating ngo_details:', detailsError);
        // Don't return error here as the main update was successful
      } else {
        console.log('Successfully updated ngo_details approval status');
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });

  } catch (error: any) {
    console.error('Error in NGO approval API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
