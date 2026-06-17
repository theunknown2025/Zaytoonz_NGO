import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

function mapStepRow(row: any) {
  const form = Array.isArray(row.forms_templates) ? row.forms_templates[0] : row.forms_templates;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    deadline: row.deadline || '',
    formId: row.form_id || '',
    formTitle: form?.title || '',
    stepOrder: row.step_order,
  };
}

type ProcessStep = ReturnType<typeof mapStepRow>;

type ProcessStateError = { error: string; status: number };
type ProcessStateSuccess = {
  application: {
    id: string;
    opportunityId: string;
    currentStepIndex: number;
    processStatus: string;
    status: string;
  };
  steps: ProcessStep[];
  submissions: Record<string, { formId?: string; submissionData: unknown; submittedAt: string }>;
  navigableStepIndices: number[];
};

async function buildProcessState(
  supabase: ReturnType<typeof getSupabaseClient>,
  applicationId: string
): Promise<ProcessStateError | ProcessStateSuccess> {
  const { data: application, error: appError } = await supabase
    .from('opportunity_applications')
    .select('id, opportunity_id, current_step_index, process_status, status')
    .eq('id', applicationId)
    .single();

  if (appError || !application) {
    return { error: 'Application not found', status: 404 };
  }

  const { data: steps, error: stepsError } = await supabase
    .from('opportunity_flow_steps')
    .select(`
      id,
      name,
      description,
      deadline,
      form_id,
      step_order,
      forms_templates ( id, title, sections )
    `)
    .eq('opportunity_id', application.opportunity_id)
    .order('step_order', { ascending: true });

  if (stepsError && stepsError.code !== '42P01') {
    return { error: stepsError.message, status: 500 };
  }

  const flowSteps = (steps || []).map(mapStepRow);
  const currentStepIndex = application.current_step_index ?? 0;
  const processStatus = application.process_status || 'in_progress';

  const { data: submissions } = await supabase
    .from('application_step_submissions')
    .select('flow_step_id, form_id, submission_data, submitted_at')
    .eq('application_id', applicationId);

  const submissionMap: Record<string, any> = {};
  (submissions || []).forEach((s: any) => {
    submissionMap[s.flow_step_id] = {
      formId: s.form_id,
      submissionData: s.submission_data,
      submittedAt: s.submitted_at,
    };
  });

  const navigableStepIndices = Array.from(
    { length: Math.min(currentStepIndex + 1, flowSteps.length) },
    (_, i) => i
  );

  return {
    application: {
      id: application.id,
      opportunityId: application.opportunity_id,
      currentStepIndex,
      processStatus,
      status: application.status,
    },
    steps: flowSteps,
    submissions: submissionMap,
    navigableStepIndices,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const result = await buildProcessState(supabase, params.id);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET application process error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action, submissionData, notes } = body;

    const state = await buildProcessState(supabase, params.id);
    if ('error' in state) {
      return NextResponse.json({ error: state.error }, { status: state.status || 500 });
    }

    const { application, steps, submissions } = state;
    const currentStep = steps[application.currentStepIndex];

    if (action === 'submit_step_form') {
      if (!currentStep?.formId) {
        return NextResponse.json({ error: 'Current step has no form' }, { status: 400 });
      }
      if (submissions[currentStep.id]) {
        return NextResponse.json({ error: 'Form already submitted for this step' }, { status: 409 });
      }
      if (!submissionData) {
        return NextResponse.json({ error: 'Missing submission data' }, { status: 400 });
      }

      const { error } = await supabase.from('application_step_submissions').insert({
        application_id: params.id,
        flow_step_id: currentStep.id,
        form_id: currentStep.formId,
        submission_data: submissionData,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const updated = await buildProcessState(supabase, params.id);
      return NextResponse.json(updated);
    }

    if (action === 'advance_step') {
      if (!currentStep) {
        return NextResponse.json({ error: 'No active process step' }, { status: 400 });
      }
      if (application.processStatus === 'rejected' || application.processStatus === 'completed') {
        return NextResponse.json({ error: 'Application process is already finalized' }, { status: 400 });
      }
      if (currentStep.formId && !submissions[currentStep.id]) {
        return NextResponse.json(
          { error: 'Applicant must submit the step form before advancing' },
          { status: 400 }
        );
      }

      const nextIndex = application.currentStepIndex + 1;
      const isComplete = nextIndex >= steps.length;

      const { error } = await supabase
        .from('opportunity_applications')
        .update({
          current_step_index: isComplete ? application.currentStepIndex : nextIndex,
          process_status: isComplete ? 'completed' : 'in_progress',
          status: isComplete ? 'approved' : application.status,
          notes: notes || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const updated = await buildProcessState(supabase, params.id);
      return NextResponse.json(updated);
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('opportunity_applications')
        .update({
          process_status: 'rejected',
          status: 'rejected',
          notes: notes || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const updated = await buildProcessState(supabase, params.id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST application process error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
