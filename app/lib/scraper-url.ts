/**
 * Resolves the Python scraper API base URL for browser vs server.
 *
 * - Production (HTTPS): browser uses same-origin `/scraper-api` (nginx → python-scraper).
 * - Local Next.js on localhost: direct `http://localhost:8000` when env is unset.
 */

function isDockerInternalUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('python-scraper') || u.includes('nextjs:') || u.includes('host.docker.internal');
}

/** Browser: never use Docker-internal hostnames; avoid HTTP scraper URL on HTTPS pages. */
export function getBrowserScraperBaseUrl(): string {
  const env = (process.env.NEXT_PUBLIC_EXTERNAL_SCRAPER_URL || '').trim();

  if (typeof window === 'undefined') {
    return '/scraper-api';
  }

  const host = window.location.hostname;
  const isLocalPage = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

  if (env) {
    if (isDockerInternalUrl(env)) {
      return '/scraper-api';
    }
    if (env.startsWith('http://localhost') || env.startsWith('http://127.0.0.1')) {
      return env.replace(/\/$/, '');
    }
    if (env.startsWith('https://')) {
      return env.replace(/\/$/, '');
    }
    if (env.startsWith('http://')) {
      return '/scraper-api';
    }
  }

  if (isLocalPage) {
    return 'http://localhost:8000';
  }

  return '/scraper-api';
}

/** Server-side (API routes, SSR): Docker network or localhost. */
export function getServerScraperBaseUrl(): string {
  return (
    process.env.SCRAPER_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_EXTERNAL_SCRAPER_URL ||
    'http://localhost:8000'
  );
}
