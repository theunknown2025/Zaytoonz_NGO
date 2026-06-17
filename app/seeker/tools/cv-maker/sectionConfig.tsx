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

/** CV preview / export theme aligned with CV Maker olive palette */
export const CV_THEME = {
  accent: '#3A4D1F',       // olive-dark
  accentMedium: '#6B8E23', // olive-medium
  accentLight: '#eef0e6',  // olive-100
  accentBorder: '#dde2cd', // olive-200
  text: '#374151',         // gray-700
  textMuted: '#6b7280',    // gray-500
  skillBg: '#eef0e6',
  skillText: '#4f5537',    // olive-800
} as const;
