'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewOpportunityRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has('tab')) {
      params.set('tab', 'new');
    }
    router.replace(`/ngo/opportunities?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
