import type { CVData } from '../types';
import type { ExtractionResult } from './types';

function withIds<T extends object>(items: T[]): (T & { id: number })[] {
  return items.map((item, index) => ({ ...item, id: Date.now() + index }));
}

function defaultWorkEntry() {
  return {
    id: 1,
    position: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  };
}

function defaultEducationEntry() {
  return {
    id: 1,
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

function defaultSkillEntry() {
  return { id: 1, name: '', level: 'intermediate' };
}

function defaultLanguageEntry() {
  return { id: 1, language: '', proficiency: 'intermediate' };
}

function defaultCertificateEntry() {
  return { id: 1, name: '', issuer: '', date: '', description: '' };
}

function defaultProjectEntry() {
  return {
    id: 1,
    title: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    url: '',
  };
}

const ALL_OPTIONAL_SECTIONS = [
  'skills',
  'languages',
  'summary',
  'certificates',
  'projects',
  'volunteering',
  'publications',
  'references',
  'additional',
  'externalLinks',
] as const;

export function toCvData(result: ExtractionResult): {
  cvData: CVData;
  addedSections: string[];
  availableSections: string[];
} {
  const { data, activeSections } = result;
  const extracted = data;

  const cvData: CVData = {
    general: extracted.general,
    work: extracted.work.length > 0 ? withIds(extracted.work) : [defaultWorkEntry()],
    education:
      extracted.education.length > 0 ? withIds(extracted.education) : [defaultEducationEntry()],
    skills: extracted.skills.length > 0 ? withIds(extracted.skills) : [defaultSkillEntry()],
    languages:
      extracted.languages.length > 0 ? withIds(extracted.languages) : [defaultLanguageEntry()],
    summary: extracted.summary,
    certificates:
      extracted.certificates.length > 0
        ? withIds(extracted.certificates)
        : [defaultCertificateEntry()],
    projects:
      extracted.projects.length > 0 ? withIds(extracted.projects) : [defaultProjectEntry()],
    volunteering: [],
    publications: [],
    references: [],
    additional: extracted.additional,
    externalLinks:
      extracted.externalLinks.length > 0 ? withIds(extracted.externalLinks) : [],
  };

  const addedSections = [...activeSections];
  const availableSections = ALL_OPTIONAL_SECTIONS.filter(
    (section) => !addedSections.includes(section)
  );

  return {
    cvData,
    addedSections,
    availableSections: [...availableSections],
  };
}
