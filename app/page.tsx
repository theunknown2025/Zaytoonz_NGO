import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';

/**
 * Main landing page - Shows the Social Media landing page
 * This is the page that appears at the root URL (/) in production
 */
export default function Home() {
  // Render the Social Media landing page (not the full LandingPage component)
  // Modal disabled for production - rendering plain social landing
  return <ZaytoonzSMLanding initialShowModal={false} />;
}