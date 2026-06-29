export type FlowStepIconKey =
  | 'flag'
  | 'calendar'
  | 'document'
  | 'clipboard'
  | 'envelope'
  | 'users'
  | 'clock'
  | 'star'
  | 'chat'
  | 'pencil'
  | 'building'
  | 'badge'
  | 'academic';

export const DEFAULT_FLOW_STEP_ICON: FlowStepIconKey = 'flag';

export const FLOW_STEP_ICON_KEYS: FlowStepIconKey[] = [
  'flag',
  'calendar',
  'document',
  'clipboard',
  'envelope',
  'users',
  'clock',
  'star',
  'chat',
  'pencil',
  'building',
  'badge',
  'academic',
];

const ICON_KEY_SET = new Set<string>(FLOW_STEP_ICON_KEYS);

export function isFlowStepIconKey(value: string | undefined): value is FlowStepIconKey {
  return Boolean(value && ICON_KEY_SET.has(value));
}

export function resolveFlowStepIcon(icon?: string): FlowStepIconKey {
  return isFlowStepIconKey(icon) ? icon : DEFAULT_FLOW_STEP_ICON;
}
