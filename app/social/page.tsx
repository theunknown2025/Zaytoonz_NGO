import { redirect } from 'next/navigation';

/** Canonical home is `/`; keep route for old links. */
export default function SocialPage() {
  redirect('/');
}
