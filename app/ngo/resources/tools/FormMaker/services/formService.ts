import { createClient } from '@supabase/supabase-js';
import { FormData, Section } from '../types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Save a form template to the database
 */
export async function saveFormTemplate(
  formData: FormData, 
  userId: string | undefined = undefined
): Promise<{ success: boolean; formId?: string; error?: string }> {
  try {
    // Basic validation
    if (!formData.title) {
      return { success: false, error: 'Form title is required' };
    }
    if (!formData.sections || formData.sections.length === 0) {
      return { success: false, error: 'Form must have at least one section' };
    }

    // Insert form template
    const { data, error } = await supabase
      .from('forms_templates')
      .insert({
        title: formData.title,
        description: formData.description || '',
        status: 'draft',
        sections: formData.sections,
        user_id: null // Set user_id to null to avoid foreign key constraint
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving form template:', error);
      return { success: false, error: error.message };
    }

    return { success: true, formId: data.id };
  } catch (error) {
    console.error('Exception saving form template:', error);
    return { success: false, error: 'Failed to save form template' };
  }
}

/**
 * Update an existing form template
 */
export async function updateFormTemplate(
  formId: string,
  formData: Partial<FormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {};
    
    if (formData.title) updateData.title = formData.title;
    if (formData.description !== undefined) updateData.description = formData.description;
    if (formData.sections) updateData.sections = formData.sections;
    
    const { error } = await supabase
      .from('forms_templates')
      .update(updateData)
      .eq('id', formId);

    if (error) {
      console.error('Error updating form template:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception updating form template:', error);
    return { success: false, error: 'Failed to update form template' };
  }
}

/**
 * Publish a form template
 */
export async function publishFormTemplate(
  formId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('forms_templates')
      .update({ status: 'published' })
      .eq('id', formId);

    if (error) {
      console.error('Error publishing form template:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception publishing form template:', error);
    return { success: false, error: 'Failed to publish form template' };
  }
}

/**
 * Save a form image
 */
export async function saveFormImage(
  formId: string,
  file: File
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${formId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // No need for subfolder since the bucket is specific to form pictures

    const { error: uploadError } = await supabase.storage
      .from('forms-pictures') // Use the new bucket name
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading form image:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('forms-pictures') // Use the new bucket name
      .getPublicUrl(filePath);

    // Save reference to database
    const { error: dbError } = await supabase
      .from('form_pictures')
      .insert({
        form_id: formId,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      });

    if (dbError) {
      console.error('Error saving form picture reference:', dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, filePath: urlData.publicUrl };
  } catch (error) {
    console.error('Exception saving form image:', error);
    return { success: false, error: 'Failed to save form image' };
  }
}

/**
 * Get all forms for a user
 */
export async function getUserForms() {
  try {
    // Fetch all forms from the database
    const { data, error } = await supabase
      .from('forms_templates')
      .select(`
        id, 
        title, 
        description, 
        status,
        sections,
        created_at, 
        updated_at,
        user_id,
        published
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      forms: data || [] 
    };
  } catch (error) {
    console.error('Exception fetching forms:', error);
    return { success: false, error: 'Failed to fetch forms' };
  }
}

/**
 * Get a single form by ID
 */
export async function getFormById(formId: string) {
  try {
    const { data, error } = await supabase
      .from('forms_templates')
      .select(`
        id, 
        title, 
        description, 
        sections, 
        status, 
        created_at, 
        updated_at, 
        user_id,
        form_pictures(id, file_path)
      `)
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching form:', error);
      return { success: false, error: error.message };
    }

    return { success: true, form: data };
  } catch (error) {
    console.error('Exception fetching form:', error);
    return { success: false, error: 'Failed to fetch form' };
  }
}

/**
 * Get only published forms (for selecting in opportunity creation)
 */
export async function getPublishedForms() {
  try {
    // Fetch only published forms from the database
    const { data, error } = await supabase
      .from('forms_templates')
      .select(`
        id, 
        title, 
        description, 
        status,
        published
      `)
      .or('status.eq.published,published.eq.true')  // Use OR condition to get both types of published forms
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching published forms:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      forms: data || [] 
    };
  } catch (error) {
    console.error('Exception fetching published forms:', error);
    return { success: false, error: 'Failed to fetch published forms' };
  }
} 