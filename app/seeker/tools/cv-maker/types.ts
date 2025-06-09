export interface CVData {
  general: GeneralInfo;
  work: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  summary: string;
  certificates: Certificate[];
  projects: Project[];
  volunteering: any[];
  publications: any[];
  references: any[];
  additional: string;
}

export interface GeneralInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  birthDate: string;
  gender: string;
}

export interface WorkExperience {
  id: number;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: number;
  name: string;
  level: string;
}

export interface Language {
  id: number;
  language: string;
  proficiency: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Project {
  id: number;
  title: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  url: string;
}

export interface SavedCV {
  id: number;
  name: string;
  date: string;
  data: CVData;
  sections: string[];
  availableSections: string[];
} 