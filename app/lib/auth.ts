"use client";

import { createContext, useContext } from 'react';
import { signInUser, signUpUser, getUserProfile, signInWithGoogle, handleAuthCallback } from './supabase';

// User type definition
export type User = {
  id: string;
  fullName: string;
  email: string;
  userType: 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo';
};

// Mock database for users (in a real app, you'd use a proper database)
export const users: User[] = [];

// Auth service for handling authentication
export const AuthService = {
  signIn: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    // Call Supabase signin function
    const { user, error } = await signInUser(email, password);
    
    // Store user data in localStorage if login successful
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user, error };
  },

  signInWithGoogle: async (): Promise<{ user: User | null; error: string | null }> => {
    // Call Supabase Google signin function
    const { user, error } = await signInWithGoogle();
    
    // Store user data in localStorage if login successful
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user, error };
  },

  handleAuthCallback: async (): Promise<{ user: User | null; error: string | null }> => {
    // Handle OAuth callback
    const { user, error } = await handleAuthCallback();
    
    // Store user data in localStorage if login successful
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user, error };
  },
  
  signUp: async (
    fullName: string, 
    email: string, 
    password: string, 
    userType: 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo'
  ): Promise<{ user: User | null; error: string | null }> => {
    // Call Supabase signup function
    const { user, error } = await signUpUser(fullName, email, password, userType);
    
    // Store user data in localStorage if signup successful
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user, error };
  },
  
  signOut: async (): Promise<{ error: string | null }> => {
    // Clear the user from localStorage
    localStorage.removeItem('user');
    return { error: null };
  },
  
  getUser: async (): Promise<{ user: User | null; error: string | null }> => {
    // Check if user data exists in localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData) as User;
          
          // You can optionally validate the user data by fetching it from Supabase
          // For this demo, we'll just use the localStorage data
          
          return { user, error: null };
        } catch (error) {
          return { user: null, error: 'Invalid user data' };
        }
      }
    }
    
    return { user: null, error: null };
  }
};

// Auth context for React components
export const AuthContext = createContext<{
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  handleAuthCallback: () => Promise<{ user: User | null; error: string | null }>;
  signUp: (fullName: string, email: string, password: string, userType: 'Personne' | 'NGO' | 'Admin' | 'admin_ngo') => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}>({
  user: null,
  signIn: async () => ({ user: null, error: null }),
  signInWithGoogle: async () => ({ user: null, error: null }),
  handleAuthCallback: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null }),
  signOut: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext); 