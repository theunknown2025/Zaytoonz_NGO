/**
 * ROOT PAGE - Main entry at URL: /
 * Social landing (ZaytoonzSMLanding). Full marketing landing is at /app.
 * Hosts the exclusive access login modal (see app/lib/accessGate.ts).
 */
import { cookies } from 'next/headers';
import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';
import {
  ACCESS_COOKIE_NAME,
  hasAccess,
  isAccessGateEnabled,
  sanitizeNextPath,
} from './lib/accessGate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const isAuthenticated = await hasAccess(cookies().get(ACCESS_COOKIE_NAME)?.value);
  return (
    <ZaytoonzSMLanding
      isAuthenticated={isAuthenticated}
      gateEnabled={isAccessGateEnabled()}
      nextPath={sanitizeNextPath(searchParams?.next)}
    />
  );
}
