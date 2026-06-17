import type {
  GeneralInfo,
  WorkExperience,
  Education,
  Skill,
  Language,
  Certificate,
  Project,
  ExternalLink,
} from '../types';

/** Raw extracted data from OpenAI (no numeric ids). */
export interface ExtractedCV {
  general: Omit<GeneralInfo, never>;
  work: Omit<WorkExperience, 'id'>[];
  education: Omit<Education, 'id'>[];
  skills: Omit<Skill, 'id'>[];
  languages: Omit<Language, 'id'>[];
  summary: string;
  certificates: Omit<Certificate, 'id'>[];
  projects: Omit<Project, 'id'>[];
  additional: string;
  externalLinks: Omit<ExternalLink, 'id'>[];
}

export interface ExtractionResult {
  data: ExtractedCV;
  /** Section keys that contain meaningful content and should be activated. */
  activeSections: string[];
}
