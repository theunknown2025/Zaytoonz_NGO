import type { ExternalLink } from '../../types';

export const EXTERNAL_LINKS_INSTRUCTIONS = `
"externalLinks": [{
  "platform": string (e.g. LinkedIn, GitHub, Portfolio),
  "url": string,
  "displayName": string
}]`;

export function parseExternalLinks(raw: unknown): Omit<ExternalLink, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const e = item as Record<string, unknown>;
      return {
        platform: String(e.platform ?? '').trim(),
        url: String(e.url ?? '').trim(),
        displayName: String(e.displayName ?? '').trim(),
      };
    })
    .filter((e) => e.url.length > 0);
}

export function hasExternalLinksContent(links: Omit<ExternalLink, 'id'>[]): boolean {
  return links.length > 0;
}
