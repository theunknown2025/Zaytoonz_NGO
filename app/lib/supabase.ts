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
    const emailExists = await isEmailRegistered(email);
    if (emailExists) {
      return { user: null, error: 'Email already registered' };
    }

    // Insert the new user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email,
        password_hash: password, // Will be hashed by the trigger
        user_type: userType
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