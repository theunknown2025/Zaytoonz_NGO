'use client';

import Profile from '../components/Profile';
import { useAuth } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NGOProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">Organization Profile</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your organization details and documents</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl">
          <Profile currentUser={user} />
        </div>
      </div>
    </div>
  );
} 