import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Retrieve CV details by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cvId = params.id;

    if (!cvId) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    // Fetch CV basic information
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .single();

    if (cvError) {
      console.error('Error fetching CV:', cvError);
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    const [
      { data: workExperiences },
      { data: education },
      { data: skills },
      { data: languages },
      { data: certificates },
      { data: projects }
    ] = await Promise.all([
      supabase.from('cv_work_experiences').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_education').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_skills').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_languages').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_certificates').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_projects').select('*').eq('cv_id', cvId).order('sort_order')
    ]);

    // Construct full CV data
    const fullCVData = {
      ...cv,
      work_experiences: workExperiences || [],
      education: education || [],
      skills: skills || [],
      languages: languages || [],
      certificates: certificates || [],
      projects: projects || []
    };

    return NextResponse.json(fullCVData, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 