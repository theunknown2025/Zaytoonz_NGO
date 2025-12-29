import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Force dynamic rendering since we use Supabase which requires runtime environment variables
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    
    const { data: templates, error } = await supabase
      .from('offres_templates')
      .select('*')
      .eq('is_admin_template', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin offres templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/admin/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const templateData = {
      title: body.title,
      description: body.description,
      fields: body.fields,
      published: false,
      is_admin_template: true,
      created_by: body.created_by // Admin user ID
    };

    const { data: template, error } = await supabase
      .from('offres_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin offres template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in POST /api/admin/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: template, error } = await supabase
      .from('offres_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_admin_template', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin offres template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in PATCH /api/admin/offres-templates:', error);
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

    const { error } = await supabase
      .from('offres_templates')
      .delete()
      .eq('id', id)
      .eq('is_admin_template', true);

    if (error) {
      console.error('Error deleting admin offres template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 