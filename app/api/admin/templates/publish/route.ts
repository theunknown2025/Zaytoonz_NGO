import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Force dynamic rendering since we use Supabase which requires runtime environment variables
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, templateType, published } = body;

    console.log('Publish request received:', { templateId, templateType, published });

    if (!templateId || !templateType) {
      return NextResponse.json({ error: 'Template ID and type are required' }, { status: 400 });
    }

    let tableName;
    switch (templateType) {
      case 'forms':
        tableName = 'forms_templates';
        break;
      case 'offres':
        tableName = 'offres_templates';
        break;
      case 'evaluation':
        tableName = 'evaluation_templates';
        break;
      case 'process':
        tableName = 'process_templates';
        break;
      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }

    console.log(`Updating ${tableName} table for template ${templateId}`);

    const { data: template, error } = await supabase
      .from(tableName)
      .update({
        published: published,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .eq('is_admin_template', true)
      .select()
      .single();

    if (error) {
      console.error(`Error ${published ? 'publishing' : 'unpublishing'} ${templateType} template:`, error);
      return NextResponse.json({ 
        error: `Failed to ${published ? 'publish' : 'unpublish'} template: ${error.message}` 
      }, { status: 500 });
    }

    console.log(`Template ${published ? 'published' : 'unpublished'} successfully:`, template);

    return NextResponse.json({ 
      template,
      message: `Template ${published ? 'published' : 'unpublished'} successfully!`
    });
  } catch (error) {
    console.error('Error in POST /api/admin/templates/publish:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 