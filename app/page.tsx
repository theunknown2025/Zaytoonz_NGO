/**
 * ROOT PAGE - This is the main entry point at URL: /
 * 
 * IMPORTANT: This MUST render ZaytoonzSMLanding (SM page), NOT LandingPage
 * - SM Page (ZaytoonzSMLanding): Shows social media links - THIS IS WHAT SHOULD BE AT ROOT
 * - Full LandingPage: Available at /app route only
 * 
 * If you see LandingPage at root, the build cache is stale - rebuild required!
 */
import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';

export default function Home() {
  // CRITICAL: Root must show SM page, not full LandingPage
  // The full LandingPage component is at /app route (app/app/page.tsx)
  return <ZaytoonzSMLanding initialShowModal={false} />;
}