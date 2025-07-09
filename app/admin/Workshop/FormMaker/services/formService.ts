import { FormData, FormTemplate } from '../types';

// Default admin user UUID from the database (admin@zaytoonz.com)
const DEFAULT_ADMIN_USER_ID = 'bd360d39-542f-4aa0-8826-3e0a831de9bd';

/**
 * Save an admin form template
 */
export async function saveAdminFormTemplate(
  formData: FormData,
  userId?: string
): Promise<{ success: boolean; formId?: string; error?: string }> {
  try {
    if (!formData.title) {
      return { success: false, error: 'Form title is required' };
    }
    if (!formData.sections || formData.sections.length === 0) {
      return { success: false, error: 'Form must have at least one section' };
    }

    const templateData = {
      title: formData.title,
      description: formData.description || '',
      sections: formData.sections,
      user_id: userId || DEFAULT_ADMIN_USER_ID,
      is_admin_template: true // Explicitly set this flag
    };

    console.log('Saving admin form template with data:', templateData);

    const response = await fetch('/api/admin/forms-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData)
    });

    const data = await response.json();
    console.log('API response:', { status: response.status, data });

    if (response.ok) {
      return { success: true, formId: data.template.id };
    } else {
      return { success: false, error: data.error || 'Failed to save template' };
    }
  } catch (error) {
    console.error('Exception saving admin form template:', error);
    return { success: false, error: 'Failed to save form template' };
  }
}

/**
 * Update an existing admin form template
 */
export async function updateAdminFormTemplate(
  formId: string,
  formData: Partial<FormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData = {
      id: formId,
      ...formData,
      is_admin_template: true // Ensure this remains true during updates
    };

    console.log('Updating admin form template with data:', updateData);

    const response = await fetch('/api/admin/forms-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    console.log('Update API response:', { status: response.status, data });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to update template' };
    }
  } catch (error) {
    console.error('Exception updating admin form template:', error);
    return { success: false, error: 'Failed to update form template' };
  }
}

/**
 * Get all admin form templates
 */
export async function getAdminFormTemplates(): Promise<{ success: boolean; templates?: FormTemplate[]; error?: string }> {
  try {
    const response = await fetch('/api/admin/forms-templates');
    const data = await response.json();

    if (response.ok) {
      return { success: true, templates: data.templates || [] };
    } else {
      return { success: false, error: data.error || 'Failed to fetch templates' };
    }
  } catch (error) {
    console.error('Exception fetching admin form templates:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}

/**
 * Delete an admin form template
 */
export async function deleteAdminFormTemplate(
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/admin/forms-templates?id=${templateId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to delete template' };
    }
  } catch (error) {
    console.error('Exception deleting admin form template:', error);
    return { success: false, error: 'Failed to delete template' };
  }
}

/**
 * Publish an admin form template
 */
export async function publishAdminFormTemplate(
  templateId: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/templates/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        templateType: 'forms',
        published
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to update template status' };
    }
  } catch (error) {
    console.error('Exception publishing admin form template:', error);
    return { success: false, error: 'Failed to update template status' };
  }
}

/**
 * Get a single admin form template by ID
 */
export async function getAdminFormTemplateById(
  templateId: string
): Promise<{ success: boolean; template?: FormTemplate; error?: string }> {
  try {
    console.log('Fetching admin form template by ID:', templateId);
    
    // Make a direct API call to get the specific template
    const response = await fetch(`/api/admin/forms-templates?id=${templateId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching template by ID:', errorData);
      return { success: false, error: errorData.error || 'Failed to fetch template' };
    }
    
    const data = await response.json();
    
    if (data.template) {
      console.log('Successfully fetched template by ID:', data.template);
      return { success: true, template: data.template };
    } else {
      // Fallback to getting all templates and finding the one we need
      console.log('Template not found directly, trying fallback method');
      const { success, templates } = await getAdminFormTemplates();
      
      if (!success || !templates) {
        return { success: false, error: 'Failed to fetch templates' };
      }

      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      return { success: true, template };
    }
  } catch (error) {
    console.error('Exception fetching admin form template by ID:', error);
    return { success: false, error: 'Failed to fetch template' };
  }
} 