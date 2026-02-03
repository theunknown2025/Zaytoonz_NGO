import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { getUserId } from '@/app/lib/auth-utils';

// Force dynamic rendering since we use headers for authentication
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Try to get userId from request body first, then from auth utils
    let userId: string | null = null;
    
    try {
      const body = await request.json();
      userId = body.userId || null;
    } catch (e) {
      // Body might be empty, that's okay
    }
    
    // Fallback to auth utility if not in body
    if (!userId) {
      userId = await getUserId(request);
    }
    
    // Also try query params as last resort
    if (!userId) {
      const url = new URL(request.url);
      userId = url.searchParams.get('userId');
    }
    
    if (!userId) {
      console.error('No user ID found in request');
      return NextResponse.json({ error: 'Unauthorized - No user ID provided' }, { status: 401 });
    }

    console.log('Marking launching status as shown for user:', userId);

    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('ngo_profile')
      .select('id, launchingstatus')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking NGO profile:', checkError);
      console.error('Error details:', JSON.stringify(checkError, null, 2));
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'NGO profile not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to check NGO profile',
        details: checkError.message 
      }, { status: 500 });
    }

    if (!existingProfile) {
      console.error('NGO profile not found for user:', userId);
      return NextResponse.json({ error: 'NGO profile not found' }, { status: 404 });
    }

    // Update the launchingstatus to 'shown' for this user's NGO profile
    const { data, error } = await supabase
      .from('ngo_profile')
      .update({ launchingstatus: 'shown' })
      .eq('user_id', userId)
      .select('launchingstatus')
      .maybeSingle();

    if (error) {
      console.error('Error updating launching status:', error);
      return NextResponse.json({ 
        error: 'Failed to update launching status',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      launchingstatus: data?.launchingstatus || 'shown' 
    });

  } catch (error: any) {
    console.error('Error in mark launching shown API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
