import type { FlowStepIconKey } from '@/app/lib/flowStepIconKeys';
import { DEFAULT_FLOW_STEP_ICON } from '@/app/lib/flowStepIconKeys';

export interface OpportunityActionButton {
  id: string;
  title: string;
  linkUrl: string;
  icon?: FlowStepIconKey;
  iconUrl?: string;
  buttonOrder: number;
}

export function createEmptyActionButton(order: number): OpportunityActionButton {
  return {
    id: `temp-action-${Date.now()}-${order}`,
    title: '',
    linkUrl: '',
    icon: DEFAULT_FLOW_STEP_ICON,
    buttonOrder: order,
  };
}

export function isValidActionButtonUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeActionButtonUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
