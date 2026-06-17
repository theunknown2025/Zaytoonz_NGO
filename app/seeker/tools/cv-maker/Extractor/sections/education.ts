import type { Education } from '../../types';

export const EDUCATION_INSTRUCTIONS = `
"education": [{
  "degree": string,
  "institution": string,
  "location": string,
  "startDate": string (YYYY-MM or YYYY-MM-DD),
  "endDate": string (YYYY-MM or YYYY-MM-DD),
  "description": string
}]`;

export function parseEducation(raw: unknown): Omit<Education, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const e = item as Record<string, unknown>;
      return {
        degree: String(e.degree ?? '').trim(),
        institution: String(e.institution ?? '').trim(),
        location: String(e.location ?? '').trim(),
        startDate: String(e.startDate ?? '').trim(),
        endDate: String(e.endDate ?? '').trim(),
        description: String(e.description ?? '').trim(),
      };
    })
    .filter((e) => e.degree || e.institution || e.description);
}

export function hasEducationContent(education: Omit<Education, 'id'>[]): boolean {
  return education.length > 0;
}
