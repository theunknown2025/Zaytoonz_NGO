import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Get user counts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, user_type');

    if (usersError) {
      throw usersError;
    }

    // Get NGO profiles count
    const { data: ngoProfiles, error: ngoError } = await supabase
      .from('ngo_profile')
      .select('id');

    if (ngoError) {
      throw ngoError;
    }

    // Get users with CVs count
    const { data: cvUsers, error: cvError } = await supabase
      .from('cvs')
      .select('user_id')
      .not('user_id', 'is', null);

    if (cvError) {
      throw cvError;
    }

    const uniqueCvUsers = Array.from(new Set(cvUsers.map(cv => cv.user_id)));

    const stats = {
      total_users: users.length,
      ngo_users: users.filter(user => user.user_type === 'NGO' || user.user_type === 'admin_ngo' || user.user_type === 'assistant_ngo').length,
      seeker_users: users.filter(user => user.user_type === 'Personne').length,
      ngo_profiles: ngoProfiles.length,
      users_with_cvs: uniqueCvUsers.length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
} 