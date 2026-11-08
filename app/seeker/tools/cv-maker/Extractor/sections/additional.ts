import { textWithLineBreaks } from '../preserveLineBreaks';

export const ADDITIONAL_INSTRUCTIONS = `
"additional": string (copy leftover source text verbatim; do not summarize or rewrite it)`;

export function parseAdditional(raw: unknown): string {
  if (typeof raw !== 'string' && !Array.isArray(raw)) return '';
  return textWithLineBreaks(raw);
}

export function hasAdditionalContent(additional: string): boolean {
  return additional.trim().length > 0;
}
