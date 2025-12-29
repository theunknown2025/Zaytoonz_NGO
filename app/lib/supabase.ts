import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate Supabase URL to prevent build errors with placeholder values
const isValidUrl = (url: string): boolean => {
  if (!url || url.includes('your_') || url.includes('placeholder') || url.trim() === '') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Use a dummy URL during build if the real URL is not configured
// This prevents build errors when environment variables are placeholders
const safeSupabaseUrl = isValidUrl(supabaseUrl) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';
const safeSupabaseKey = supabaseAnonKey && !supabaseAnonKey.includes('your_') 
  ? supabaseAnonKey 
  : 'placeholder-key';

// Create a singleton Supabase client
export const supabase = createClient(safeSupabaseUrl, safeSupabaseKey);

// Function to check if email already exists
export async function isEmailRegistered(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .limit(1);

  const user = data?.[0] ?? null;

  if (error) {
    // PGRST116 means no rows returned, which is fine
    console.error('Error checking if email exists:', error);
  }

  return !!user;
}

// Function to signup a new user
export async function signUpUser(fullName: string, email: string, password: string, userType: 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo') {
  try {
    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email, auth_provider')
      .eq('email', email)
      .limit(1);

    const existingUser = existingUsers?.[0] ?? null;

    if (existingUser) {
      if (existingUser.auth_provider === 'google') {
        return { user: null, error: 'This email is already registered with Google. Please sign in with Google instead.' };
      } else {
        return { user: null, error: 'Email already registered' };
      }
    }

    // Insert the new user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email,
        password_hash: password, // Will be hashed by the trigger
        user_type: userType,
        auth_provider: 'email' // Regular email/password signup
      })
      .select();

    const insertedUser = userData?.[0] ?? null;

    if (userError || !insertedUser) {
      console.error('Error creating user:', userError);
      return { user: null, error: userError?.message || 'Failed to create user' };
    }

    // Create the type-specific details record
    if (userType === 'NGO' || userType === 'admin_ngo' || userType === 'assistant_ngo') {
      const { error: ngoError } = await supabase
        .from('ngo_details')
        .insert({ user_id: insertedUser.id });

      if (ngoError) {
        console.error('Error creating NGO details:', ngoError);
        return { user: null, error: ngoError.message };
      }
    } else if (userType === 'Personne') {
      const { error: personneError } = await supabase
        .from('personne_details')
        .insert({ user_id: insertedUser.id });

      if (personneError) {
        console.error('Error creating personne details:', personneError);
        return { user: null, error: personneError.message };
      }
    }

    return { 
      user: {
        id: insertedUser.id,
        fullName: insertedUser.full_name,
        email: insertedUser.email,
        userType: insertedUser.user_type as 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo'
      }, 
      error: null 
    };
    
  } catch (error: any) {
    console.error('Error in signup process:', error);
    return { user: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to sign in a user
export async function signInUser(email: string, password: string) {
  try {
    // Find user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    const userData = users?.[0] ?? null;

    if (userError || !userData) {
      return { user: null, error: 'Invalid email or password' };
    }

    // Check if user is an OAuth user (no password)
    if (userData.auth_provider === 'google' && userData.password_hash === null) {
      return { user: null, error: 'This account was created with Google. Please sign in with Google instead.' };
    }

    // Verify password using bcrypt
    if (!userData.password_hash) {
      return { user: null, error: 'Invalid email or password' };
    }

    // Check if password_hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[ayb]\$\d{2}\$/.test(userData.password_hash);
    
    let passwordValid = false;
    
    if (isBcryptHash) {
      // Verify using bcrypt
      passwordValid = await bcrypt.compare(password, userData.password_hash);
    } else {
      // Legacy support for old password formats (for backward compatibility)
      const hashedPassword = 'hashed_' + password;
      const doubleHashedPassword = 'hashed_' + hashedPassword;
      passwordValid = (
        userData.password_hash === hashedPassword ||
        userData.password_hash === password ||
        userData.password_hash === doubleHashedPassword
      );
    }

    if (!passwordValid) {
      return { user: null, error: 'Invalid email or password' };
    }

    return { 
      user: {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        userType: userData.user_type as 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo'
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error in signin process:', error);
    return { user: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to sign in with Google
export async function signInWithGoogle() {
  try {
    // Use production URL for OAuth redirect
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://zaytoonz-ong.netlify.app/auth/callback'
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // OAuth sign-in redirects to the callback URL, so we don't get a user object here
    // The user will be available after the redirect in the callback function
    return { user: null, error: null };
  } catch (error: any) {
    console.error('Error in Google signin:', error);
    return { user: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to handle OAuth callback
export async function handleAuthCallback() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user from Supabase auth:', error);
      return { user: null, error: error.message };
    }

    if (user) {
      // Check if user exists in our users table
      const { data: existingUsers, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .limit(1);

      const existingUser = existingUsers?.[0] ?? null;

      if (userError) {
        console.error('Error checking existing user:', userError);
        return { user: null, error: userError.message };
      }

      if (!existingUser) {
        // Get the user type from sessionStorage (for Google signup)
        let userType: 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo' = 'Personne'; // Default
        if (typeof window !== 'undefined') {
          const storedUserType = sessionStorage.getItem('googleSignupUserType');
          if (storedUserType && (storedUserType === 'Personne' || storedUserType === 'NGO' || storedUserType === 'Admin' || storedUserType === 'admin_ngo' || storedUserType === 'assistant_ngo')) {
            userType = storedUserType as 'Personne' | 'NGO' | 'Admin' | 'admin_ngo' | 'assistant_ngo';
          }
          // Clear the stored user type
          sessionStorage.removeItem('googleSignupUserType');
        }

        // Create new user in our users table
        const { data: newUsers, error: createError } = await supabase
          .from('users')
          .insert({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            user_type: userType,
            auth_provider: 'google',
            password_hash: null // OAuth users don't have passwords
          })
          .select();

        const newUser = newUsers?.[0] ?? null;

        if (createError || !newUser) {
          console.error('Error creating user:', createError);
          return { user: null, error: createError?.message || 'Failed to create user' };
        }

        // Create type-specific details based on user type
        if (userType === 'NGO' || userType === 'admin_ngo' || userType === 'assistant_ngo') {
          const { error: detailsError } = await supabase
            .from('ngo_details')
            .insert({ user_id: newUser.id });

          if (detailsError) {
            console.error('Error creating NGO details:', detailsError);
            // Don't return error here as the user was created successfully
          } else {
            console.log('Created NGO details for user:', newUser.id);
          }
        } else if (userType === 'Personne') {
          const { error: detailsError } = await supabase
            .from('personne_details')
            .insert({ user_id: newUser.id });

          if (detailsError) {
            console.error('Error creating personne details:', detailsError);
            // Don't return error here as the user was created successfully
          } else {
            console.log('Created personne details for user:', newUser.id);
          }
        }

        return { 
          user: {
            id: newUser.id,
            fullName: newUser.full_name,
            email: newUser.email,
            userType: newUser.user_type as 'Personne' | 'NGO' | 'Admin' | 'admin_ngo'
          }, 
          error: null 
        };
      } else {
        // Check if existing user was created with email/password
        if (existingUser.auth_provider === 'email' && existingUser.password_hash !== null) {
          return { user: null, error: 'This email is already registered with email/password. Please sign in with your password instead.' };
        }
        
        return { 
          user: {
            id: existingUser.id,
            fullName: existingUser.full_name,
            email: existingUser.email,
            userType: existingUser.user_type as 'Personne' | 'NGO' | 'Admin' | 'admin_ngo'
          }, 
          error: null 
        };
      }
    }

    return { user: null, error: 'No user found' };
  } catch (error: any) {
    console.error('Error handling auth callback:', error);
    return { user: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to get a user's profile details
export async function getUserProfile(userId: string, userType: 'Personne' | 'NGO' | 'admin_ngo' | 'assistant_ngo') {
  try {
    // Get the basic user data
    const { data: userRows, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    const userData = userRows?.[0] ?? null;

    if (userError || !userData) {
      return { profile: null, error: userError?.message || 'User not found' };
    }

    // Get the type-specific details
    const detailsTable = (userType === 'NGO' || userType === 'admin_ngo' || userType === 'assistant_ngo') ? 'ngo_details' : 'personne_details';
    const { data: detailsRows, error: detailsError } = await supabase
      .from(detailsTable)
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    const detailsData = detailsRows?.[0] ?? null;

    if (detailsError) {
      // PGRST116 means no rows, which might be fine for a new user
      return { profile: null, error: detailsError.message };
    }

    // Combine the data
    const profile = {
      ...userData,
      details: detailsData || {}
    };

    return { profile, error: null };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { profile: null, error: error.message || 'An unexpected error occurred' };
  }
} 