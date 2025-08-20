import { NextRequest } from 'next/server';
import { supabase } from './supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  userType: string;
}

/**
 * Extract user information from the request
 * Supports both Bearer token and query parameter authentication
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Try to get user from Bearer token first
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          return {
            id: user.id,
            email: user.email || '',
            userType: user.user_metadata?.user_type || 'unknown'
          };
        }
      } catch (tokenError) {
        console.error('Token validation error:', tokenError);
      }
    }
    
    // Fallback: try to get user ID from query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      // Fetch user details from the users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, user_type')
        .eq('id', userId)
        .single();
        
      if (!error && userData) {
        return {
          id: userData.id,
          email: userData.email,
          userType: userData.user_type
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error);
    return null;
  }
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  return user !== null;
}

/**
 * Get user ID from request (either from token or query params)
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const user = await getAuthenticatedUser(request);
  return user?.id || null;
}
