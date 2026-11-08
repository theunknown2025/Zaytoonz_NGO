import React from 'react';
import {
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  TrophyIcon,
  FolderIcon,
  HeartIcon,
  NewspaperIcon,
  UserGroupIcon,
  InformationCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

export const SECTION_TITLES: Record<string, string> = {
  general: 'Personal Information',
  work: 'Work Experience',
  education: 'Education and Training',
  skills: 'Skills',
  languages: 'Language Skills',
  summary: 'Profile Summary',
  certificates: 'Certificates & Courses',
  projects: 'Projects',
  volunteering: 'Volunteering Experience',
  publications: 'Publications',
  references: 'References',
  additional: 'Additional Information',
  externalLinks: 'External Profiles',
};

export const getSectionTitle = (section: string) =>
  SECTION_TITLES[section] || section;

const SECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  general: UserIcon,
  work: BriefcaseIcon,
  education: AcademicCapIcon,
  skills: CheckIcon,
  languages: GlobeAltIcon,
  summary: DocumentTextIcon,
  certificates: TrophyIcon,
  projects: FolderIcon,
  volunteering: HeartIcon,
  publications: NewspaperIcon,
  references: UserGroupIcon,
  additional: InformationCircleIcon,
  externalLinks: LinkIcon,
};

export const getSectionIcon = (section: string, className = 'w-4 h-4') => {
  const Icon = SECTION_ICON_MAP[section] || DocumentTextIcon;
  return <Icon className={className} />;
};

export const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { value: 'github', label: 'GitHub', icon: '💻' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'portfolio', label: 'Portfolio', icon: '🎨' },
  { value: 'blog', label: 'Blog', icon: '📝' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'other', label: 'Other', icon: '🔗' },
] as const;

export const getPlatformIcon = (platform: string) =>
  PLATFORM_OPTIONS.find((o) => o.value === platform)?.icon || '🔗';

export const getPlatformLabel = (platform: string) =>
  PLATFORM_OPTIONS.find((o) => o.value === platform)?.label || 'Other';

export type CvPaletteId = 'green' | 'blue' | 'red' | 'black' | 'brown';

export interface CvTheme {
  id: CvPaletteId;
  label: string;
  accent: string;
  accentMedium: string;
  accentLight: string;
  accentBorder: string;
  text: string;
  textMuted: string;
  skillBg: string;
  skillText: string;
  swatch: string;
}

/** Five CV layout palettes. Green matches the original olive theme. */
export const CV_PALETTES: CvTheme[] = [
  {
    id: 'green',
    label: 'Green (Default)',
    accent: '#3A4D1F',
    accentMedium: '#6B8E23',
    accentLight: '#eef0e6',
    accentBorder: '#dde2cd',
    text: '#374151',
    textMuted: '#6b7280',
    skillBg: '#eef0e6',
    skillText: '#4f5537',
    swatch: '#3A4D1F',
  },
  {
    id: 'blue',
    label: 'Blue',
    accent: '#1e3a5f',
    accentMedium: '#2563eb',
    accentLight: '#e8f1fb',
    accentBorder: '#c5d7f2',
    text: '#1e293b',
    textMuted: '#5b6b7c',
    skillBg: '#e8f1fb',
    skillText: '#1e3a5f',
    swatch: '#2563eb',
  },
  {
    id: 'red',
    label: 'Red',
    accent: '#7f1d1d',
    accentMedium: '#dc2626',
    accentLight: '#fdecec',
    accentBorder: '#f3c7c7',
    text: '#3f1d1d',
    textMuted: '#7c5c5c',
    skillBg: '#fdecec',
    skillText: '#7f1d1d',
    swatch: '#dc2626',
  },
  {
    id: 'black',
    label: 'Black',
    accent: '#111827',
    accentMedium: '#374151',
    accentLight: '#f3f4f6',
    accentBorder: '#d1d5db',
    text: '#111827',
    textMuted: '#6b7280',
    skillBg: '#f3f4f6',
    skillText: '#111827',
    swatch: '#111827',
  },
  {
    id: 'brown',
    label: 'Brown',
    accent: '#5c3a21',
    accentMedium: '#8b5e34',
    accentLight: '#f6efe6',
    accentBorder: '#e4d3c0',
    text: '#3f2a1d',
    textMuted: '#7a6556',
    skillBg: '#f6efe6',
    skillText: '#5c3a21',
    swatch: '#8b5e34',
  },
];

export const CV_THEME = CV_PALETTES[0];

export function getCvTheme(id?: string | null): CvTheme {
  return CV_PALETTES.find((palette) => palette.id === id) ?? CV_PALETTES[0];
}
