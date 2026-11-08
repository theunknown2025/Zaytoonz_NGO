import type { WorkExperience } from '../../types';
import { textWithLineBreaks } from '../preserveLineBreaks';

export const WORK_INSTRUCTIONS = `
"work": [{
  "position": string,
  "company": string,
  "location": string,
  "startDate": string (YYYY-MM or YYYY-MM-DD),
  "endDate": string (YYYY-MM or YYYY-MM-DD, empty if current),
  "current": boolean,
  "description": string (copy the original responsibilities and bullets verbatim, one bullet per line)
}]`;

export function parseWork(raw: unknown): Omit<WorkExperience, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const w = item as Record<string, unknown>;
      return {
        position: String(w.position ?? '').trim(),
        company: String(w.company ?? '').trim(),
        location: String(w.location ?? '').trim(),
        startDate: String(w.startDate ?? '').trim(),
        endDate: String(w.endDate ?? '').trim(),
        current: Boolean(w.current),
        description: textWithLineBreaks(w.description),
      };
    })
    .filter((w) => w.position || w.company || w.description);
}

export function hasWorkContent(work: Omit<WorkExperience, 'id'>[]): boolean {
  return work.length > 0;
}
