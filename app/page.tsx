/**
 * ROOT PAGE - Main entry at URL: /
 * Social landing (ZaytoonzSMLanding). Full marketing landing is at /app.
 */
import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return <ZaytoonzSMLanding initialShowModal={false} />;
}
