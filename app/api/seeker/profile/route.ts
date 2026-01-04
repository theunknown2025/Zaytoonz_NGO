import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force runtime execution - don't execute during build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase client to avoid build-time execution
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// GET handler - Fetch seeker profile
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing user ID',
        profile: null 
      }, { status: 400 });
    }

    // Fetch seeker profile
    const { data: profile, error } = await supabase
      .from('seeker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine for a new user
      console.error('Error fetching profile:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch profile',
        profile: null 
      }, { status: 500 });
    }

    // Also fetch user basic info
    const { data: user } = await supabase
      .from('users')
      .select('full_name, email, user_type')
      .eq('id', userId)
      .single();

    return NextResponse.json({ 
      profile: profile || null,
      user: user || null
    });

  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      profile: null 
    }, { status: 500 });
  }
}

// POST handler - Create or update seeker profile
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId, profileData } = body;

    if (!userId || !profileData) {
      return NextResponse.json({ 
        error: 'Missing user ID or profile data' 
      }, { status: 400 });
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('seeker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const dataToSave = {
      user_id: userId,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      date_of_birth: profileData.dateOfBirth || null,
      nationality: profileData.nationality || null,
      latest_job_title: profileData.latestJobTitle || null,
      years_of_experience: profileData.yearsOfExperience || null,
      fields_of_experience: profileData.fieldsOfExperience || [],
      about_me: profileData.aboutMe || null,
      profile_picture_url: profileData.profilePictureUrl || null,
      updated_at: new Date().toISOString()
    };

    let result;
    
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('seeker_profiles')
        .update(dataToSave)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('seeker_profiles')
        .insert(dataToSave)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving profile:', result.error);
      return NextResponse.json({ 
        error: 'Failed to save profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      profile: result.data 
    });

  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

