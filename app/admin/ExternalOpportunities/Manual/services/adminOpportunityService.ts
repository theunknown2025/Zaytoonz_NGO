import { supabase } from '@/app/lib/supabase';

export interface AdminOpportunityProgressData {
  title: string;
  description?: string;
  location?: string;
  hours?: string;
  status?: string;
  step?: string;
  metadata?: any;
  criteria?: any;
  opportunity_id: string;
}

/**
 * Get a valid admin user ID from the database
 * For admin-created opportunities, we'll use a special admin user or the first admin user found
 */
async function getAdminUserId(): Promise<string | null> {
  try {
    // Try to find an admin user
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('id')
      .eq('user_type', 'Admin')
      .limit(1);
    
    if (error) {
      console.error('Error fetching admin user:', error);
      // Fallback: try to get any user
      const { data: anyUser } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      return anyUser?.id || null;
    }
    
    if (adminUsers && adminUsers.length > 0) {
      return adminUsers[0].id;
    }
    
    // Fallback: get any user
    const { data: anyUser } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    return anyUser?.id || null;
  } catch (error) {
    console.error('Error getting admin user ID:', error);
    return null;
  }
}

/**
 * Save admin opportunity progress to the database
 */
export async function saveAdminOpportunityProgress(data: AdminOpportunityProgressData) {
  try {
    console.log('Saving admin opportunity progress directly to database');
    
    // Get a valid admin user ID from the database
    const userId = await getAdminUserId();
    
    if (!userId) {
      console.error('Could not find a valid user ID. Cannot save opportunity progress.');
      return {
        error: {
          message: 'Could not find a valid user ID to associate with this opportunity.',
          details: 'Please ensure at least one user exists in the system.'
        }
      };
    }
    
    console.log('Using user ID for database operations:', userId);
    
    // If we have an opportunity_id, ensure the opportunity exists in the database
    if (data.opportunity_id) {
      console.log('Checking if opportunity exists with ID:', data.opportunity_id);
      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('id', data.opportunity_id)
        .maybeSingle();
      
      if (opportunityError && opportunityError.code !== 'PGRST116') {
        console.error('Error checking opportunity existence:', opportunityError);
        return { error: opportunityError };
      }
      
      if (!opportunity) {
        console.log('Opportunity does not exist, creating it first...');
        // Create the opportunity first with user_id
        const { data: newOpportunity, error: createError } = await supabase
          .from('opportunities')
          .insert({
            id: data.opportunity_id,
            title: data.title || 'Draft Opportunity',
            opportunity_type: 'job', // Default type, will be updated later
            user_id: userId, // Include user_id
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating opportunity:', createError);
          return { error: createError };
        }
        
        console.log('Created opportunity:', newOpportunity);
      } else {
        console.log('Opportunity exists:', opportunity);
      }
    }
    
    // Check if we already have a record for this specific opportunity
    let existingData = null;
    let fetchError = null;
    
    if (data.opportunity_id) {
      // If we have an opportunity_id, look for existing record for this specific opportunity
      const result = await supabase
        .from('opportunity_description')
        .select('id, opportunity_id')
        .eq('opportunity_id', data.opportunity_id)
        .maybeSingle();
      
      existingData = result.data;
      fetchError = result.error;
    } else {
      // Fallback: look for any draft by this user (for backward compatibility)
      const result = await supabase
        .from('opportunity_description')
        .select('id, opportunity_id')
        .eq('user_id', userId)
        .eq('status', 'draft')
        .is('opportunity_id', null) // Only get records without opportunity_id
        .maybeSingle();
      
      existingData = result.data;
      fetchError = result.error;
    }
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing record:', fetchError);
      // Continue with insert even if select fails
    }
    
    const now = new Date();
    
    if (existingData) {
      // Update existing record
      console.log('Updating existing record with ID:', existingData.id);
      const { data: updatedData, error: updateError } = await supabase
        .from('opportunity_description')
        .update({
          title: data.title,
          description: data.description,
          location: data.location || null,
          hours: data.hours || null,
          status: data.status || 'draft',
          step: data.step || 'description',
          metadata: data.metadata || null,
          criteria: data.criteria || {},
          opportunity_id: data.opportunity_id || null,
          updated_at: now.toISOString()
        })
        .eq('id', existingData.id)
        .select();
      
      if (updateError) {
        console.error('Error updating opportunity progress:', updateError);
        return { error: updateError };
      }
      
      return { data: updatedData };
    } else {
      // Create new record
      console.log('Creating new record for opportunity ID:', data.opportunity_id);
      const { data: newData, error: insertError } = await supabase
        .from('opportunity_description')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          location: data.location || null,
          hours: data.hours || null,
          status: data.status || 'draft',
          step: data.step || 'description',
          metadata: data.metadata || null,
          criteria: data.criteria || {},
          opportunity_id: data.opportunity_id || null,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('Error saving opportunity progress:', insertError);
        return { error: insertError };
      }
      
      return { data: newData };
    }
  } catch (error) {
    console.error('Unexpected error saving opportunity progress:', error);
    return { 
      error: { 
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      } 
    };
  }
}

