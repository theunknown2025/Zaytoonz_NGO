import { supabase } from '@/app/lib/supabase';
import type { OpportunityActionButton } from '@/app/lib/opportunityActionButtons';

const ACTION_BUTTON_COLUMNS =
  'id, opportunity_id, button_order, title, icon, icon_url, link_url';

function isMissingTableError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === '42P01' ||
    Boolean(error?.message && /opportunity_action_buttons/i.test(error.message))
  );
}

function mapActionButtonRow(row: {
  id: string;
  button_order: number;
  title: string;
  icon: string | null;
  icon_url: string | null;
  link_url: string;
}): OpportunityActionButton {
  return {
    id: row.id,
    title: row.title,
    linkUrl: row.link_url,
    icon: (row.icon as OpportunityActionButton['icon']) || undefined,
    iconUrl: row.icon_url || undefined,
    buttonOrder: row.button_order,
  };
}

export async function getOpportunityActionButtons(
  opportunityId: string
): Promise<OpportunityActionButton[]> {
  const { data, error } = await supabase
    .from('opportunity_action_buttons')
    .select(ACTION_BUTTON_COLUMNS)
    .eq('opportunity_id', opportunityId)
    .order('button_order', { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data || []).map(mapActionButtonRow);
}

export async function saveOpportunityActionButtons(
  opportunityId: string,
  buttons: OpportunityActionButton[]
): Promise<OpportunityActionButton[]> {
  const { error: deleteError } = await supabase
    .from('opportunity_action_buttons')
    .delete()
    .eq('opportunity_id', opportunityId);

  if (deleteError) {
    if (isMissingTableError(deleteError)) {
      throw new Error('Action buttons table is not set up. Please run the database migration.');
    }
    throw deleteError;
  }

  const validButtons = buttons
    .filter((button) => button.title.trim() && button.linkUrl.trim())
    .map((button, index) => ({
      ...button,
      buttonOrder: index,
    }));

  if (validButtons.length === 0) return [];

  const rows = validButtons.map((button) => ({
    opportunity_id: opportunityId,
    button_order: button.buttonOrder,
    title: button.title.trim(),
    link_url: button.linkUrl.trim(),
    icon: button.icon || null,
    icon_url: button.iconUrl || null,
  }));

  const { data, error } = await supabase
    .from('opportunity_action_buttons')
    .insert(rows)
    .select(ACTION_BUTTON_COLUMNS);

  if (error) {
    throw new Error(error.message || 'Failed to save action buttons');
  }

  return (data || []).map(mapActionButtonRow);
}
