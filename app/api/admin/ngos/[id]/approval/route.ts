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

    // Update ngo_details table (since the ID passed is the user_id)
    const { error: detailsError } = await supabase
      .from('ngo_details')
      .update({
        approval_status: approvalStatus,
        admin_notes: notes || null,
        approved_at: action === 'approve' ? now : null,
        approved_by: action === 'approve' ? user.id : null
      })
      .eq('user_id', id);

    if (detailsError) {
      console.error('Error updating ngo_details:', detailsError);
      return NextResponse.json({ error: 'Failed to update NGO details' }, { status: 500 });
    }

    console.log('Successfully updated NGO details approval status');

    return NextResponse.json({ 
      success: true, 
      message: `NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });

  } catch (error: any) {
    console.error('Error in NGO approval API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
