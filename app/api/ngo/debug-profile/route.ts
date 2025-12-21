import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
    }

    console.log('Debug: Checking NGO profile for user:', userId);

    // First, let's check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%ngo%');

    console.log('Available NGO-related tables:', tables);

    // Check if ngo_profile table exists and get its structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'ngo_profile')
      .order('ordinal_position');

    console.log('NGO profile table columns:', columns);

    // Try to fetch the actual NGO profile
    const { data: profile, error: profileError } = await supabase
      .from('ngo_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Profile fetch result:', { profile, error: profileError });

    // Also check ngo_details table
    const { data: details, error: detailsError } = await supabase
      .from('ngo_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Details fetch result:', { details, error: detailsError });

    return NextResponse.json({
      tables: tables || [],
      columns: columns || [],
      profile: profile || null,
      profileError: profileError ? profileError.message : null,
      details: details || null,
      detailsError: detailsError ? detailsError.message : null
    });

  } catch (error: any) {
    console.error('Error in debug profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
