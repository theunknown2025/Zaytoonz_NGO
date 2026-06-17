import type { Skill } from '../../types';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export const SKILLS_INSTRUCTIONS = `
"skills": [{
  "name": string,
  "level": "beginner" | "intermediate" | "advanced" | "expert"
}]`;

function normalizeLevel(level: string): string {
  const lower = level.toLowerCase().trim();
  if (VALID_LEVELS.includes(lower)) return lower;
  if (['basic', 'novice', 'entry'].some((k) => lower.includes(k))) return 'beginner';
  if (['proficient', 'good', 'medium'].some((k) => lower.includes(k))) return 'intermediate';
  if (['senior', 'strong', 'high'].some((k) => lower.includes(k))) return 'advanced';
  if (['master', 'native', 'expert'].some((k) => lower.includes(k))) return 'expert';
  return 'intermediate';
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
