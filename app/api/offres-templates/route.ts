import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force runtime execution - don't execute during build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase client to avoid build-time execution
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Generate a UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch both NGO templates and published admin templates
    const { data: templates, error } = await supabase
      .from('offres_templates')
      .select('*')
      .or('is_admin_template.eq.false,and(is_admin_template.eq.true,published.eq.true)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offres templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('Error in GET /api/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Template title is required' }, { status: 400 });
    }
    
    const templateData = {
      id: generateUUID(), // Generate UUID for new template
      title: body.title.trim(),
      description: body.description || '',
      fields: body.fields || [],
      published: false,
      is_admin_template: false,
      created_by: body.created_by || null // NGO user ID
    };

    const { data: template, error } = await supabase
      .from('offres_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating NGO offres template:', error);
      return NextResponse.json({ error: `Failed to create template: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error('Error in POST /api/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }
    
    if (!updates.title || !updates.title.trim()) {
      return NextResponse.json({ error: 'Template title is required' }, { status: 400 });
    }

    const updateData = {
      title: updates.title.trim(),
      description: updates.description || '',
      fields: updates.fields || [],
      updated_at: new Date().toISOString()
    };

    const { data: template, error } = await supabase
      .from('offres_templates')
      .update(updateData)
      .eq('id', id)
      .eq('is_admin_template', false) // Only update NGO templates
      .select()
      .single();

    if (error) {
      console.error('Error updating NGO offres template:', error);
      return NextResponse.json({ error: `Failed to update template: ${error.message}` }, { status: 500 });
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found or cannot be edited' }, { status: 404 });
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error('Error in PATCH /api/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('offres_templates')
      .delete()
      .eq('id', id)
      .eq('is_admin_template', false); // Only delete NGO templates

    if (error) {
      console.error('Error deleting NGO offres template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/offres-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 