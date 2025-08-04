import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/app/lib/auth';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get current user ID from AuthService (localStorage)
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { user } = await AuthService.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export interface SeekerProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  latestJobTitle?: string;
  yearsOfExperience?: number;
  fieldsOfExperience: string[];
  aboutMe?: string;
  profilePictureUrl?: string;
}

// Upload profile picture to Supabase storage
export async function uploadProfilePicture(file: File, userId: string): Promise<{ data: string | null; error: any }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

    console.log('Uploading file to storage bucket: profile-pictures, path:', fileName);

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', urlData.publicUrl);

    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    return { data: null, error };
  }
}

// Save or update seeker profile
export async function saveProfile(profileData: SeekerProfileData, profilePicture?: File): Promise<{ data: any | null; error: any }> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('Saving profile for user ID:', userId);

    let profilePictureUrl: string | undefined = profileData.profilePictureUrl;

    // Upload profile picture if provided
    if (profilePicture) {
      console.log('Uploading new profile picture...');
      const uploadResult = await uploadProfilePicture(profilePicture, userId);
      if (uploadResult.error) {
        console.error('Error uploading profile picture:', uploadResult.error);
        return { data: null, error: uploadResult.error };
      }
      profilePictureUrl = uploadResult.data || undefined;
      console.log('Profile picture uploaded, URL:', profilePictureUrl);
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('seeker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return { data: null, error: checkError };
    }

    const profileDataToSave = {
      user_id: userId,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      date_of_birth: profileData.dateOfBirth || null,
      nationality: profileData.nationality || null,
      latest_job_title: profileData.latestJobTitle || null,
      years_of_experience: profileData.yearsOfExperience || null,
      fields_of_experience: profileData.fieldsOfExperience,
      about_me: profileData.aboutMe || null,
      profile_picture_url: profilePictureUrl || null,
      updated_at: new Date().toISOString()
    };

    console.log('Profile data to save:', profileDataToSave);

    let result;
    
    if (existingProfile) {
      console.log('Updating existing profile...');
      // Update existing profile
      result = await supabase
        .from('seeker_profiles')
        .update(profileDataToSave)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      console.log('Creating new profile...');
      // Create new profile
      result = await supabase
        .from('seeker_profiles')
        .insert(profileDataToSave)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving profile:', result.error);
      return { data: null, error: result.error };
    }

    console.log('Profile saved successfully:', result.data);
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error in saveProfile:', error);
    return { data: null, error };
  }
}

// Get seeker profile by user ID
export async function getProfile(): Promise<{ data: any | null; error: any }> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('Getting profile for user ID:', userId);

    const { data, error } = await supabase
      .from('seeker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine for a new user
      console.error('Error getting profile:', error);
      return { data: null, error };
    }

    console.log('Profile data retrieved:', data);
    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error in getProfile:', error);
    return { data: null, error };
  }
}

// Delete profile picture from storage
export async function deleteProfilePicture(pictureUrl: string): Promise<{ error: any }> {
  try {
    // Extract file path from URL
    const urlParts = pictureUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    return { error };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { error };
  }
} 