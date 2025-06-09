import { NextRequest, NextResponse } from 'next/server';

// For now, these are placeholder endpoints since we don't have direct database access
// In a real implementation, these would handle the database operations

interface EvaluationData {
  criteria: Array<{
    label: string;
    score: number;
  }>;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  notes: string;
  evaluatedAt: string;
  evaluatedBy: string;
}

// GET - Retrieve evaluation for an application
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const evaluationId = searchParams.get('evaluationId');
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    // const evaluationResult = await supabase
    //   .from('application_evaluations')
    //   .select('*')
    //   .eq('application_id', applicationId)
    //   .eq('evaluation_id', evaluationId || '')
    //   .single();

    // For now, return placeholder data or indicate no evaluation found
    return NextResponse.json({
      evaluation: null,
      message: 'Evaluation system using localStorage for now'
    });

  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}

// POST - Save evaluation for an application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationId,
      opportunityId,
      evaluationId,
      evaluationData,
      evaluatedBy
    } = body;

    if (!applicationId || !opportunityId || !evaluationId || !evaluationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database insert/update
    // const { data, error } = await supabase
    //   .from('application_evaluations')
    //   .upsert({
    //     application_id: applicationId,
    //     opportunity_id: opportunityId,
    //     evaluation_id: evaluationId,
    //     evaluation_data: evaluationData,
    //     total_score: evaluationData.totalScore,
    //     max_score: evaluationData.maxScore,
    //     percentage_score: evaluationData.percentageScore,
    //     evaluated_by: evaluatedBy,
    //     notes: evaluationData.notes,
    //     updated_at: new Date().toISOString()
    //   })
    //   .select()
    //   .single();

    // For now, acknowledge receipt but indicate localStorage is being used
    return NextResponse.json({
      success: true,
      message: 'Evaluation saved to localStorage (database integration pending)',
      evaluation: {
        id: `eval_${applicationId}_${evaluationId}`,
        ...evaluationData,
        savedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation' },
      { status: 500 }
    );
  }
}

// PUT - Update existing evaluation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      evaluationId,
      applicationId,
      evaluationData,
      evaluatedBy
    } = body;

    if (!evaluationId || !applicationId || !evaluationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database update
    // const { data, error } = await supabase
    //   .from('application_evaluations')
    //   .update({
    //     evaluation_data: evaluationData,
    //     total_score: evaluationData.totalScore,
    //     max_score: evaluationData.maxScore,
    //     percentage_score: evaluationData.percentageScore,
    //     evaluated_by: evaluatedBy,
    //     notes: evaluationData.notes,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', evaluationId)
    //   .select()
    //   .single();

    return NextResponse.json({
      success: true,
      message: 'Evaluation updated in localStorage (database integration pending)',
      evaluation: {
        id: evaluationId,
        ...evaluationData,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to update evaluation' },
      { status: 500 }
    );
  }
}

// DELETE - Remove evaluation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const evaluationId = searchParams.get('evaluationId');
    const applicationId = searchParams.get('applicationId');

    if (!evaluationId || !applicationId) {
      return NextResponse.json(
        { error: 'Evaluation ID and Application ID are required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database delete
    // const { error } = await supabase
    //   .from('application_evaluations')
    //   .delete()
    //   .eq('id', evaluationId)
    //   .eq('application_id', applicationId);

    return NextResponse.json({
      success: true,
      message: 'Evaluation deleted from localStorage (database integration pending)'
    });

  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to delete evaluation' },
      { status: 500 }
    );
  }
} 