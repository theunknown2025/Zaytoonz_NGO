import type { Language } from '../../types';

const VALID_PROFICIENCY = ['beginner', 'intermediate', 'advanced', 'native', 'fluent'];

export const LANGUAGES_INSTRUCTIONS = `
"languages": [{
  "language": string,
  "proficiency": "beginner" | "intermediate" | "advanced" | "native" | "fluent"
}]`;

function normalizeProficiency(value: string): string {
  const lower = value.toLowerCase().trim();
  if (VALID_PROFICIENCY.includes(lower)) return lower;
  if (lower.includes('native') || lower.includes('mother')) return 'native';
  if (lower.includes('fluent') || lower.includes('bilingual')) return 'fluent';
  if (lower.includes('basic') || lower.includes('elementary')) return 'beginner';
  if (lower.includes('advanced') || lower.includes('professional')) return 'advanced';
  return 'intermediate';
}

export function parseLanguages(raw: unknown): Omit<Language, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const l = item as Record<string, unknown>;
      return {
        language: String(l.language ?? '').trim(),
        proficiency: normalizeProficiency(String(l.proficiency ?? 'intermediate')),
      };
    })
    .filter((l) => l.language.length > 0);
}

export function hasLanguagesContent(languages: Omit<Language, 'id'>[]): boolean {
  return languages.length > 0;
}
