import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    if (!formId) {
      return NextResponse.json(
        { error: 'Missing form ID' },
        { status: 400 }
      );
    }

    const { data: form, error } = await supabase
      .from('forms_templates')
      .select('id, title, description, sections')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch form structure' },
        { status: 500 }
      );
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 