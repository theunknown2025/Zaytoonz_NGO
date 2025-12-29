import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Force dynamic rendering since we use Supabase which requires runtime environment variables
export const dynamic = 'force-dynamic';

// Default admin user UUID from the database (admin@zaytoonz.com)
const DEFAULT_ADMIN_USER_ID = 'bd360d39-542f-4aa0-8826-3e0a831de9bd';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific template by ID - filter by admin user
      console.log('Fetching specific admin form template:', id);
      
      const { data: template, error } = await supabase
        .from('forms_templates')
        .select('*')
        .eq('id', id)
        .eq('is_admin_template', true)
        .eq('user_id', DEFAULT_ADMIN_USER_ID) // Only show forms created by admin
        .single();

      if (error) {
        console.error('Error fetching admin form template by ID:', error);
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
      }

      console.log('Successfully fetched admin form template by ID:', template);
      return NextResponse.json({ template });
    } else {
      // Get all templates created by admin user only
      console.log('Fetching admin user templates only');
      
      const { data: templates, error } = await supabase
        .from('forms_templates')
        .select('*')
        .eq('is_admin_template', true)
        .eq('user_id', DEFAULT_ADMIN_USER_ID) // Only show forms created by admin
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin forms templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
      }

      console.log(`Successfully fetched ${templates?.length || 0} admin user form templates`);
      return NextResponse.json({ templates });
    }
  } catch (error) {
    console.error('Error in GET /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Creating admin form template with body:', body);
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    if (!body.sections || !Array.isArray(body.sections) || body.sections.length === 0) {
      return NextResponse.json({ error: 'At least one section is required' }, { status: 400 });
    }
    
    const templateData = {
      title: body.title,
      description: body.description || '',
      sections: body.sections,
      status: 'draft',
      published: false,
      is_admin_template: true,
      user_id: body.user_id || DEFAULT_ADMIN_USER_ID
    };

    console.log('Inserting template data:', templateData);

    const { data: template, error } = await supabase
      .from('forms_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin forms template:', error);
      return NextResponse.json({ error: 'Failed to create template: ' + error.message }, { status: 500 });
    }

    console.log('Successfully created admin form template:', template);
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in POST /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    console.log('Updating admin form template:', { id, updates });

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Ensure the template remains an admin template
    const updateData = {
      ...updates,
      is_admin_template: true,
      updated_at: new Date().toISOString()
    };

    const { data: template, error } = await supabase
      .from('forms_templates')
      .update(updateData)
      .eq('id', id)
      .eq('is_admin_template', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin forms template:', error);
      return NextResponse.json({ error: 'Failed to update template: ' + error.message }, { status: 500 });
    }

    console.log('Successfully updated admin form template:', template);
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in PATCH /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    console.log('Deleting admin form template:', id);

    const { error } = await supabase
      .from('forms_templates')
      .delete()
      .eq('id', id)
      .eq('is_admin_template', true);

    if (error) {
      console.error('Error deleting admin forms template:', error);
      return NextResponse.json({ error: 'Failed to delete template: ' + error.message }, { status: 500 });
    }

    console.log('Successfully deleted admin form template:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 