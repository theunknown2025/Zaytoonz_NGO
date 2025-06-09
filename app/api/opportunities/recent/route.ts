import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Fetch opportunities with their descriptions
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/opportunities?select=*,opportunity_description(*)&order=created_at.desc&limit=15`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const transformedData = data.map((opp: any) => {
      // Get the first description if available
      const description = opp.opportunity_description?.[0];
      
      return {
        id: opp.id,
        title: opp.title,
        opportunity_type: opp.opportunity_type,
        created_at: opp.created_at,
        description_title: description?.title || opp.title,
        description: description?.description || '',
        location: description?.location || '',
        hours: description?.hours || '',
        status: description?.status || 'draft'
      };
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error fetching opportunities:', error);
    
    // Fallback: return empty array if database fails
    return NextResponse.json([]);
  }
} 