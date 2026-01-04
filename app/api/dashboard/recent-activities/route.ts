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
    // Get recent applications
    const { data: applications, error: appError } = await supabase
      .from('opportunity_applications')
      .select(`
        id,
        status,
        submitted_at,
        opportunities!inner(
          id,
          opportunity_description!inner(
            title
          )
        ),
        users!inner(
          full_name
        )
      `)
      .order('submitted_at', { ascending: false })
      .limit(5);

    if (appError) {
      throw appError;
    }

    // Get recent opportunities
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunity_description')
      .select('id, title, description, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (oppError) {
      throw oppError;
    }

    // Combine and format activities
    const activities = [
      ...applications.map((app: any) => ({
        type: 'application',
        id: app.id,
        title: `New application for "${app.opportunities?.opportunity_description?.title || 'Unknown Opportunity'}"`,
        description: `Application submitted by ${app.users?.full_name || 'Unknown User'}`,
        timestamp: app.submitted_at,
        status: app.status
      })),
      ...opportunities.map((opp: any) => ({
        type: 'opportunity',
        id: opp.id,
        title: `Opportunity "${opp.title}" created`,
        description: opp.description ? opp.description.substring(0, 100) + '...' : 'No description available',
        timestamp: opp.created_at,
        status: opp.status
      }))
    ];

    // Sort by timestamp and take top 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = activities.slice(0, 10);

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
} 