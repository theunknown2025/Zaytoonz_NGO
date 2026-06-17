export const ADDITIONAL_INSTRUCTIONS = `
"additional": string (any other relevant information not covered above)`;

export function parseAdditional(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export function hasAdditionalContent(additional: string): boolean {
  return additional.trim().length > 0;
}
