import { NextRequest, NextResponse } from 'next/server';

// Mock data for now - this will be replaced with actual database queries
const mockEvaluations = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Technical Skills Assessment',
    description: 'Evaluate technical competencies and problem-solving abilities',
    scale: 10,
    criteria: [
      { label: 'Technical Skills', value: 10 },
      { label: 'Problem Solving', value: 10 },
      { label: 'Communication', value: 10 },
      { label: 'Teamwork', value: 10 },
      { label: 'Leadership', value: 10 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Leadership Potential',
    description: 'Assess leadership qualities and management capabilities',
    scale: 5,
    criteria: [
      { label: 'Vision', value: 5 },
      { label: 'Decision Making', value: 5 },
      { label: 'Team Management', value: 5 },
      { label: 'Strategic Thinking', value: 5 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Cultural Fit',
    description: 'Evaluate alignment with organizational values and culture',
    scale: 10,
    criteria: [
      { label: 'Values Alignment', value: 10 },
      { label: 'Adaptability', value: 10 },
      { label: 'Initiative', value: 10 },
      { label: 'Collaboration', value: 10 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// GET /api/evaluations - Get all evaluations for a user
export async function GET() {
  try {
    // In the future, this will query the database:
    // const evaluations = await db.query('SELECT * FROM evaluation_templates ORDER BY created_at DESC');
    
    return NextResponse.json(mockEvaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}

// POST /api/evaluations - Create a new evaluation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, scale, criteria } = body;

    // Validate required fields
    if (!name || !criteria || !Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json(
        { error: 'Name and criteria are required' },
        { status: 400 }
      );
    }

    const newEvaluation = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      scale: scale || 10,
      criteria,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // In the future, this will save to the database:
    // await db.query('INSERT INTO evaluation_templates ...', newEvaluation);
    
    return NextResponse.json(newEvaluation, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
}

// PUT /api/evaluations/[id] - Update an evaluation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, scale, criteria } = body;

    // Validate required fields
    if (!id || !name || !criteria || !Array.isArray(criteria)) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, and criteria' },
        { status: 400 }
      );
    }

    // For now, just return success since we're using localStorage
    // In the future, this would update the database
    const evaluation = {
      id,
      name,
      description: description || '',
      scale: scale || 5,
      criteria,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/evaluations/[id] - Delete an evaluation
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing evaluation ID' },
        { status: 400 }
      );
    }

    // For now, just return success since we're using localStorage
    // In the future, this would delete from the database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 