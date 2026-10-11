import { supabase } from '@/app/lib/supabase';
import {
  isTempQualificationGroupId,
  type QualificationGroup,
} from '@/app/lib/qualificationGroups';

const COLUMNS = 'id, label, color, sort_order';

function mapRow(row: any): QualificationGroup {
  return {
    id: row.id,
    label: row.label,
    color: row.color || 'gray',
    sortOrder: row.sort_order ?? 0,
  };
}

export async function getQualificationGroups(opportunityId: string): Promise<QualificationGroup[]> {
  const { data, error } = await supabase
    .from('opportunity_qualification_groups')
    .select(COLUMNS)
    .eq('opportunity_id', opportunityId)
    .order('sort_order', { ascending: true });

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data || []).map(mapRow);
}

export async function saveQualificationGroups(
  opportunityId: string,
  groups: QualificationGroup[]
): Promise<QualificationGroup[]> {
  const validGroups = groups.filter((g) => g.label.trim());
  const keptIds = validGroups.filter((g) => !isTempQualificationGroupId(g.id)).map((g) => g.id);

  // Delete only removed groups so existing applications stay assigned to renamed groups.
  let deleteQuery = supabase
    .from('opportunity_qualification_groups')
    .delete()
    .eq('opportunity_id', opportunityId);
  if (keptIds.length > 0) {
    deleteQuery = deleteQuery.not('id', 'in', `(${keptIds.join(',')})`);
  }
  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw new Error(deleteError.message || 'Failed to save qualification groups');

  for (let index = 0; index < validGroups.length; index++) {
    const group = validGroups[index];
    const row = {
      opportunity_id: opportunityId,
      label: group.label.trim(),
      color: group.color || 'gray',
      sort_order: index,
      updated_at: new Date().toISOString(),
    };

    const { error } = isTempQualificationGroupId(group.id)
      ? await supabase.from('opportunity_qualification_groups').insert(row)
      : await supabase.from('opportunity_qualification_groups').update(row).eq('id', group.id);

    if (error) throw new Error(error.message || 'Failed to save qualification groups');
  }

  return getQualificationGroups(opportunityId);
}
