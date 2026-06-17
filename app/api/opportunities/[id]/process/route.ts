import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FLOW_STEP_COLUMNS = 'id, name, description, deadline, step_order, icon';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

function mapStepRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    deadline: row.deadline || '',
    formId: '',
    formTitle: '',
    stepOrder: row.step_order,
    icon: row.icon || undefined,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('opportunity_flow_steps')
      .select(FLOW_STEP_COLUMNS)
      .eq('opportunity_id', params.id)
      .order('step_order', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ steps: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ steps: (data || []).map(mapStepRow) });
  } catch (error) {
    console.error('GET process error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const steps: Array<{
      id?: string;
      name: string;
      description?: string;
      deadline?: string;
      icon?: string;
    }> = body.steps || [];

    const { error: deleteError } = await supabase
      .from('opportunity_flow_steps')
      .delete()
      .eq('opportunity_id', params.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (steps.length === 0) {
      return NextResponse.json({ steps: [] });
    }

    const rows = steps.map((step, index) => ({
      opportunity_id: params.id,
      name: step.name.trim(),
      description: step.description?.trim() || null,
      deadline: step.deadline || null,
      step_order: index,
      icon: step.icon || null,
    }));

    const { data, error } = await supabase
      .from('opportunity_flow_steps')
      .insert(rows)
      .select(FLOW_STEP_COLUMNS);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ steps: (data || []).map(mapStepRow) });
  } catch (error) {
    console.error('PUT process error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
