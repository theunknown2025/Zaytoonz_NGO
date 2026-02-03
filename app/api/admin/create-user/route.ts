import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, password, user_type } = body;

    // Validate required fields
    if (!full_name || !email || !password || !user_type) {
      return NextResponse.json(
        { error: 'Full name, email, password, and user type are required' },
        { status: 400 }
      );
    }

    // Validate user type
    const validUserTypes = ['Personne', 'NGO', 'Admin', 'admin_ngo', 'assistant_ngo'];
    if (!validUserTypes.includes(user_type)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email, auth_provider')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Failed to check if email exists' },
        { status: 500 }
      );
    }

    const existingUser = existingUsers?.[0] ?? null;

    if (existingUser) {
      if (existingUser.auth_provider === 'google') {
        return NextResponse.json(
          { error: 'This email is already registered with Google. Please use a different email.' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
    }

    // Insert the new user (password will be hashed by database trigger)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: full_name,
        email: email,
        password_hash: password, // Will be hashed by the trigger
        user_type: user_type,
        auth_provider: 'email' // Regular email/password signup
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: userError?.message || 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Return the created user (without password_hash)
    return NextResponse.json({
      user: {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        userType: userData.user_type
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/create-user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
