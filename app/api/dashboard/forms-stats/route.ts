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
    const { data: forms, error } = await supabase
      .from('forms_templates')
      .select('id, published, status, created_at');

    if (error) {
      throw error;
    }

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total_forms: forms.length,
      published_forms: forms.filter(form => form.published === true).length,
      draft_forms: forms.filter(form => form.status === 'draft').length,
      recent_forms: forms.filter(form => new Date(form.created_at) >= oneMonthAgo).length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching forms stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms statistics' },
      { status: 500 }
    );
  }
} 