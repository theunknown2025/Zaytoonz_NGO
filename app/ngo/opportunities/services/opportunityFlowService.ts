import { supabase } from '@/app/lib/supabase';
import type { OpportunityFlowStep } from '@/app/lib/opportunityFlow';

const FLOW_STEP_COLUMNS = 'id, name, description, deadline, step_order, icon';

function mapFlowStepRow(row: any): OpportunityFlowStep {
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

function isMissingIconColumnError(error: { message?: string } | null) {
  return Boolean(error?.message && /column.*icon|icon.*column/i.test(error.message));
}

function isMissingTableError(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || Boolean(error?.message && /opportunity_flow_steps/i.test(error.message));
}

export async function getOpportunityFlowSteps(opportunityId: string): Promise<OpportunityFlowStep[]> {
  let data: Record<string, unknown>[] | null = null;
  let error: { code?: string; message?: string } | null = null;

  const withIcon = await supabase
    .from('opportunity_flow_steps')
    .select(FLOW_STEP_COLUMNS)
    .eq('opportunity_id', opportunityId)
    .order('step_order', { ascending: true });
  data = withIcon.data;
  error = withIcon.error;

  if (error && isMissingIconColumnError(error)) {
    const fallback = await supabase
      .from('opportunity_flow_steps')
      .select('id, name, description, deadline, step_order')
      .eq('opportunity_id', opportunityId)
      .order('step_order', { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data || []).map(mapFlowStepRow);
}

export async function saveOpportunityFlowSteps(
  opportunityId: string,
  steps: OpportunityFlowStep[]
): Promise<OpportunityFlowStep[]> {
  const { error: deleteError } = await supabase
    .from('opportunity_flow_steps')
    .delete()
    .eq('opportunity_id', opportunityId);

  if (deleteError) {
    if (isMissingTableError(deleteError)) {
      throw new Error('Process steps table is not set up. Please run the database migration.');
    }
    throw deleteError;
  }

  if (steps.length === 0) return [];

  // Omit id so Postgres generates UUIDs — `id: undefined` becomes null in bulk inserts.
  const rowsWithIcon = steps.map((step, index) => ({
    opportunity_id: opportunityId,
    name: step.name.trim(),
    description: step.description?.trim() || null,
    deadline: step.deadline || null,
    step_order: index,
    icon: step.icon || null,
  }));

  let { data, error } = await supabase
    .from('opportunity_flow_steps')
    .insert(rowsWithIcon)
    .select(FLOW_STEP_COLUMNS);

  if (error && isMissingIconColumnError(error)) {
    const rowsWithoutIcon = rowsWithIcon.map(({ icon: _icon, ...row }) => row);
    ({ data, error } = await supabase
      .from('opportunity_flow_steps')
      .insert(rowsWithoutIcon)
      .select('id, name, description, deadline, step_order'));
  }

  if (error) {
    throw new Error(error.message || 'Failed to save process steps');
  }

  return (data || []).map(mapFlowStepRow);
}
