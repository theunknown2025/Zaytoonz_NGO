'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AuthContext, AuthService, User } from '../lib/auth';

interface AuthProviderProps {
  children: ReactNode;
}

// Public routes that don't need auth check - render immediately
const PUBLIC_ROUTES = ['/', '/social', '/app'];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = pathname && PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { user } = await AuthService.getUser();
      setUser(user);
      setLoading(false);
    };

    // If it's a public route, render immediately and check auth in background
    if (isPublicRoute) {
      setLoading(false);
      // Check auth in background without blocking render
      checkUser();
    } else {
      // For protected routes, wait for auth check
      checkUser();
    }
  }, [isPublicRoute]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user, error } = await AuthService.signIn(email, password);
    if (user) setUser(user);
    return { user, error };
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string, userType: 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo') => {
    const { user, error } = await AuthService.signUp(fullName, email, password, userType);
    if (user) setUser(user);
    return { user, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { user, error } = await AuthService.signInWithGoogle();
    if (user) setUser(user);
    return { user, error };
  }, []);

  const handleAuthCallback = useCallback(async () => {
    const { user, error } = await AuthService.handleAuthCallback();
    if (user) setUser(user);
    return { user, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await AuthService.signOut();
    if (!error) setUser(null);
    return { error };
  }, []);

  // Only render children after we've checked for a logged-in user (unless skipLoadingOnRoot)
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signInWithGoogle, handleAuthCallback, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 