import { EvaluationTemplate } from '../types';

export async function saveAdminEvaluationTemplate(template: Omit<EvaluationTemplate, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const response = await fetch('/api/admin/evaluation-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...template,
        user_id: 'admin-user-id' // TODO: Get actual admin user ID
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save evaluation template');
    }

    return { success: true, template: data.template };
  } catch (error) {
    console.error('Error saving evaluation template:', error);
    throw error;
  }
}

export async function updateAdminEvaluationTemplate(id: string, template: Partial<EvaluationTemplate>) {
  try {
    const response = await fetch('/api/admin/evaluation-templates', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...template
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update evaluation template');
    }

    return { success: true, template: data.template };
  } catch (error) {
    console.error('Error updating evaluation template:', error);
    throw error;
  }
}

export async function getAdminEvaluationTemplates(): Promise<EvaluationTemplate[]> {
  try {
    const response = await fetch('/api/admin/evaluation-templates');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch evaluation templates');
    }

    return data.templates || [];
  } catch (error) {
    console.error('Error fetching evaluation templates:', error);
    throw error;
  }
}

export async function deleteAdminEvaluationTemplate(id: string) {
  try {
    const response = await fetch(`/api/admin/evaluation-templates?id=${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete evaluation template');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting evaluation template:', error);
    throw error;
  }
}

export async function publishAdminEvaluationTemplate(id: string, published: boolean) {
  try {
    const response = await fetch('/api/admin/templates/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: id,
        templateType: 'evaluation',
        published
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update evaluation template status');
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error updating evaluation template status:', error);
    throw error;
  }
}

export async function getAdminEvaluationTemplateById(id: string): Promise<EvaluationTemplate | null> {
  try {
    const templates = await getAdminEvaluationTemplates();
    return templates.find(template => template.id === id) || null;
  } catch (error) {
    console.error('Error fetching evaluation template by ID:', error);
    throw error;
  }
} 