/**
 * Exclusive access gate for the Social Media landing (/) and the web app landing (/app).
 *
 * This is independent from the web app (Supabase) accounts: it is a single shared
 * admin credential that unlocks the protected pages for the current browser.
 * Must stay Edge-compatible (used by middleware.ts): Web Crypto only, no Node APIs.
 */

export const ACCESS_COOKIE_NAME = 'zaytoonz_access';
export const ACCESS_SESSION_SECONDS = 60 * 60 * 24 * 7;

/** Page that hosts the login modal. Unauthenticated visitors of gated routes are sent here. */
export const ACCESS_LOGIN_PATH = '/';
/** Where a successful login lands when no `next` page was requested. */
export const ACCESS_DEFAULT_REDIRECT = '/app';

type GatedRoute = { path: string; match: 'exact' | 'prefix' };

/**
 * Pages that require the exclusive access login.
 * Add an entry here to protect another page, e.g. { path: '/seeker', match: 'prefix' }.
 * ACCESS_LOGIN_PATH ('/') is protected by its own modal, so it is not listed.
 */
export const GATED_ROUTES: GatedRoute[] = [
  { path: '/app', match: 'prefix' },
  { path: '/social', match: 'prefix' },
  { path: '/auth', match: 'prefix' },
  { path: '/seeker', match: 'prefix' },
  { path: '/ngo', match: 'prefix' },
  { path: '/admin', match: 'prefix' },
];

const ACCESS_GATE_SETTING_KEY = 'access_gate_enabled';
let cachedGateEnabled: { value: boolean; at: number } | null = null;
const GATE_CACHE_MS = 5_000;

function envAccessGateEnabled(): boolean {
  return process.env.ACCESS_GATE_ENABLED !== 'false';
}

/** Clear the short-lived gate cache (call after admin toggles the lock). */
export function clearAccessGateCache(): void {
  cachedGateEnabled = null;
}

/**
 * Whether the exclusive access lock is active.
 * Prefers `platform_settings.access_gate_enabled` (admin toggle), falls back to ACCESS_GATE_ENABLED env.
 */
export async function isAccessGateEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cachedGateEnabled && now - cachedGateEnabled.at < GATE_CACHE_MS) {
    return cachedGateEnabled.value;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (url && key && !url.includes('placeholder') && !key.includes('your_')) {
    try {
      const res = await fetch(
        `${url}/rest/v1/platform_settings?key=eq.${ACCESS_GATE_SETTING_KEY}&select=value&limit=1`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<{ value: unknown }>;
        if (rows[0] && rows[0].value !== undefined && rows[0].value !== null) {
          const raw = rows[0].value;
          const resolved = typeof raw === 'boolean' ? raw : String(raw) === 'true';
          cachedGateEnabled = { value: resolved, at: now };
          return resolved;
        }
      }
    } catch {
      // fall through to env
    }
  }

  const fallback = envAccessGateEnabled();
  cachedGateEnabled = { value: fallback, at: now };
  return fallback;
}

function getCredentials() {
  return {
    email: (process.env.ACCESS_GATE_EMAIL || 'admin@zaytoonz.com').trim().toLowerCase(),
    password: process.env.ACCESS_GATE_PASSWORD || 'admin@ZAYTOONZ',
  };
}

function getSecret(): string {
  const { password } = getCredentials();
  return process.env.ACCESS_GATE_SECRET || `zaytoonz-access-gate:${password}`;
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

export function isGatedPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return GATED_ROUTES.some(({ path: route, match }) =>
    match === 'exact' ? path === route : path === route || path.startsWith(`${route}/`)
  );
}

/** Only allow same-origin relative paths as post-login redirects. */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return ACCESS_DEFAULT_REDIRECT;
  }
  return next;
}

export function checkAccessCredentials(email: string, password: string): boolean {
  const expected = getCredentials();
  return (
    constantTimeEqual(email.trim().toLowerCase(), expected.email) &&
    constantTimeEqual(password, expected.password)
  );
}

function constantTimeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

async function hmacHex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAccessToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_SESSION_SECONDS;
  const signature = await hmacHex(`${getCredentials().email}|${expiresAt}`);
  return `${expiresAt}.${signature}`;
}

export async function verifyAccessToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresRaw, signature] = token.split('.');
  const expiresAt = Number(expiresRaw);
  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now() / 1000) return false;
  const expected = await hmacHex(`${getCredentials().email}|${expiresAt}`);
  return constantTimeEqual(signature, expected);
}

/** True when the visitor holds a valid access cookie, or the gate is disabled. */
export async function hasAccess(token: string | null | undefined): Promise<boolean> {
  if (!(await isAccessGateEnabled())) return true;
  return verifyAccessToken(token);
}
