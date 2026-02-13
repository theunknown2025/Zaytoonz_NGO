// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ZaytoonzSMLanding from '../components/ZaytoonzSMLanding';

export default function SocialPage() {
  return <ZaytoonzSMLanding initialShowModal={false} />;
}

