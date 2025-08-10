'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function SignUp() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('Personne');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      const { user, error } = await signUp(
        fullName, 
        email, 
        password, 
        userType as 'Personne' | 'NGO'
      );

      if (error) {
        throw new Error(error);
      }

      toast.success('Account created successfully!');
      
      // Redirect based on user type after successful sign-up
      setTimeout(() => {
        if (user && user.userType === 'NGO') {
          router.push('/ngo/profile');
        } else if (user && user.userType === 'Personne') {
          router.push('/seeker');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign-up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // Store the selected user type in sessionStorage before Google OAuth
      sessionStorage.setItem('googleSignupUserType', userType);
      
      const { user, error } = await signInWithGoogle();

      if (error) {
        throw new Error(error);
      }

      // Google sign-up will redirect to the callback page
      // The callback page will handle the rest of the flow
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during Google sign-up');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
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
      <div className="w-full max-w-md px-8 py-10 mx-auto overflow-hidden bg-white rounded-2xl shadow-xl card">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gradient">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join our community today</p>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm gradient-border">
            <p className="text-sm font-medium text-gray-700 mb-3">I am registering as</p>
            <div className="flex space-x-4">
              <div className="relative flex-1">
                <input
                  id="personne"
                  name="user-type"
                  type="radio"
                  checked={userType === 'Personne'}
                  onChange={() => setUserType('Personne')}
                  className="sr-only"
                />
                <label
                  htmlFor="personne"
                  className={`flex items-center justify-center w-full p-3 text-sm font-medium ${
                    userType === 'Personne'
                      ? 'bg-[#556B2F] text-white'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  } border rounded-md cursor-pointer transition-all duration-200`}
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Individual
                </label>
              </div>
              <div className="relative flex-1">
                <input
                  id="ngo"
                  name="user-type"
                  type="radio"
                  checked={userType === 'NGO'}
                  onChange={() => setUserType('NGO')}
                  className="sr-only"
                />
                <label
                  htmlFor="ngo"
                  className={`flex items-center justify-center w-full p-3 text-sm font-medium ${
                    userType === 'NGO'
                      ? 'bg-[#556B2F] text-white'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  } border rounded-md cursor-pointer transition-all duration-200`}
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  NGO
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1">
              <input
                id="full-name"
                name="full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] border border-transparent rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B8E23] transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Google Sign Up Button */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="flex justify-center items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {googleLoading ? (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 -ml-1 text-gray-700 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account with Google...
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="ml-2">
                    {userType === 'NGO' ? 'Sign up as NGO with Google' : 'Sign up with Google'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="btn-outline flex justify-center w-full"
            >
              Sign in
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-[#556B2F] hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-[#556B2F] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
} 