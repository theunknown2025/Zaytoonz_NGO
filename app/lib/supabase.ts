import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if email already exists
export async function isEmailRegistered(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is fine
    console.error('Error checking if email exists:', error);
  }

  return !!data;
}

// Function to signup a new user
export async function signUpUser(fullName: string, email: string, password: string, userType: 'Personne' | 'NGO' | 'Admin') {
  try {
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email, auth_provider')
      .eq('email', email)
      .single();

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
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return { user: null, error: userError.message };
    }

    // Create the type-specific details record
    if (userType === 'NGO') {
      const { error: ngoError } = await supabase
        .from('ngo_details')
        .insert({ user_id: userData.id });

      if (ngoError) {
        console.error('Error creating NGO details:', ngoError);
        return { user: null, error: ngoError.message };
      }
    } else if (userType === 'Personne') {
      const { error: personneError } = await supabase
        .from('personne_details')
        .insert({ user_id: userData.id });

      if (personneError) {
        console.error('Error creating personne details:', personneError);
        return { user: null, error: personneError.message };
      }
    }

    return { 
      user: {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        userType: userData.user_type as 'Personne' | 'NGO' | 'Admin'
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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return { user: null, error: 'Invalid email or password' };
    }

    // Check if user is an OAuth user (no password)
    if (userData.auth_provider === 'google' && userData.password_hash === null) {
      return { user: null, error: 'This account was created with Google. Please sign in with Google instead.' };
    }

    // In a real implementation, you would verify the password hash here
    // For this example, we'll do a simple check (this is NOT secure and just for demo)
    const hashedPassword = 'hashed_' + password;
    const doubleHashedPassword = 'hashed_' + hashedPassword;
    if (
      userData.password_hash !== hashedPassword &&
      userData.password_hash !== password &&
      userData.password_hash !== doubleHashedPassword
    ) {
      return { user: null, error: 'Invalid email or password' };
    }

    return { 
      user: {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        userType: userData.user_type as 'Personne' | 'NGO' | 'Admin'
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
      console.log('Google OAuth user:', user.email);
      
      // Check if user exists in our users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking existing user:', userError);
        return { user: null, error: userError.message };
      }

      if (!existingUser) {
        // Get the user type from sessionStorage (for Google signup)
        let userType: 'Personne' | 'NGO' | 'Admin' = 'Personne'; // Default
        if (typeof window !== 'undefined') {
          const storedUserType = sessionStorage.getItem('googleSignupUserType');
          console.log('Stored user type from sessionStorage:', storedUserType);
          if (storedUserType && (storedUserType === 'Personne' || storedUserType === 'NGO' || storedUserType === 'Admin')) {
            userType = storedUserType as 'Personne' | 'NGO' | 'Admin';
          }
          // Clear the stored user type
          sessionStorage.removeItem('googleSignupUserType');
        }

        console.log('Creating new user with type:', userType);

        // Create new user in our users table
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            user_type: userType,
            auth_provider: 'google',
            password_hash: null // OAuth users don't have passwords
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return { user: null, error: createError.message };
        }

        console.log('Created new user:', newUser.id);

        // Create type-specific details based on user type
        if (userType === 'NGO') {
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
            userType: newUser.user_type as 'Personne' | 'NGO' | 'Admin'
          }, 
          error: null 
        };
      } else {
        console.log('Existing user found:', existingUser.email, 'Type:', existingUser.user_type);
        
        // Check if existing user was created with email/password
        if (existingUser.auth_provider === 'email' && existingUser.password_hash !== null) {
          return { user: null, error: 'This email is already registered with email/password. Please sign in with your password instead.' };
        }
        
        return { 
          user: {
            id: existingUser.id,
            fullName: existingUser.full_name,
            email: existingUser.email,
            userType: existingUser.user_type as 'Personne' | 'NGO' | 'Admin'
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
export async function getUserProfile(userId: string, userType: 'Personne' | 'NGO') {
  try {
    // Get the basic user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      return { profile: null, error: userError.message };
    }

    // Get the type-specific details
    const detailsTable = userType === 'NGO' ? 'ngo_details' : 'personne_details';
    const { data: detailsData, error: detailsError } = await supabase
      .from(detailsTable)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (detailsError && detailsError.code !== 'PGRST116') {
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