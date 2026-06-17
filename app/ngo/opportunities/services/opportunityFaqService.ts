import { supabase } from '@/app/lib/supabase';
import type { OpportunityFaqItem } from '@/app/lib/opportunityFaq';

const FAQ_COLUMNS = 'id, opportunity_id, faq_order, question, answer, icon';

function isMissingTableError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === '42P01' ||
    Boolean(error?.message && /opportunity_faq_items/i.test(error.message))
  );
}

function mapFaqRow(row: {
  id: string;
  faq_order: number;
  question: string;
  answer: string;
  icon: string | null;
}): OpportunityFaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    icon: (row.icon as OpportunityFaqItem['icon']) || undefined,
    faqOrder: row.faq_order,
  };
}

export async function getOpportunityFaqItems(opportunityId: string): Promise<OpportunityFaqItem[]> {
  const { data, error } = await supabase
    .from('opportunity_faq_items')
    .select(FAQ_COLUMNS)
    .eq('opportunity_id', opportunityId)
    .order('faq_order', { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data || []).map(mapFaqRow);
}

export async function saveOpportunityFaqItems(
  opportunityId: string,
  items: OpportunityFaqItem[]
): Promise<OpportunityFaqItem[]> {
  const { error: deleteError } = await supabase
    .from('opportunity_faq_items')
    .delete()
    .eq('opportunity_id', opportunityId);

  if (deleteError) {
    if (isMissingTableError(deleteError)) {
      throw new Error('FAQ table is not set up. Please run the database migration.');
    }
    throw deleteError;
  }

  const validItems = items
    .filter((item) => item.question.trim() && item.answer.trim())
    .map((item, index) => ({
      ...item,
      faqOrder: index,
    }));

  if (validItems.length === 0) return [];

  const rows = validItems.map((item) => ({
    opportunity_id: opportunityId,
    faq_order: item.faqOrder,
    question: item.question.trim(),
    answer: item.answer.trim(),
    icon: item.icon || null,
  }));

  const { data, error } = await supabase
    .from('opportunity_faq_items')
    .insert(rows)
    .select(FAQ_COLUMNS);

  if (error) {
    throw new Error(error.message || 'Failed to save FAQ items');
  }

  return (data || []).map(mapFaqRow);
}
