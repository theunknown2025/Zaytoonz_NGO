import type { FlowStepIconKey } from '@/app/lib/flowStepIcons';

export type TrainingActivityFormat = 'in_person' | 'hybrid' | 'remote';

export interface TrainingActivity {
  id: string;
  name: string;
  duration: string;
  format: TrainingActivityFormat | '';
  icon?: FlowStepIconKey;
  activityOrder: number;
}

export interface TrainingDay {
  id: string;
  title: string;
  dayOrder: number;
  activities: TrainingActivity[];
}

export const TRAINING_FORMAT_OPTIONS: { value: TrainingActivityFormat; label: string }[] = [
  { value: 'in_person', label: 'In Person' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export function getTrainingFormatLabel(format?: string): string {
  const match = TRAINING_FORMAT_OPTIONS.find((option) => option.value === format);
  return match?.label ?? format ?? '';
}

export function createEmptyTrainingActivity(order: number): TrainingActivity {
  return {
    id: `temp-activity-${Date.now()}-${order}`,
    name: '',
    duration: '',
    format: '',
    icon: 'academic',
    activityOrder: order,
  };
}

export function createEmptyTrainingDay(order: number): TrainingDay {
  return {
    id: `temp-day-${Date.now()}-${order}`,
    title: `Day ${order + 1}`,
    dayOrder: order,
    activities: [createEmptyTrainingActivity(0)],
  };
}
