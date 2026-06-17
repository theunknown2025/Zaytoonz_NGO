import type { GeneralInfo } from '../../types';

export const GENERAL_INSTRUCTIONS = `
"general": {
  "firstName": string,
  "lastName": string,
  "email": string,
  "phone": string,
  "address": string,
  "nationality": string,
  "birthDate": string (YYYY-MM-DD or empty),
  "gender": string
}`;

const EMPTY_GENERAL: GeneralInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  nationality: '',
  birthDate: '',
  gender: '',
};

export function parseGeneral(raw: unknown): GeneralInfo {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_GENERAL };

  const g = raw as Record<string, unknown>;
  return {
    firstName: String(g.firstName ?? '').trim(),
    lastName: String(g.lastName ?? '').trim(),
    email: String(g.email ?? '').trim(),
    phone: String(g.phone ?? '').trim(),
    address: String(g.address ?? '').trim(),
    nationality: String(g.nationality ?? '').trim(),
    birthDate: String(g.birthDate ?? '').trim(),
    gender: String(g.gender ?? '').trim(),
  };
}

export function hasGeneralContent(general: GeneralInfo): boolean {
  return Object.values(general).some((v) => v.trim().length > 0);
}
