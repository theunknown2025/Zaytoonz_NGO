import { supabase } from './supabase';

// Type definition for NGO profile data
export interface NGOProfile {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  year_created: string;
  legal_rep_name: string;
  legal_rep_email: string;
  legal_rep_phone: string;
  legal_rep_function: string;
  profile_image_url?: string;
  additional_info?: AdditionalInfo[];
  documents?: Document[];
  created_at?: string;
  updated_at?: string;
}

export interface AdditionalInfo {
  id?: string;
  profile_id?: string;
  title: string;
  content: string;
  type: string;
}

export interface Document {
  id?: string;
  profile_id?: string;
  name: string;
  description: string;
  url: string;
}

/**
 * Fetches the NGO profile data from Supabase
 */
export async function getNGOProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ngo_profile')
      .select('*, additional_info(*), documents(*)')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching NGO profile:', error);
      return { profile: null, error: error.message };
    }

    return { profile: data as NGOProfile, error: null };
  } catch (error: any) {
    console.error('Error in getNGOProfile:', error);
    return { profile: null, error: error.message };
  }
}

/**
 * Creates or updates an NGO profile
 */
export async function saveNGOProfile(profileData: NGOProfile) {
  try {
    // Validate UUID format for user_id
    if (!isValidUUID(profileData.user_id)) {
      return { profile: null, error: "Invalid user ID format. Must be a valid UUID." };
    }

    let query;

    // Check if profile already exists
    if (profileData.id) {
      // Validate UUID format for profile ID
      if (!isValidUUID(profileData.id)) {
        return { profile: null, error: "Invalid profile ID format. Must be a valid UUID." };
      }

      // Update existing profile
      query = supabase
        .from('ngo_profile')
        .update({
          name: profileData.name,
          email: profileData.email,
          year_created: profileData.year_created,
          legal_rep_name: profileData.legal_rep_name,
          legal_rep_email: profileData.legal_rep_email,
          legal_rep_phone: profileData.legal_rep_phone,
          legal_rep_function: profileData.legal_rep_function,
          profile_image_url: profileData.profile_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id);
    } else {
      // Create new profile
      query = supabase
        .from('ngo_profile')
        .insert({
          user_id: profileData.user_id,
          name: profileData.name,
          email: profileData.email,
          year_created: profileData.year_created,
          legal_rep_name: profileData.legal_rep_name,
          legal_rep_email: profileData.legal_rep_email,
          legal_rep_phone: profileData.legal_rep_phone,
          legal_rep_function: profileData.legal_rep_function,
          profile_image_url: profileData.profile_image_url
        });
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('Error saving NGO profile:', error);
      return { profile: null, error: error.message };
    }

    return { profile: data as NGOProfile, error: null };
  } catch (error: any) {
    console.error('Error in saveNGOProfile:', error);
    return { profile: null, error: error.message };
  }
}

/**
 * Saves additional information for an NGO profile
 */
export async function saveAdditionalInfo(profileId: string, infoData: AdditionalInfo[]) {
  try {
    // Validate UUID format for profile ID
    if (!isValidUUID(profileId)) {
      return { success: false, error: "Invalid profile ID format. Must be a valid UUID." };
    }

    // Delete existing info for this profile
    await supabase
      .from('additional_info')
      .delete()
      .eq('profile_id', profileId);

    // Add new info data
    if (infoData.length > 0) {
      const dataToInsert = infoData.map(info => ({
        profile_id: profileId,
        title: info.title,
        content: info.content,
        type: info.type
      }));

      const { error } = await supabase
        .from('additional_info')
        .insert(dataToInsert);

      if (error) {
        console.error('Error saving additional info:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in saveAdditionalInfo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Saves documents for an NGO profile
 */
export async function saveDocuments(profileId: string, documents: Document[]) {
  try {
    // Validate UUID format for profile ID
    if (!isValidUUID(profileId)) {
      return { success: false, error: "Invalid profile ID format. Must be a valid UUID." };
    }

    // Delete existing documents for this profile
    await supabase
      .from('documents')
      .delete()
      .eq('profile_id', profileId);

    // Add new documents
    if (documents.length > 0) {
      const docsToInsert = documents.map(doc => ({
        profile_id: profileId,
        name: doc.name,
        description: doc.description,
        url: doc.url
      }));

      const { error } = await supabase
        .from('documents')
        .insert(docsToInsert);

      if (error) {
        console.error('Error saving documents:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in saveDocuments:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Uploads a file to Supabase storage
 */
export async function uploadFile(file: File, bucket: string, path?: string) {
  try {
    const filePath = path ? `${path}/${file.name}` : file.name;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { url: null, error: error.message };
    }

    // Get the public URL
    const { data: publicURLData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicURLData.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error in uploadFile:', error);
    return { url: null, error: error.message };
  }
}

/**
 * Deletes a file from Supabase storage
 */
export async function deleteFile(path: string, bucket: string) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in deleteFile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validates if a string is a proper UUID
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 