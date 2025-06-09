'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/auth/signin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-10 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Redirecting to sign in page</p>
      </div>
    </div>
  );
} 