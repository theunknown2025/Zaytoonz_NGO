import { NextRequest, NextResponse } from 'next/server';
import {
  enhanceOpportunityDescription,
  type EnhanceDescriptionInput,
} from '@/app/ngo/opportunities/descriptionEnhancer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EnhanceDescriptionInput;

    if (!body?.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Description text is required' }, { status: 400 });
    }

    const result = await enhanceOpportunityDescription({
      text: body.text,
      title: typeof body.title === 'string' ? body.title : undefined,
      opportunityType: body.opportunityType ?? '',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Description enhancement error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to enhance description';
    const status = message.includes('not configured') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
