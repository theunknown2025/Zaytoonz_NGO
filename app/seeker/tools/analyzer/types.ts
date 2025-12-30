export interface JobRequirement {
  category: string;
  keywords: string[];
  score: number;
  maxScore: number;
  description?: string;
  feedback?: string;
}

export interface ComparisonResult {
  requirements: JobRequirement[];
  overallScore: number;
  maxScore: number;
  generalFeedback?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
}

export type InputMethod = 'upload' | 'paste';

export interface TextContent {
  text: string;
  source: InputMethod;
  fileName?: string;
}

export interface JobAnalysis {
  sections: string[];
  description: string;
}



























