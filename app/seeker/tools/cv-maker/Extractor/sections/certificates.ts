import type { Certificate } from '../../types';

export const CERTIFICATES_INSTRUCTIONS = `
"certificates": [{
  "name": string,
  "issuer": string,
  "date": string (YYYY-MM or YYYY-MM-DD),
  "description": string
}]`;

export function parseCertificates(raw: unknown): Omit<Certificate, 'id'>[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const c = item as Record<string, unknown>;
      return {
        name: String(c.name ?? '').trim(),
        issuer: String(c.issuer ?? '').trim(),
        date: String(c.date ?? '').trim(),
        description: String(c.description ?? '').trim(),
      };
    })
    .filter((c) => c.name || c.issuer);
}

export function hasCertificatesContent(certificates: Omit<Certificate, 'id'>[]): boolean {
  return certificates.length > 0;
}
