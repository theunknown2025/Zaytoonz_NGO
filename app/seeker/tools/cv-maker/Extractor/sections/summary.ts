import { textWithLineBreaks } from '../preserveLineBreaks';

export const SUMMARY_INSTRUCTIONS = `
"summary": string (copy the original profile or objective verbatim; empty string if the source has none)`;

export function parseSummary(raw: unknown): string {
  if (typeof raw !== 'string' && !Array.isArray(raw)) return '';
  return textWithLineBreaks(raw);
}

export function hasSummaryContent(summary: string): boolean {
  return summary.trim().length > 0;
}
