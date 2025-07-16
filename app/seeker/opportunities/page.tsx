'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OpportunitiesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to navigate page
    router.push('/seeker/opportunities/navigate');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-olive-dark">
        Redirecting to opportunities...
      </div>
    </div>
  );
} 