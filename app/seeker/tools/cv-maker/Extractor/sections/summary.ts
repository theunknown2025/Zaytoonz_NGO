export const SUMMARY_INSTRUCTIONS = `
"summary": string (professional profile / objective paragraph)`;

export function parseSummary(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export function hasSummaryContent(summary: string): boolean {
  return summary.trim().length > 0;
}
