import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type OpportunityType = 'job' | 'funding' | 'training';

export interface OpportunityData {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  requirements?: string;
  startDate?: string;
  endDate?: string;
  hours?: string;
  skills?: string;
  categories?: string[];
  opportunity_type: OpportunityType;
  applicationMethod?: 'form' | 'email';
  selectedFormId?: string;
  contactEmails?: string[];
  referenceCodes?: string[];
}

export interface CreateOpportunityResponse {
  success: boolean;
  opportunity?: any;
  error?: string;
}

export interface UpdateOpportunityResponse {
  success: boolean;
  opportunity?: any;
  error?: string;
}

/**
 * Create a new opportunity with basic information
 */
export const createInitialOpportunity = async (
  opportunityId: string,
  opportunityType: OpportunityType
): Promise<CreateOpportunityResponse> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        id: opportunityId,
        title: 'Draft Opportunity', // Placeholder title that will be updated later
        opportunity_type: opportunityType,
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
};

/**
 * Update an existing opportunity
 */
export const updateOpportunity = async (
  opportunityId: string,
  updateData: Partial<OpportunityData>
): Promise<UpdateOpportunityResponse> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating opportunity:', error);
      return {
        success: false,
        error: 'Failed to update opportunity. Please try again.'
      };
    }
    
    return {
      success: true,
      opportunity: data
    };
    
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the opportunity.'
    };
  }
};

/**
 * Update only the opportunity type
 */
export const updateOpportunityType = async (
  opportunityId: string,
  opportunityType: OpportunityType
): Promise<UpdateOpportunityResponse> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update({
        opportunity_type: opportunityType,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating opportunity type:', error);
      return {
        success: false,
        error: 'Failed to update opportunity type. Please try again.'
      };
    }
    
    return {
      success: true,
      opportunity: data
    };
    
  } catch (error) {
    console.error('Error updating opportunity type:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the opportunity type.'
    };
  }
};

/**
 * Get opportunity by ID
 */
export const getOpportunityById = async (opportunityId: string) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
      
    if (error) {
      console.error('Error fetching opportunity:', error);
      return {
        success: false,
        error: 'Failed to fetch opportunity.'
      };
    }
    
    return {
      success: true,
      opportunity: data
    };
    
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the opportunity.'
    };
  }
};

/**
 * Delete opportunity by ID
 */
export const deleteOpportunity = async (opportunityId: string) => {
  try {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', opportunityId);
      
    if (error) {
      console.error('Error deleting opportunity:', error);
      return {
        success: false,
        error: 'Failed to delete opportunity.'
      };
    }
    
    return {
      success: true
    };
    
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the opportunity.'
    };
  }
};

/**
 * Get all opportunities with optional filtering by type
 */
export const getOpportunities = async (opportunityType?: OpportunityType) => {
  try {
    let query = supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (opportunityType) {
      query = query.eq('opportunity_type', opportunityType);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching opportunities:', error);
      return {
        success: false,
        error: 'Failed to fetch opportunities.'
      };
    }
    
    return {
      success: true,
      opportunities: data
    };
    
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching opportunities.'
    };
  }
};

// Cache for user ID to prevent multiple database calls
let cachedUserId: string | null = null;

interface OpportunityProgressData {
  title: string;
  description: string;
  location?: string;
  hours?: string;
  status?: string;
  step?: string;
  opportunity_id?: string;
  metadata?: any; // Store template mode, selected template, and field values
}

/**
 * Gets a valid user ID from the database
 * @returns A user ID that exists in the database
 */
async function getValidUserId() {
  try {
    // Return cached user ID if available
    if (cachedUserId) {
      console.log('Using cached user ID:', cachedUserId);
      return cachedUserId;
    }
    
    console.log('Trying to find an existing user in the database');
    
    // Query to get the first user from the users table
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error fetching users:', error);
      return null;
    }
    
    if (users && users.length > 0) {
      console.log('Found existing user with ID:', users[0].id);
      // Cache the user ID for future use
      cachedUserId = users[0].id;
      return cachedUserId;
    }
    
    console.log('No users found in the database');
    return null;
  } catch (error) {
    console.error('Unexpected error getting valid user ID:', error);
    return null;
  }
}

/**
 * Saves opportunity progress directly to the database
 * @param data Opportunity progress data
 * @returns Result of the database operation
 */
export async function saveOpportunityProgress(data: OpportunityProgressData) {
  try {
    console.log('Saving opportunity progress directly to database');
    
    // Get a valid user ID from the database
    const userId = await getValidUserId();
    
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
 * Gets the latest opportunity progress directly from the database
 * @param opportunityId Optional opportunity ID to get progress for specific opportunity
 * @returns The latest draft or null if none exists
 */
export async function getLatestOpportunityProgress(opportunityId?: string) {
  try {
    // Get a valid user ID
    const userId = await getValidUserId();
    
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
    
    if (error) {
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