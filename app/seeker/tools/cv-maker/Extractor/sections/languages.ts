import type { Language } from '../../types';

const VALID_PROFICIENCY = ['beginner', 'intermediate', 'advanced', 'native'];

export const LANGUAGES_INSTRUCTIONS = `
"languages": [{
  "language": string,
  "proficiency": "" | "beginner" | "intermediate" | "advanced" | "native" (empty unless the source states a level)
}]`;

function normalizeProficiency(value: string): string {
  const lower = value.toLowerCase().trim();
  if (!lower) return '';
  if (lower === 'fluent') return 'native';
  if (VALID_PROFICIENCY.includes(lower)) return lower;
  if (lower.includes('native') || lower.includes('mother') || lower.includes('bilingual') || lower.includes('c2')) {
    return 'native';
  }
  if (lower.includes('fluent')) return 'native';
  if (lower.includes('a1') || lower.includes('a2') || lower.includes('basic') || lower.includes('elementary') || lower.includes('beginner')) {
    return 'beginner';
  }
  if (lower.includes('c1') || lower.includes('advanced') || lower.includes('proficient')) return 'advanced';
  if (lower.includes('b1') || lower.includes('b2') || lower.includes('intermediate') || lower.includes('independent')) {
    return 'intermediate';
  }
  return '';
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
