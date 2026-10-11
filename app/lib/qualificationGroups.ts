export interface QualificationGroup {
  id: string;
  label: string;
  color: string;
  sortOrder: number;
}

export const QUALIFICATION_GROUP_COLORS = [
  'green',
  'amber',
  'gray',
  'blue',
  'purple',
  'red',
  'teal',
  'pink',
] as const;

export type QualificationGroupColor = (typeof QUALIFICATION_GROUP_COLORS)[number];

export const QUALIFICATION_GROUP_COLOR_CLASSES: Record<
  string,
  { badge: string; button: string; active: string; dot: string }
> = {
  green: { badge: 'bg-green-100 text-green-800', button: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200', active: 'bg-green-600 text-white border-green-600', dot: 'bg-green-500' },
  amber: { badge: 'bg-amber-100 text-amber-800', button: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200', active: 'bg-amber-500 text-white border-amber-500', dot: 'bg-amber-500' },
  gray: { badge: 'bg-gray-100 text-gray-800', button: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200', active: 'bg-gray-600 text-white border-gray-600', dot: 'bg-gray-500' },
  blue: { badge: 'bg-blue-100 text-blue-800', button: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200', active: 'bg-blue-600 text-white border-blue-600', dot: 'bg-blue-500' },
  purple: { badge: 'bg-purple-100 text-purple-800', button: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200', active: 'bg-purple-600 text-white border-purple-600', dot: 'bg-purple-500' },
  red: { badge: 'bg-red-100 text-red-800', button: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200', active: 'bg-red-600 text-white border-red-600', dot: 'bg-red-500' },
  teal: { badge: 'bg-teal-100 text-teal-800', button: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200', active: 'bg-teal-600 text-white border-teal-600', dot: 'bg-teal-500' },
  pink: { badge: 'bg-pink-100 text-pink-800', button: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200', active: 'bg-pink-600 text-white border-pink-600', dot: 'bg-pink-500' },
};

export function getQualificationGroupColorClasses(color?: string | null) {
  return QUALIFICATION_GROUP_COLOR_CLASSES[color || 'gray'] || QUALIFICATION_GROUP_COLOR_CLASSES.gray;
}

export function isTempQualificationGroupId(id: string) {
  return id.startsWith('temp-');
}

export function createDefaultQualificationGroups(): QualificationGroup[] {
  const now = Date.now();
  return [
    { id: `temp-${now}-0`, label: 'Shortlisted', color: 'green', sortOrder: 0 },
    { id: `temp-${now}-1`, label: 'Waiting list', color: 'amber', sortOrder: 1 },
    { id: `temp-${now}-2`, label: 'Pending', color: 'gray', sortOrder: 2 },
  ];
}
