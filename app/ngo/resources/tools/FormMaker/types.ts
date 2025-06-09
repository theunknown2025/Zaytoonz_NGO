export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'link' | 'file';

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
} 