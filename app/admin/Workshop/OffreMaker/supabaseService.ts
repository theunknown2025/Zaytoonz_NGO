import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Template } from './NewTemplate';

// Lazy initialization of Supabase client to prevent build-time errors
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build if env vars are missing
    supabase = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseKey || 'placeholder-key'
    );
    return supabase;
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

// Table name
const TEMPLATES_TABLE = 'offres_templates';

// Save a template to the database
export async function saveTemplate(template: Template): Promise<{ data: Template | null; error: any }> {
  const client = getSupabaseClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: 'Missing Supabase environment variables' };
  }

  // If template has an ID, we're updating an existing template
  if (template.id && template.id !== Date.now().toString()) {
    const { data, error } = await client
      .from(TEMPLATES_TABLE)
      .update({
        title: template.title,
        description: template.description,
        fields: template.fields
      })
      .eq('id', template.id)
      .eq('is_admin_template', true) // Only update admin templates
      .select()
      .single();
    
    return { data, error };
  } 
  // Otherwise, we're creating a new template
  else {
    // Create a new UUID for the template
    const newTemplate = {
      ...template,
      id: template.id === Date.now().toString() ? crypto.randomUUID() : template.id,
      created_at: new Date(),
      is_admin_template: true, // Mark as admin template
      published: false // Default to unpublished
    };

    const { data, error } = await client
      .from(TEMPLATES_TABLE)
      .insert([newTemplate])
      .select()
      .single();
    
    return { data, error };
  }
}

// Get all templates (admin templates only)
export async function getTemplates(): Promise<{ data: Template[] | null; error: any }> {
  const client = getSupabaseClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: 'Missing Supabase environment variables' };
  }

  const { data, error } = await client
    .from(TEMPLATES_TABLE)
    .select('*')
    .eq('is_admin_template', true) // Only fetch admin templates
    .order('created_at', { ascending: false });
  
  return { data, error };
}

// Delete a template (admin templates only)
export async function deleteTemplate(templateId: string): Promise<{ error: any }> {
  const client = getSupabaseClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { error: 'Missing Supabase environment variables' };
  }

  const { error } = await client
    .from(TEMPLATES_TABLE)
    .delete()
    .eq('id', templateId)
    .eq('is_admin_template', true); // Only delete admin templates
  
  return { error };
}

// Get a template by ID (admin templates only)
export async function getTemplateById(templateId: string): Promise<{ data: Template | null; error: any }> {
  const client = getSupabaseClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: 'Missing Supabase environment variables' };
  }

  const { data, error } = await client
    .from(TEMPLATES_TABLE)
    .select('*')
    .eq('id', templateId)
    .eq('is_admin_template', true) // Only fetch admin templates
    .single();
  
  return { data, error };
}

// Toggle publish status of a template
export async function toggleTemplatePublish(templateId: string, published: boolean): Promise<{ error: any }> {
  const client = getSupabaseClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { error: 'Missing Supabase environment variables' };
  }

  const { error } = await client
    .from(TEMPLATES_TABLE)
    .update({ published })
    .eq('id', templateId)
    .eq('is_admin_template', true); // Only update admin templates
  
  return { error };
} 