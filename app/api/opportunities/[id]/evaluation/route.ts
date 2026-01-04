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

// GET /api/opportunities/[id]/evaluation - Get evaluation template for an opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const opportunityId = params.id;
    
    // Query the database for the evaluation template linked to this opportunity
    const { data: opportunityEvaluation, error } = await supabase
      .from('opportunity_evaluations')
      .select(`
        id,
        evaluation_template:evaluation_template_id (
          id,
          name,
          description,
          scale,
          criteria,
          created_at,
          updated_at
        )
      `)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    if (opportunityEvaluation?.evaluation_template) {
      return NextResponse.json({ 
        opportunityId,
        evaluationTemplate: opportunityEvaluation.evaluation_template,
        message: 'Evaluation template found'
      });
    } else {
      return NextResponse.json({ 
        opportunityId,
        evaluationTemplate: null,
        message: 'No evaluation template found for this opportunity'
      });
    }
    
  } catch (error) {
    console.error('Error fetching opportunity evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity evaluation' },
      { status: 500 }
    );
  }
}

// POST /api/opportunities/[id]/evaluation - Link evaluation template to opportunity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const opportunityId = params.id;
    const body = await request.json();
    const { evaluationId } = body;

    if (!evaluationId) {
      return NextResponse.json(
        { error: 'evaluationId is required' },
        { status: 400 }
      );
    }

    // First, verify that the evaluation template exists
    const { data: template, error: templateError } = await supabase
      .from('evaluation_templates')
      .select('id, name')
      .eq('id', evaluationId)
      .maybeSingle();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Evaluation template not found' },
        { status: 404 }
      );
    }

    // Insert or update the opportunity evaluation link
    const { data, error } = await supabase
      .from('opportunity_evaluations')
      .upsert({
        opportunity_id: opportunityId,
        evaluation_template_id: evaluationId,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'opportunity_id,evaluation_template_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save evaluation choice to database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      opportunityId,
      evaluationId,
      evaluationName: template.name,
      message: 'Evaluation template linked to opportunity successfully',
      data
    });
    
  } catch (error) {
    console.error('Error linking evaluation to opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to link evaluation to opportunity' },
      { status: 500 }
    );
  }
} 