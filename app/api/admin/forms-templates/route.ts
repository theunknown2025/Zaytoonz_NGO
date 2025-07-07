import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: templates, error } = await supabase
      .from('forms_templates')
      .select('*')
      .eq('is_admin_template', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin forms templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const templateData = {
      title: body.title,
      description: body.description,
      sections: body.sections,
      status: 'draft',
      published: false,
      is_admin_template: true,
      user_id: body.user_id // Admin user ID
    };

    const { data: template, error } = await supabase
      .from('forms_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin forms template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in POST /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: template, error } = await supabase
      .from('forms_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_admin_template', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin forms template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in PATCH /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('forms_templates')
      .delete()
      .eq('id', id)
      .eq('is_admin_template', true);

    if (error) {
      console.error('Error deleting admin forms template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/forms-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 