/**
 * ROOT PAGE - This is the main entry point at URL: /
 * 
 * IMPORTANT: Root redirects directly to /social (SM page)
 * - SM Page (ZaytoonzSMLanding): Shows social media links at /social
 * - Full LandingPage: Available at /app route only
 */

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root to /social (SM page)
  redirect('/social');
}