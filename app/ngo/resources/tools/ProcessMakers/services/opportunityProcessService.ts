import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to prevent build-time errors
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during build if env vars are missing
    supabase = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
    return supabase;
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

interface OpportunityProcess {
  id?: string;
  opportunity_id: string;
  process_template_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

interface OpportunityProcessStep {
  id?: string;
  opportunity_process_id: string;
  process_step_id: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

/**
 * Save or update an opportunity process
 */
export async function saveOpportunityProcess(opportunityId: string, processTemplateId: string, status: string = 'active') {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Check if there's an existing record
    const { data: existingData, error: fetchError } = await client
      .from('opportunity_processes')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // This means there was an error other than "no rows returned"
      throw fetchError;
    }
    
    let result;
    
    if (existingData) {
      // Update the existing record
      const { data, error } = await client
        .from('opportunity_processes')
        .update({
          process_template_id: processTemplateId,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert a new record
      const { data, error } = await client
        .from('opportunity_processes')
        .insert({
          opportunity_id: opportunityId,
          process_template_id: processTemplateId,
          status,
          created_by: null // Use a default system user ID or null
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error('Error saving opportunity process:', error);
    throw error;
  }
}

/**
 * Initialize process steps for an opportunity
 */
export async function initializeOpportunityProcessSteps(opportunityProcessId: string, processTemplateId: string) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // First, get all steps for this process template
    const { data: templateSteps, error: stepsError } = await client
      .from('process_steps')
      .select('*')
      .eq('process_template_id', processTemplateId)
      .order('display_order', { ascending: true });
    
    if (stepsError) throw stepsError;
    if (!templateSteps || templateSteps.length === 0) {
      return []; // No steps to initialize
    }
    
    // Prepare the steps for initialization with default 'pending' status
    const stepsToInsert = templateSteps.map(step => ({
      opportunity_process_id: opportunityProcessId,
      process_step_id: step.id,
      status: 'pending', // Default status
      notes: '',
    }));
    
    // Insert all steps for this opportunity process
    const { data, error } = await client
      .from('opportunity_process_steps')
      .insert(stepsToInsert)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error initializing opportunity process steps:', error);
    throw error;
  }
}

/**
 * Get an opportunity process with its steps
 */
export async function getOpportunityProcess(opportunityId: string) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get the process
    const { data: process, error: processError } = await client
      .from('opportunity_processes')
      .select('*, process_template:process_template_id(*)')
      .eq('opportunity_id', opportunityId)
      .single();
    
    if (processError) {
      if (processError.code === 'PGRST116') {
        // No data found
        return null;
      }
      throw processError;
    }
    
    // Get the steps
    const { data: steps, error: stepsError } = await client
      .from('opportunity_process_steps')
      .select('*, process_step:process_step_id(*)')
      .eq('opportunity_process_id', process.id)
      .order('process_step(display_order)', { ascending: true });
    
    if (stepsError) throw stepsError;
    
    return {
      process,
      steps: steps || []
    };
  } catch (error) {
    console.error('Error fetching opportunity process:', error);
    throw error;
  }
}

/**
 * Update the status of a process step
 */
export async function updateOpportunityProcessStep(stepId: string, status: string, notes?: string) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const { data, error } = await client
      .from('opportunity_process_steps')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating opportunity process step:', error);
    throw error;
  }
}

/**
 * Delete an opportunity process and its steps
 */
export async function deleteOpportunityProcess(opportunityId: string) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // First, get the process record
    const { data: process, error: processError } = await client
      .from('opportunity_processes')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .single();
    
    if (processError) {
      if (processError.code === 'PGRST116') {
        // No data found, nothing to delete
        return true;
      }
      throw processError;
    }
    
    // Delete all steps first (foreign key constraint)
    const { error: stepsDeleteError } = await client
      .from('opportunity_process_steps')
      .delete()
      .eq('opportunity_process_id', process.id);
    
    if (stepsDeleteError) throw stepsDeleteError;
    
    // Then delete the process
    const { error: processDeleteError } = await client
      .from('opportunity_processes')
      .delete()
      .eq('id', process.id);
    
    if (processDeleteError) throw processDeleteError;
    
    return true;
  } catch (error) {
    console.error('Error deleting opportunity process:', error);
    throw error;
  }
} 