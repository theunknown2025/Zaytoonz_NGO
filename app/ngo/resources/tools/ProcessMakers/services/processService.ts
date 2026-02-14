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

export interface ProcessTemplate {
  id?: string;
  name: string;
  description: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ProcessStep {
  id?: string;
  process_template_id?: string;
  name: string;
  description: string;
  status_options: string[];
  display_order: number;
  created_at?: string;
}

/**
 * Create a new process template with its steps
 */
export async function createProcessTemplate(
  template: ProcessTemplate, 
  steps: Omit<ProcessStep, 'process_template_id' | 'display_order'>[]
) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Insert the process template without requiring authentication
    // Use a default value for created_by if authentication is needed in the database
    const { data: templateData, error: templateError } = await client
      .from('process_templates')
      .insert({
        ...template,
        // Use a default system user ID or null for created_by
        created_by: null
      })
      .select()
      .single();

    if (templateError) throw templateError;
    
    // Insert the steps with the template ID
    const stepsWithIds = steps.map((step, index) => ({
      ...step,
      process_template_id: templateData.id,
      display_order: index + 1,
      status_options: JSON.stringify(step.status_options)
    }));

    const { data: stepsData, error: stepsError } = await client
      .from('process_steps')
      .insert(stepsWithIds)
      .select();

    if (stepsError) throw stepsError;

    return {
      template: templateData,
      steps: stepsData
    };
  } catch (error) {
    console.error('Error creating process template:', error);
    throw error;
  }
}

/**
 * Get all process templates
 */
export async function getProcessTemplates() {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const { data, error } = await client
      .from('process_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching process templates:', error);
    throw error;
  }
}

/**
 * Get a process template by id with its steps
 */
export async function getProcessTemplateWithSteps(id: string) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get the template
    const { data: template, error: templateError } = await client
      .from('process_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError) throw templateError;

    // Get the steps
    const { data: steps, error: stepsError } = await client
      .from('process_steps')
      .select('*')
      .eq('process_template_id', id)
      .order('display_order', { ascending: true });

    if (stepsError) throw stepsError;

    // Parse status_options from JSON to array for each step
    const parsedSteps = steps.map(step => ({
      ...step,
      status_options: JSON.parse(step.status_options)
    }));

    return {
      template,
      steps: parsedSteps
    };
  } catch (error) {
    console.error('Error fetching process template with steps:', error);
    throw error;
  }
}

/**
 * Delete a process template
 */
export async function deleteProcessTemplate(id: string) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const { error } = await client
      .from('process_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting process template:', error);
    throw error;
  }
}

/**
 * Update a process template
 */
export async function updateProcessTemplate(
  id: string,
  template: Partial<ProcessTemplate>,
  steps?: Omit<ProcessStep, 'process_template_id'>[]
) {
  try {
    const client = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Update the template
    const { data: templateData, error: templateError } = await client
      .from('process_templates')
      .update({
        ...template,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (templateError) throw templateError;

    // If steps are provided, handle them
    if (steps) {
      // First delete all existing steps
      const { error: deleteError } = await client
        .from('process_steps')
        .delete()
        .eq('process_template_id', id);

      if (deleteError) throw deleteError;

      // Then insert the new steps
      const stepsWithIds = steps.map((step, index) => ({
        ...step,
        process_template_id: id,
        display_order: step.display_order || index + 1,
        status_options: JSON.stringify(step.status_options)
      }));

      const { data: stepsData, error: stepsError } = await client
        .from('process_steps')
        .insert(stepsWithIds)
        .select();

      if (stepsError) throw stepsError;

      return {
        template: templateData,
        steps: stepsData
      };
    }

    return {
      template: templateData
    };
  } catch (error) {
    console.error('Error updating process template:', error);
    throw error;
  }
} 