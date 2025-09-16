import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { getUserId } from '@/app/lib/auth-utils';

// PATCH - Update team member role or status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get userId from custom header first, then from auth utils
    let userId = request.headers.get('x-user-id');
    
    if (!userId) {
      userId = await getUserId(request);
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { role, status } = body;

    // Verify the current user has permission to update this team member
    const { data: teamMember, error: fetchError } = await supabase
      .from('ngo_users')
      .select(`
        *,
        ngo_profile!inner(user_id)
      `)
      .eq('user_id', id)
      .single();

    if (fetchError || !teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check if current user is the NGO admin
    if (teamMember.ngo_profile.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this team member' }, { status: 403 });
    }

    // Update team member
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const { data: updatedMember, error: updateError } = await supabase
      .from('ngo_users')
      .update(updateData)
      .eq('user_id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating team member:', updateError);
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      teamMember: updatedMember,
      message: 'Team member updated successfully' 
    });
  } catch (error) {
    console.error('Error in PATCH /api/ngo/team/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get userId from custom header first, then from auth utils
    let userId = request.headers.get('x-user-id');
    
    if (!userId) {
      userId = await getUserId(request);
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the current user has permission to delete this team member
    const { data: teamMember, error: fetchError } = await supabase
      .from('ngo_users')
      .select(`
        *,
        ngo_profile!inner(user_id)
      `)
      .eq('user_id', id)
      .single();

    if (fetchError || !teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check if current user is the NGO admin
    if (teamMember.ngo_profile.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this team member' }, { status: 403 });
    }

    // Delete team member from ngo_users table
    const { error: deleteError } = await supabase
      .from('ngo_users')
      .delete()
      .eq('user_id', id);

    if (deleteError) {
      console.error('Error deleting team member:', deleteError);
      return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }

    // Optionally delete the user account as well
    if (teamMember.user_id) {
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', teamMember.user_id);

      if (userDeleteError) {
        console.error('Error deleting user account:', userDeleteError);
        // Continue anyway as the team member was removed
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team member deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/ngo/team/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}