'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { AuthContext, AuthService, User } from '../lib/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { user } = await AuthService.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

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

  // Only render children after we've checked for a logged-in user
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signInWithGoogle, handleAuthCallback, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 