'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw new Error(error);
      
      toast.success('Signed out successfully');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#6B8E23',
              secondary: '#fff',
            },
          },
        }}
      />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23] flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gradient">Zaytoonz NGO</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="btn-primary ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="card p-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Welcome, {user.fullName}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {user.userType === 'NGO' ? 'NGO Account' : 'Individual Account'}
                </p>
              </div>
              <div className="px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.fullName}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.email}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Account type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.userType}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Additional dashboard content can be added here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="card p-6 border-t-4 border-[#556B2F]">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600 mb-4">Complete your profile and set up your account preferences.</p>
                <button className="btn-outline text-sm">View Profile</button>
              </div>
              
              <div className="card p-6 border-t-4 border-[#6B8E23]">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h3>
                <p className="text-sm text-gray-600 mb-4">You haven't performed any activities yet.</p>
                <button className="btn-outline text-sm">View All</button>
              </div>
              
              <div className="card p-6 border-t-4 border-[#8FBC8F]">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Resources</h3>
                <p className="text-sm text-gray-600 mb-4">Find helpful guides and documentation for using the platform.</p>
                <button className="btn-outline text-sm">Browse Resources</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 