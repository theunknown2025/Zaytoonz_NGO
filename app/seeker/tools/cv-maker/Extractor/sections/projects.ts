import type { Project } from '../../types';

export const PROJECTS_INSTRUCTIONS = `
"projects": [{
  "title": string,
  "role": string,
  "startDate": string (YYYY-MM or YYYY-MM-DD),
  "endDate": string (YYYY-MM or YYYY-MM-DD),
  "description": string,
  "url": string
}]`;

export function parseProjects(raw: unknown): Omit<Project, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const p = item as Record<string, unknown>;
      return {
        title: String(p.title ?? '').trim(),
        role: String(p.role ?? '').trim(),
        startDate: String(p.startDate ?? '').trim(),
        endDate: String(p.endDate ?? '').trim(),
        description: String(p.description ?? '').trim(),
        url: String(p.url ?? '').trim(),
      };
    })
    .filter((p) => p.title || p.description);
}

export function hasProjectsContent(projects: Omit<Project, 'id'>[]): boolean {
  return projects.length > 0;
}
