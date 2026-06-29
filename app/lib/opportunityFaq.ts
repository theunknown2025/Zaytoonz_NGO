import type { FlowStepIconKey } from '@/app/lib/flowStepIconKeys';
import { DEFAULT_FLOW_STEP_ICON } from '@/app/lib/flowStepIconKeys';

export interface OpportunityFaqItem {
  id: string;
  question: string;
  answer: string;
  icon?: FlowStepIconKey;
  faqOrder: number;
}

export function createEmptyFaqItem(order: number): OpportunityFaqItem {
  return {
    id: `temp-faq-${Date.now()}-${order}`,
    question: '',
    answer: '',
    icon: DEFAULT_FLOW_STEP_ICON,
    faqOrder: order,
  };
}
