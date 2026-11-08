import type { Skill } from '../../types';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export const SKILLS_INSTRUCTIONS = `
"skills": [{
  "name": string,
  "level": "" | "beginner" | "intermediate" | "advanced" | "expert" (empty unless the source states a level)
}]`;

function normalizeLevel(level: string): string {
  const lower = level.toLowerCase().trim();
  if (!lower) return '';
  if (VALID_LEVELS.includes(lower)) return lower;
  if (['basic', 'novice', 'entry', 'beginner'].some((k) => lower.includes(k))) return 'beginner';
  if (['intermediate', 'proficient', 'medium', 'good'].some((k) => lower.includes(k))) return 'intermediate';
  if (['advanced', 'senior', 'strong', 'high', 'professional'].some((k) => lower.includes(k))) return 'advanced';
  if (['expert', 'master'].some((k) => lower.includes(k))) return 'expert';
  return '';
}

export function parseSkills(raw: unknown): Omit<Skill, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const s = item as Record<string, unknown>;
      return {
        name: String(s.name ?? '').trim(),
        level: normalizeLevel(String(s.level ?? 'intermediate')),
      };
    })
    .filter((s) => s.name.length > 0);
}

export function hasSkillsContent(skills: Omit<Skill, 'id'>[]): boolean {
  return skills.length > 0;
}
