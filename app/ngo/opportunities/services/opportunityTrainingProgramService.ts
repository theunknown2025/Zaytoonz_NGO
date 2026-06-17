import { supabase } from '@/app/lib/supabase';
import type { TrainingActivity, TrainingDay } from '@/app/lib/opportunityTrainingProgram';

const DAY_COLUMNS = 'id, opportunity_id, day_order, title';
const ACTIVITY_COLUMNS = 'id, training_day_id, activity_order, name, duration, format, icon';

function isMissingTableError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === '42P01' ||
    Boolean(
      error?.message &&
        /opportunity_training_days|opportunity_training_activities/i.test(error.message)
    )
  );
}

function mapActivityRow(row: {
  id: string;
  activity_order: number;
  name: string;
  duration: string | null;
  format: string | null;
  icon: string | null;
}): TrainingActivity {
  return {
    id: row.id,
    name: row.name,
    duration: row.duration || '',
    format: (row.format as TrainingActivity['format']) || '',
    icon: (row.icon as TrainingActivity['icon']) || undefined,
    activityOrder: row.activity_order,
  };
}

function mapDayRow(
  row: { id: string; day_order: number; title: string },
  activities: TrainingActivity[]
): TrainingDay {
  return {
    id: row.id,
    title: row.title,
    dayOrder: row.day_order,
    activities,
  };
}

export async function getTrainingProgram(opportunityId: string): Promise<TrainingDay[]> {
  const { data: dayRows, error: dayError } = await supabase
    .from('opportunity_training_days')
    .select(DAY_COLUMNS)
    .eq('opportunity_id', opportunityId)
    .order('day_order', { ascending: true });

  if (dayError) {
    if (isMissingTableError(dayError)) return [];
    throw dayError;
  }

  if (!dayRows?.length) return [];

  const dayIds = dayRows.map((day) => day.id);
  const { data: activityRows, error: activityError } = await supabase
    .from('opportunity_training_activities')
    .select(ACTIVITY_COLUMNS)
    .in('training_day_id', dayIds)
    .order('activity_order', { ascending: true });

  if (activityError) {
    if (isMissingTableError(activityError)) return [];
    throw activityError;
  }

  const activitiesByDay = new Map<string, TrainingActivity[]>();
  for (const row of activityRows || []) {
    const list = activitiesByDay.get(row.training_day_id) || [];
    list.push(mapActivityRow(row));
    activitiesByDay.set(row.training_day_id, list);
  }

  return dayRows.map((day) => mapDayRow(day, activitiesByDay.get(day.id) || []));
}

export async function saveTrainingProgram(
  opportunityId: string,
  days: TrainingDay[]
): Promise<TrainingDay[]> {
  const { error: deleteError } = await supabase
    .from('opportunity_training_days')
    .delete()
    .eq('opportunity_id', opportunityId);

  if (deleteError) {
    if (isMissingTableError(deleteError)) {
      throw new Error('Training program tables are not set up. Please run the database migration.');
    }
    throw deleteError;
  }

  const validDays = days
    .map((day, dayIndex) => ({
      ...day,
      dayOrder: dayIndex,
      title: day.title.trim() || `Day ${dayIndex + 1}`,
      activities: day.activities
        .filter((activity) => activity.name.trim())
        .map((activity, activityIndex) => ({
          ...activity,
          activityOrder: activityIndex,
        })),
    }))
    .filter((day) => day.activities.length > 0);

  if (validDays.length === 0) return [];

  await supabase
    .from('opportunities')
    .update({ opportunity_type: 'training', updated_at: new Date().toISOString() })
    .eq('id', opportunityId)
    .neq('opportunity_type', 'training');

  const insertedDays: TrainingDay[] = [];

  for (const day of validDays) {
    const { data: insertedDay, error: dayInsertError } = await supabase
      .from('opportunity_training_days')
      .insert({
        opportunity_id: opportunityId,
        day_order: day.dayOrder,
        title: day.title,
      })
      .select(DAY_COLUMNS)
      .single();

    if (dayInsertError) {
      throw new Error(dayInsertError.message || 'Failed to save training day');
    }

    const activityRows = day.activities.map((activity) => ({
      training_day_id: insertedDay.id,
      activity_order: activity.activityOrder,
      name: activity.name.trim(),
      duration: activity.duration.trim() || null,
      format: activity.format || null,
      icon: activity.icon || null,
    }));

    const { data: insertedActivities, error: activityInsertError } = await supabase
      .from('opportunity_training_activities')
      .insert(activityRows)
      .select(ACTIVITY_COLUMNS);

    if (activityInsertError) {
      throw new Error(activityInsertError.message || 'Failed to save training activities');
    }

    insertedDays.push(
      mapDayRow(
        insertedDay,
        (insertedActivities || []).map(mapActivityRow)
      )
    );
  }

  return insertedDays;
}
