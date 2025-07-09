export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scale: 'numeric' | 'rating' | 'boolean' | 'text';
  maxScore?: number;
  options?: string[];
}

export interface EvaluationTemplate {
  id?: string;
  title: string;
  description: string;
  type: 'volunteer' | 'project' | 'event' | 'program';
  criteria: EvaluationCriteria[];
  status: 'draft' | 'active' | 'completed';
  published?: boolean;
  is_admin_template?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  responses?: number;
  averageScore?: number;
}

export interface NewCriteria {
  name: string;
  description: string;
  weight: number;
  scale: 'numeric' | 'rating' | 'boolean' | 'text';
  maxScore?: number;
  options?: string[];
} 