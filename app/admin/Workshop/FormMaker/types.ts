export type QuestionType = 'text' | 'email' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'file';

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  sections: Section[];
  published?: boolean;
  is_admin_template?: boolean;
  user_id?: string;
}

export interface FormTemplate {
  id?: string;
  title: string;
  description: string;
  sections: Section[];
  published: boolean;
  is_admin_template: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
} 