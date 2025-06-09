import { createClient } from '@supabase/supabase-js';
import { Template } from './NewTemplate';

// Initialize Supabase client - replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Table name
const TEMPLATES_TABLE = 'offres_templates';

// Save a template to the database
export async function saveTemplate(template: Template): Promise<{ data: Template | null; error: any }> {
  // If template has an ID, we're updating an existing template
  if (template.id && template.id !== Date.now().toString()) {
    const { data, error } = await supabase
      .from(TEMPLATES_TABLE)
      .update({
        title: template.title,
        description: template.description,
        fields: template.fields
      })
      .eq('id', template.id)
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
      created_at: new Date()
    };

    const { data, error } = await supabase
      .from(TEMPLATES_TABLE)
      .insert([newTemplate])
      .select()
      .single();
    
    return { data, error };
  }
}

// Get all templates
export async function getTemplates(): Promise<{ data: Template[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

// Delete a template
export async function deleteTemplate(templateId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from(TEMPLATES_TABLE)
    .delete()
    .eq('id', templateId);
  
  return { error };
}

// Get a template by ID
export async function getTemplateById(templateId: string): Promise<{ data: Template | null; error: any }> {
  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select('*')
    .eq('id', templateId)
    .single();
  
  return { data, error };
} 