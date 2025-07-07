export interface FieldMapping {
  id: string;
  name: string;
  selector: string;
  type: 'text' | 'link' | 'image' | 'date';
  required: boolean;
}

export interface ExtractedData {
  items: Record<string, any>[];
  total: number;
  config: {
    id: string;
    name: string;
    url: string;
    fields: FieldMapping[];
    itemSelector: string;
    createdAt: Date;
    updatedAt: Date;
  };
  debug?: {
    pageTitle: string;
    totalElements: number;
    bestSelector: string;
    aiEnabled: boolean;
  };
  aiAnalysis?: {
    confidence: number;
    reasoning: string;
    suggestions: string[];
  };
}

export interface ScrapeConfig {
  id: string;
  name: string;
  url: string;
  fields: FieldMapping[];
  itemSelector: string;
  createdAt: Date;
  updatedAt: Date;
} 