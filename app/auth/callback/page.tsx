'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function AuthCallback() {
  const router = useRouter();
  const { handleAuthCallback } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (processed) return;

    const handleCallback = async () => {
      try {
        setProcessed(true);
        const { user, error } = await handleAuthCallback();

        if (error) {
          toast.error(error);
          setTimeout(() => {
            router.push('/auth/signin');
          }, 2000);
          return;
        }

        if (user) {
          // Only show success message once
          toast.success('Successfully signed in with Google!', {
            id: 'google-signin-success', // Prevent duplicate toasts
            duration: 3000
          });
          
          // Redirect based on user type
          setTimeout(() => {
            if (user.userType === 'NGO') {
              router.push('/ngo/profile');
            } else if (user.userType === 'Personne') {
              router.push('/seeker');
            } else if (user.userType === 'Admin') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          }, 1500);
        } else {
          toast.error('Authentication failed');
          setTimeout(() => {
            router.push('/auth/signin');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error('An error occurred during authentication');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router, handleAuthCallback, processed]);

  return (
    <div className="min-h-screen flex items-center justify-center">
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
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {loading ? 'Completing sign in...' : 'Redirecting...'}
        </h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
