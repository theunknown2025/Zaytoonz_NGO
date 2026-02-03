import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { getUserId } from '@/app/lib/auth-utils';

// GET - Fetch team members for an NGO
export async function GET(request: NextRequest) {
  try {
    // Try to get userId from query params first, then from custom header
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');
    
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }
    
    if (!userId) {
      // Fallback to auth utils
      userId = await getUserId(request);
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the NGO profile for the current user
    const { data: ngoProfile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !ngoProfile) {
      return NextResponse.json({ error: 'NGO profile not found' }, { status: 404 });
    }

    // Get team members from ngo_users table that belong to this specific NGO profile
    const { data: ngoUsers, error } = await supabase
      .from('ngo_users')
      .select(`
        id,
        full_name,
        email,
        role,
        status,
        created_at,
        created_by,
        user_id,
        users!ngo_users_user_id_fkey(
          id,
          full_name,
          email,
          user_type,
          created_at
        )
      `)
      .eq('ngo_profile_id', ngoProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedMembers = ngoUsers?.map(ngoUser => ({
      id: ngoUser.user_id || ngoUser.id,
      full_name: ngoUser.full_name,
      email: ngoUser.email,
      role: ngoUser.role || 'member',
      status: ngoUser.status || 'active',
      created_at: ngoUser.created_at,
      created_by: ngoUser.created_by
    })) || [];

    return NextResponse.json({ teamMembers: transformedMembers });
  } catch (error) {
    console.error('Error in GET /api/ngo/team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new team member
export async function POST(request: NextRequest) {
  try {
    // Try to get userId from custom header first, then from auth utils
    let userId = request.headers.get('x-user-id');
    
    if (!userId) {
      userId = await getUserId(request);
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, email, password, role } = body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the NGO profile for the current user
    const { data: ngoProfile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !ngoProfile) {
      return NextResponse.json({ error: 'NGO profile not found' }, { status: 404 });
    }

    // Check if email already exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create new user with assistant_ngo role
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password_hash: password, // Will be hashed by trigger
        user_type: 'assistant_ngo',
        auth_provider: 'email'
      })
      .select()
      .single();

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create NGO profile for the new user with auto-approval
    const { error: ngoProfileError } = await supabase
      .from('ngo_profile')
      .insert({ 
        user_id: newUser.id,
        name: 'Team Member',
        email: newUser.email,
        year_created: new Date().getFullYear().toString(),
        legal_rep_name: 'Not specified',
        legal_rep_email: newUser.email,
        legal_rep_phone: 'Not specified',
        legal_rep_function: 'Not specified',
        approval_status: 'approved', // Auto-approve assistant_ngo accounts
        approved_at: new Date().toISOString(),
        approved_by: userId // Approved by the NGO admin who created the account
      });

    if (ngoProfileError) {
      console.error('Error creating NGO profile:', ngoProfileError);
      // Continue anyway as the user was created successfully
    }

    // Add to ngo_users table for team management
    const { data: teamMember, error: teamError } = await supabase
      .from('ngo_users')
      .insert({
        ngo_profile_id: ngoProfile.id,
        user_id: newUser.id,
        full_name,
        email,
        password_hash: password, // Will be hashed by trigger
        role: role || 'member',
        status: 'active',
        created_by: userId
      })
      .select()
      .single();

    if (teamError) {
      console.error('Error adding team member:', teamError);
      // Clean up the created user
      await supabase.from('users').delete().eq('id', newUser.id);
      return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      teamMember: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: teamMember.role,
        status: teamMember.status,
        created_at: newUser.created_at,
        created_by: teamMember.created_by
      },
      message: 'Team member added successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/ngo/team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}