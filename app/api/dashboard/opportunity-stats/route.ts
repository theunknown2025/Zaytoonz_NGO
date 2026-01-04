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
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select(`
        id,
        created_at,
        opportunity_description!inner(
          id,
          status,
          created_at
        )
      `);

    if (oppError) {
      throw oppError;
    }

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const stats = {
      total_opportunities: opportunities.length,
      active_opportunities: opportunities.filter(opp => 
        (opp.opportunity_description as any)?.status === 'published'
      ).length,
      this_month: opportunities.filter(opp => 
        new Date((opp.opportunity_description as any)?.created_at || opp.created_at) >= oneMonthAgo
      ).length,
      last_month: opportunities.filter(opp => {
        const createdAt = new Date((opp.opportunity_description as any)?.created_at || opp.created_at);
        return createdAt >= twoMonthsAgo && createdAt < oneMonthAgo;
      }).length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching opportunity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity statistics' },
      { status: 500 }
    );
  }
} 