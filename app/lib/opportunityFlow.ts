export interface OpportunityFlowStep {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  formId?: string;
  formTitle?: string;
  stepOrder: number;
  icon?: string;
}

export interface ApplicationProcessState {
  steps: OpportunityFlowStep[];
  currentStepIndex: number;
  processStatus: string;
  submissions: Record<string, { formId?: string; submissionData: Record<string, unknown>; submittedAt: string }>;
  navigableStepIndices: number[];
}

export function getStepStatus(
  stepIndex: number,
  currentStepIndex: number,
  processStatus: string,
  hasForm: boolean,
  hasSubmission: boolean
): 'completed' | 'current' | 'locked' | 'rejected' | 'awaiting_form' {
  if (processStatus === 'rejected' && stepIndex === currentStepIndex) return 'rejected';
  if (stepIndex < currentStepIndex) return 'completed';
  if (stepIndex > currentStepIndex) return 'locked';
  if (hasForm && !hasSubmission) return 'awaiting_form';
  return 'current';
}
