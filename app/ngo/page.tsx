'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NGOPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/ngo/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-10 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Redirecting to NGO dashboard</p>
      </div>
    </div>
  );
} 