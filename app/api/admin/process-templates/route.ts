import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    
    const { data: templates, error } = await supabase
      .from('process_templates')
      .select(`
        *,
        process_steps (
          id,
          name,
          description,
          status_options,
          display_order
        )
      `)
      .eq('is_admin_template', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin process templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/admin/process-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const templateData = {
      name: body.name,
      description: body.description,
      status: 'draft',
      published: false,
      is_admin_template: true,
      created_by: body.created_by // Admin user ID
    };

    const { data: template, error } = await supabase
      .from('process_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin process template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    // Create process steps if provided
    if (body.steps && body.steps.length > 0) {
      const stepsData = body.steps.map((step: any, index: number) => ({
        process_template_id: template.id,
        name: step.title,
        description: step.description,
        status_options: JSON.stringify(['pending', 'in-progress', 'completed', 'blocked']),
        display_order: index + 1
      }));

      const { error: stepsError } = await supabase
        .from('process_steps')
        .insert(stepsData);

      if (stepsError) {
        console.error('Error creating process steps:', stepsError);
        // Delete the template if steps creation fails
        await supabase.from('process_templates').delete().eq('id', template.id);
        return NextResponse.json({ error: 'Failed to create process steps' }, { status: 500 });
      }
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in POST /api/admin/process-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, steps, ...updates } = body;

    const { data: template, error } = await supabase
      .from('process_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_admin_template', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin process template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    // Update process steps if provided
    if (steps) {
      // Delete existing steps
      await supabase
        .from('process_steps')
        .delete()
        .eq('process_template_id', id);

      // Create new steps
      if (steps.length > 0) {
        const stepsData = steps.map((step: any, index: number) => ({
          process_template_id: id,
          name: step.title,
          description: step.description,
          status_options: JSON.stringify(['pending', 'in-progress', 'completed', 'blocked']),
          display_order: index + 1
        }));

        const { error: stepsError } = await supabase
          .from('process_steps')
          .insert(stepsData);

        if (stepsError) {
          console.error('Error updating process steps:', stepsError);
          return NextResponse.json({ error: 'Failed to update process steps' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in PATCH /api/admin/process-templates:', error);
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

    // Delete associated process steps first
    await supabase
      .from('process_steps')
      .delete()
      .eq('process_template_id', id);

    // Delete the template
    const { error } = await supabase
      .from('process_templates')
      .delete()
      .eq('id', id)
      .eq('is_admin_template', true);

    if (error) {
      console.error('Error deleting admin process template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/process-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 