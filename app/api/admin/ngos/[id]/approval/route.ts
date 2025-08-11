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

    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    // Update ngo_profile table
    const { error: profileError } = await supabase
      .from('ngo_profile')
      .update({
        approval_status: approvalStatus,
        admin_notes: notes || null,
        approved_at: action === 'approve' ? now : null,
        updated_at: now
      })
      .eq('id', id);

    if (profileError) {
      console.error('Error updating ngo_profile:', profileError);
      return NextResponse.json({ error: 'Failed to update NGO profile' }, { status: 500 });
    }

    console.log('Successfully updated NGO profile approval status');

    return NextResponse.json({ 
      success: true, 
      message: `NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });

  } catch (error: any) {
    console.error('Error in NGO approval API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
