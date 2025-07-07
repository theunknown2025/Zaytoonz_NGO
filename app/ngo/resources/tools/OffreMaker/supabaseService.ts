import { Template } from './NewTemplate';

// Save a template to the database
export async function saveTemplate(template: Template): Promise<{ data: Template | null; error: any }> {
  try {
    // Check if this is an existing template with a database ID (UUID format)
    // New templates will have Date.now().toString() or no ID
    const isExistingTemplate = template.id && 
      template.id.length > 13 && // UUID is longer than timestamp
      !template.id.match(/^\d+$/); // Not just numbers (timestamp)
    
    if (isExistingTemplate) {
      // Update existing template
      const response = await fetch('/api/offres-templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: template.id,
          title: template.title,
          description: template.description,
          fields: template.fields
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to update template' };
      }

      const result = await response.json();
      return { data: result.data, error: null };
    } else {
      // Create new template (don't send ID, let database generate it)
      const response = await fetch('/api/offres-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          fields: template.fields
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to create template' };
      }

      const result = await response.json();
      return { data: result.data, error: null };
    }
  } catch (error) {
    console.error('Error in saveTemplate:', error);
    return { data: null, error: 'Network error occurred' };
  }
}

// Get all templates (NGO templates + published admin templates)
export async function getTemplates(): Promise<{ data: Template[] | null; error: any }> {
  try {
    const response = await fetch('/api/offres-templates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch templates' };
    }

    const result = await response.json();
    return { data: result.data || [], error: null };
  } catch (error) {
    console.error('Error in getTemplates:', error);
    return { data: null, error: 'Network error occurred' };
  }
}

// Get only NGO templates (for editing/deleting purposes)
export async function getNGOTemplates(): Promise<{ data: Template[] | null; error: any }> {
  try {
    const response = await fetch('/api/offres-templates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch templates' };
    }

    const result = await response.json();
    // Filter to only NGO templates
    const ngoTemplates = (result.data || []).filter((template: Template) => !template.is_admin_template);
    return { data: ngoTemplates, error: null };
  } catch (error) {
    console.error('Error in getNGOTemplates:', error);
    return { data: null, error: 'Network error occurred' };
  }
}

// Get only published admin templates
export async function getPublishedAdminTemplates(): Promise<{ data: Template[] | null; error: any }> {
  try {
    const response = await fetch('/api/offres-templates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch templates' };
    }

    const result = await response.json();
    // Filter to only published admin templates
    const adminTemplates = (result.data || []).filter((template: Template) => 
      template.is_admin_template && template.published
    );
    return { data: adminTemplates, error: null };
  } catch (error) {
    console.error('Error in getPublishedAdminTemplates:', error);
    return { data: null, error: 'Network error occurred' };
  }
}

// Delete a template (NGO templates only)
export async function deleteTemplate(templateId: string): Promise<{ error: any }> {
  try {
    const response = await fetch(`/api/offres-templates?id=${templateId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to delete template' };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    return { error: 'Network error occurred' };
  }
}

// Get a template by ID (NGO templates only)
export async function getTemplateById(templateId: string): Promise<{ data: Template | null; error: any }> {
  try {
    // First get all templates
    const { data: templates, error } = await getTemplates();
    
    if (error) {
      return { data: null, error };
    }

    // Find the specific template
    const template = templates?.find(t => t.id === templateId && !t.is_admin_template);
    
    if (!template) {
      return { data: null, error: 'Template not found' };
    }

    return { data: template, error: null };
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    return { data: null, error: 'Network error occurred' };
  }
} 