/**
 * Gets the latest admin opportunity progress directly from the database
 * @param opportunityId Optional opportunity ID to get progress for specific opportunity
 * @returns The latest draft or null if none exists
 */
export async function getAdminOpportunityProgress(opportunityId?: string) {
  try {
    // Get a valid admin user ID
    const userId = await getAdminUserId();
    
    if (!userId) {
      console.error('Could not find a valid user ID. Cannot retrieve opportunity progress.');
      return {
        error: {
          message: 'Could not find a valid user ID to retrieve progress.',
          details: 'Please ensure at least one user exists in the system.'
        }
      };
    }
    
    // Build query based on whether we have a specific opportunity ID
    let query = supabase
      .from('opportunity_description')
      .select('*');
    
    if (opportunityId) {
      // Get progress for specific opportunity
      query = query.eq('opportunity_id', opportunityId);
    } else {
      // Fallback: get latest draft for user (for backward compatibility)
      query = query
        .eq('user_id', userId)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching opportunity progress:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Unexpected error fetching opportunity progress:', error);
    return { 
      error: { 
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      } 
    };
  }
}

/**
 * Create a new admin opportunity
 */
export async function createAdminOpportunity(
  opportunityId: string,
  opportunityType: 'job' | 'funding' | 'training',
  ngoUserId?: string
) {
  try {
    // Use the provided NGO user_id if available, otherwise fall back to admin user
    const userId = ngoUserId || await getAdminUserId();
    
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated. Please ensure at least one admin user exists in the system.'
      };
    }
    
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        id: opportunityId,
        title: 'Draft Opportunity',
        opportunity_type: opportunityType,
        user_id: userId,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating initial opportunity:', error);
      return {
        success: false,
        error: 'Failed to create opportunity. Please try again.'
      };
    }
    
    return {
      success: true,
      opportunity: data
    };
    
  } catch (error) {
    console.error('Error creating initial opportunity:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the opportunity.'
    };
  }
}

/**
 * Save final admin opportunity (complete)
 */
export async function saveAdminOpportunity(data: {
  opportunityId: string;
  title: string;
  description: string;
  location?: string;
  hours?: string;
  opportunityType: 'job' | 'funding' | 'training';
  criteria?: any;
  ngoUserId?: string;
}) {
  try {
    // Use the provided NGO user_id if available, otherwise fall back to admin user
    const userId = data.ngoUserId || await getAdminUserId();
    
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated. Please ensure at least one admin user exists in the system.'
      };
    }
    
    // Update the opportunity
    const { data: updatedOpportunity, error: updateError } = await supabase
      .from('opportunities')
      .update({
        title: data.title,
        opportunity_type: data.opportunityType,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.opportunityId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating opportunity:', updateError);
      return {
        success: false,
        error: 'Failed to update opportunity. Please try again.'
      };
    }
    
    // Update or create opportunity_description
    const { data: existingDesc } = await supabase
      .from('opportunity_description')
      .select('id')
      .eq('opportunity_id', data.opportunityId)
      .maybeSingle();
    
    if (existingDesc) {
      // Update existing
      const { error: descError } = await supabase
        .from('opportunity_description')
        .update({
          title: data.title,
          description: data.description,
          location: data.location || null,
          hours: data.hours || null,
          status: 'completed',
          step: 'submission',
          criteria: data.criteria || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDesc.id);
      
      if (descError) {
        console.error('Error updating opportunity description:', descError);
      }
    } else {
      // Create new
      const { error: descError } = await supabase
        .from('opportunity_description')
        .insert({
          user_id: userId,
          opportunity_id: data.opportunityId,
          title: data.title,
          description: data.description,
          location: data.location || null,
          hours: data.hours || null,
          status: 'completed',
          step: 'submission',
          criteria: data.criteria || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (descError) {
        console.error('Error creating opportunity description:', descError);
      }
    }
    
    return {
      success: true,
      opportunity: updatedOpportunity
    };
    
  } catch (error) {
    console.error('Error saving admin opportunity:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the opportunity.'
    };
  }
}
