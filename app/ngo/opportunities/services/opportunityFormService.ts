import { supabase } from '@/app/lib/supabase';

/**
 * Validates if a string is a proper UUID
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Save form choice option when "Use Form Template" is selected
 */
export async function saveOpportunityFormChoice(
  opportunityId: string,
  formId: string,
  userId: string | undefined = undefined
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUIDs
    if (!isValidUUID(opportunityId)) {
      return { success: false, error: "Invalid opportunity ID. Must be a valid UUID." };
    }
    
    if (!isValidUUID(formId)) {
      return { success: false, error: "Invalid form ID. Must be a valid UUID." };
    }
    
    if (userId && !isValidUUID(userId)) {
      return { success: false, error: "Invalid user ID. Must be a valid UUID." };
    }
    
    // Check if a record already exists for this opportunity
    const { data: existingData, error: checkError } = await supabase
      .from('opportunity_form_choice')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing form choice:', checkError);
      return { success: false, error: checkError.message };
    }

    // If record exists, update it, otherwise insert a new one
    if (existingData) {
      const { error } = await supabase
        .from('opportunity_form_choice')
        .update({
          form_id: formId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);

      if (error) {
        console.error('Error updating form choice:', error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('opportunity_form_choice')
        .insert({
          opportunity_id: opportunityId,
          form_id: formId,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving form choice:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Exception saving form choice:', error);
    return { success: false, error: 'Failed to save form choice' };
  }
}

/**
 * Save email contacts when "Via Email" is selected
 */
export async function saveOpportunityFormEmail(
  opportunityId: string,
  emails: string[],
  referenceCodes: string[],
  userId: string | undefined = undefined
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUIDs
    if (!isValidUUID(opportunityId)) {
      return { success: false, error: "Invalid opportunity ID. Must be a valid UUID." };
    }
    
    if (userId && !isValidUUID(userId)) {
      return { success: false, error: "Invalid user ID. Must be a valid UUID." };
    }
    
    // Check if a record already exists for this opportunity
    const { data: existingData, error: checkError } = await supabase
      .from('opportunity_form_email')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing form email:', checkError);
      return { success: false, error: checkError.message };
    }

    // If record exists, update it, otherwise insert a new one
    if (existingData) {
      const { error } = await supabase
        .from('opportunity_form_email')
        .update({
          contact_emails: emails,
          reference_codes: referenceCodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);

      if (error) {
        console.error('Error updating form email:', error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('opportunity_form_email')
        .insert({
          opportunity_id: opportunityId,
          contact_emails: emails,
          reference_codes: referenceCodes,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving form email:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Exception saving form email:', error);
    return { success: false, error: 'Failed to save form email' };
  }
}

/**
 * Get opportunity form choice by opportunity ID
 */
export async function getOpportunityFormChoice(opportunityId: string) {
  try {
    const { data, error } = await supabase
      .from('opportunity_form_choice')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching form choice:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching form choice:', error);
    return { success: false, error: 'Failed to fetch form choice' };
  }
}

/**
 * Get opportunity form email by opportunity ID
 */
export async function getOpportunityFormEmail(opportunityId: string) {
  try {
    const { data, error } = await supabase
      .from('opportunity_form_email')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching form email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching form email:', error);
    return { success: false, error: 'Failed to fetch form email' };
  }
}

/**
 * Returns a normalized absolute http(s) URL, or null when the value is not a valid link.
 */
export function normalizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Save the "External Opportunity" toggle and the URL applicants are redirected to.
 */
export async function saveOpportunityExternalSettings(
  opportunityId: string,
  isExternal: boolean,
  externalUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUUID(opportunityId)) {
      return { success: false, error: "Invalid opportunity ID. Must be a valid UUID." };
    }

    let normalizedUrl: string | null = null;
    if (isExternal) {
      normalizedUrl = normalizeExternalUrl(externalUrl);
      if (!normalizedUrl) {
        return { success: false, error: 'Please provide a valid application URL' };
      }
    }

    const opportunityExists = await ensureOpportunityExists(opportunityId);
    if (!opportunityExists) {
      return { success: false, error: 'Failed to ensure opportunity exists in database' };
    }

    const { error } = await supabase
      .from('opportunities')
      .update({
        is_external: isExternal,
        external_application_url: isExternal ? normalizedUrl : externalUrl.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId);

    if (error) {
      console.error('Error saving external opportunity settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception saving external opportunity settings:', error);
    return { success: false, error: 'Failed to save external opportunity settings' };
  }
}

/**
 * Get the "External Opportunity" settings by opportunity ID
 */
export async function getOpportunityExternalSettings(
  opportunityId: string
): Promise<{ isExternal: boolean; externalUrl: string }> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('is_external, external_application_url')
    .eq('id', opportunityId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching external opportunity settings:', error);
  }

  return {
    isExternal: Boolean(data?.is_external),
    externalUrl: data?.external_application_url || ''
  };
}

/**
 * Ensures an opportunity record exists in the database
 * Creates a draft opportunity if one doesn't exist with the given ID
 */
async function ensureOpportunityExists(opportunityId: string): Promise<boolean> {
  try {
    // First check if opportunity already exists
    const { data, error } = await supabase
      .from('opportunities')
      .select('id')
      .eq('id', opportunityId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking opportunity:', error);
      return false;
    }
    
    // If opportunity found, we're good
    if (data) {
      return true;
    }
    
    // If not found, create a draft opportunity
    const { error: insertError } = await supabase
      .from('opportunities')
      .insert({
        id: opportunityId,
        title: 'Draft Opportunity',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating opportunity:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in ensureOpportunityExists:', error);
    return false;
  }
}

/**
 * Save opportunity form settings (both email and form choice)
 * @param opportunityId The ID of the opportunity
 * @param applicationMethod The selected application method ('form' or 'email')
 * @param formData The form data including selectedFormId, contactEmails, and referenceCodes
 * @param userId Optional user ID
 */
export async function saveOpportunityFormSettings(
  opportunityId: string,
  applicationMethod: 'form' | 'email' | '',
  formData: {
    selectedFormId?: string;
    contactEmails?: string[];
    referenceCodes?: string[];
  },
  userId: string | undefined = undefined
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!opportunityId) {
      return { success: false, error: 'Opportunity ID is required' };
    }

    // Ensure the opportunity exists in the database
    const opportunityExists = await ensureOpportunityExists(opportunityId);
    if (!opportunityExists) {
      return { success: false, error: 'Failed to ensure opportunity exists in database' };
    }
    
    if (applicationMethod === 'form' && formData.selectedFormId) {
      return await saveOpportunityFormChoice(opportunityId, formData.selectedFormId, userId);
    } else if (applicationMethod === 'email' && formData.contactEmails) {
      return await saveOpportunityFormEmail(
        opportunityId, 
        formData.contactEmails, 
        formData.referenceCodes || [],
        userId
      );
    } else {
      return { success: false, error: 'Invalid application method or missing required data' };
    }
  } catch (error) {
    console.error('Exception saving form settings:', error);
    return { success: false, error: 'Failed to save form settings' };
  }
}