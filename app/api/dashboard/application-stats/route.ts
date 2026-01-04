import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    // Initialize Supabase client at runtime, not build time
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_application_stats');
    
    if (error) {
      // Fallback to direct query if RPC doesn't exist
      const { data: appData, error: appError } = await supabase
        .from('opportunity_applications')
        .select('status, submitted_at');

      if (appError) {
        throw appError;
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const stats = {
        total_applications: appData.length,
        pending: appData.filter(app => app.status === 'submitted').length,
        approved: appData.filter(app => app.status === 'approved').length,
        rejected: appData.filter(app => app.status === 'rejected').length,
        this_week: appData.filter(app => new Date(app.submitted_at) >= oneWeekAgo).length,
        last_week: appData.filter(app => 
          new Date(app.submitted_at) >= twoWeeksAgo && 
          new Date(app.submitted_at) < oneWeekAgo
        ).length
      };

      return NextResponse.json(stats);
    }

    return NextResponse.json(data[0] || {
      total_applications: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      this_week: 0,
      last_week: 0
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application statistics' },
      { status: 500 }
    );
  }
} 