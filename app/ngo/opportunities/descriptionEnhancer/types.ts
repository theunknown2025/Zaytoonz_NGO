export type OpportunityTypeLabel = 'job' | 'funding' | 'training' | '';

export interface EnhanceDescriptionInput {
  text: string;
  title?: string;
  opportunityType?: OpportunityTypeLabel;
}

export interface EnhanceDescriptionResult {
  enhanced: string;
}
