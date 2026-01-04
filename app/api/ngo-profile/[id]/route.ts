import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force runtime execution - don't execute during build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase client to avoid build-time execution
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Supabase client at runtime, not build time
    const supabase = getSupabaseClient();
    const { id } = params;

    // Fetch NGO profile with related data
    const { data: profile, error } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        additional_info (*),
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching NGO profile:', error);
      return NextResponse.json({ error: 'NGO profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in NGO profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 