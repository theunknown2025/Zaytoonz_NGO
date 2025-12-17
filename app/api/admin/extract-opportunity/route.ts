import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

interface ExtractRequest {
  opportunities: {
    title: string;
    url: string;
    opportunity_type: 'job' | 'funding' | 'training';
    scraped_opportunity_id?: string;
  }[];
}

interface ExtractedContent {
  title?: string;
  description?: string;
  company?: string;
  organization?: string;
  provider?: string;
  location?: string;
  salary_range?: string;
  salary?: string;
  amount?: string;
  cost?: string;
  job_type?: string;
  contract_type?: string;
  employment_type?: string;
  deadline?: string;
  application_deadline?: string;
  [key: string]: unknown;
}

const SCRAPER_URL = process.env.NEXT_PUBLIC_EXTERNAL_SCRAPER_URL || 'http://localhost:8000';

// Heuristic slicer: keep content from the opportunity title to the first "Apply" section.
function extractOpportunitySection(raw: string, title: string): string {
  if (!raw) return '';

  const lower = raw.toLowerCase();
  const titleSnippet = (title || '').toLowerCase().slice(0, 180);
  const startIdx = titleSnippet ? lower.indexOf(titleSnippet) : -1;

  if (startIdx === -1) {
    return raw; // fallback if title not found
  }

  const endMarkers = [
    '\napply now',
    '\napply ',
    '\napply\n',
    ' apply now',
    ' apply ',
    ' apply\n',
    '[apply',
    'apply now',
    'apply today',
    'apply'
  ];

  let endIdx = -1;
  for (const marker of endMarkers) {
    const idx = lower.indexOf(marker, startIdx + titleSnippet.length);
    if (idx !== -1) {
      endIdx = endIdx === -1 ? idx : Math.min(endIdx, idx);
    }
  }

  const sliced = endIdx !== -1 ? raw.slice(startIdx, endIdx) : raw.slice(startIdx);
  const trimmed = sliced.trim();

  // Guard against over-trimming: if we lost almost everything, keep original
  if (trimmed.length < Math.min(500, raw.length * 0.1)) {
    return raw;
  }

  return trimmed;
}

// Main info fields to extract (for table display)
const MAIN_INFO_FIELDS = {
  job: [
    'title', 'company', 'organization', 'location', 'salary_range', 'salary', 
    'contract_type', 'job_type', 'employment_type', 'deadline', 'application_deadline'
  ],
  funding: [
    'title', 'organization', 'location', 'amount', 'deadline', 'application_deadline'
  ],
  training: [
    'title', 'provider', 'organization', 'location', 'cost', 
    'deadline', 'application_deadline'
  ]
};

// POST - Extract FULL content from individual opportunity URLs
export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequest = await request.json();
    const { opportunities } = body;

    if (!opportunities || !Array.isArray(opportunities) || opportunities.length === 0) {
      return NextResponse.json({ error: 'Opportunities array is required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const opp of opportunities) {
      try {
        if (!opp.url || !opp.url.startsWith('http')) {
          errors.push({ title: opp.title, url: opp.url, error: 'Invalid URL' });
          continue;
        }

        // Check if already extracted
        const { data: existing } = await supabase
          .from('extracted_opportunity_content')
          .select('id')
          .eq('source_url', opp.url)
          .single();

        if (existing) {
          results.push({ 
            id: existing.id, 
            title: opp.title, 
            url: opp.url, 
            status: 'already_extracted',
            message: 'Content already extracted for this URL'
          });
          continue;
        }

        // STEP 1: Get the FULL RAW CONTENT from the page (no AI summarization)
        console.log(`📄 Fetching raw content for: ${opp.url}`);
        const rawContentResponse = await fetch(`${SCRAPER_URL}/api/raw-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: opp.url }),
        });

        const rawContentResult = await rawContentResponse.json();
        const fullRawContent = rawContentResult.success ? rawContentResult.raw_content : '';
        const filteredContent = extractOpportunitySection(fullRawContent, opp.title);
        console.log(`📄 Raw content: ${fullRawContent?.length || 0} characters | Filtered: ${filteredContent?.length || 0} characters`);

        // STEP 2: Get structured main info fields for table display
        const mainInfoFields = MAIN_INFO_FIELDS[opp.opportunity_type] || MAIN_INFO_FIELDS.job;
        
        const mainInfoResponse = await fetch(`${SCRAPER_URL}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: opp.url,
            fields: mainInfoFields,
            model: 'gpt-4o-mini',
          }),
        });

        const scraperResult = await mainInfoResponse.json();

        // If both failed, record as failed
        if (!scraperResult.success && !fullRawContent) {
          const { data: failedRecord, error: insertError } = await supabase
            .from('extracted_opportunity_content')
            .insert({
              title: opp.title,
              opportunity_type: opp.opportunity_type,
              source_url: opp.url,
              scraped_opportunity_id: opp.scraped_opportunity_id || null,
              extraction_status: 'failed',
              extraction_error: scraperResult.error || 'Extraction failed',
              extracted_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            errors.push({ title: opp.title, url: opp.url, error: insertError.message });
          } else {
            errors.push({ 
              id: failedRecord?.id,
              title: opp.title, 
              url: opp.url, 
              error: scraperResult.error || 'Extraction failed' 
            });
          }
          continue;
        }

        // Get extracted main info data
        const extractedData: ExtractedContent = scraperResult.data || 
          (scraperResult.jobs && scraperResult.jobs[0]) || {};

        // Parse deadline if present
        let deadlineDate = null;
        const deadlineValue = extractedData.deadline || extractedData.application_deadline;
        if (deadlineValue) {
          const parsed = new Date(deadlineValue);
          if (!isNaN(parsed.getTime())) {
            deadlineDate = parsed.toISOString().split('T')[0];
          }
        }

        // Normalize main info values
        const normalizedData = {
          title: extractedData.title || opp.title,
          company: extractedData.company || extractedData.organization || extractedData.provider || null,
          location: extractedData.location || null,
          salary_range: extractedData.salary_range || extractedData.salary || extractedData.amount || extractedData.cost || null,
          job_type: extractedData.contract_type || extractedData.job_type || extractedData.employment_type || null,
        };

        // Insert with FULL RAW CONTENT
        const { data: record, error: insertError } = await supabase
          .from('extracted_opportunity_content')
          .insert({
            title: normalizedData.title,
            opportunity_type: opp.opportunity_type,
            source_url: opp.url,
            scraped_opportunity_id: opp.scraped_opportunity_id || null,
            // FULL RAW CONTENT - not summarized by AI
            raw_content: filteredContent || fullRawContent || null,
            description: filteredContent || fullRawContent || null, // Use trimmed content as description
            structured_content: { 
              ...extractedData, 
              raw_content_length: fullRawContent?.length || 0,
              filtered_content_length: filteredContent?.length || 0
            },
            // Main info for table display
            company: normalizedData.company,
            location: normalizedData.location,
            salary_range: normalizedData.salary_range,
            job_type: normalizedData.job_type,
            deadline: deadlineDate,
            // Other fields are null - content is in raw_content
            requirements: null,
            benefits: null,
            responsibilities: null,
            qualifications: null,
            application_instructions: null,
            contact_info: null,
            extraction_status: 'completed',
            extracted_at: new Date().toISOString(),
            model_used: 'raw-content + gpt-4o-mini',
            extraction_cost: scraperResult.metadata?.total_cost || 0,
          })
          .select()
          .single();

        if (insertError) {
          errors.push({ title: opp.title, url: opp.url, error: insertError.message });
          continue;
        }

        results.push({
          id: record.id,
          title: record.title,
          url: opp.url,
          status: 'extracted',
          extraction_status: 'completed',
          content_length: fullRawContent?.length || 0,
        });

      } catch (err) {
        errors.push({ 
          title: opp.title, 
          url: opp.url, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      extracted: results.length,
      total: opportunities.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error in POST /api/admin/extract-opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List extracted opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('extracted_opportunity_content')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && ['job', 'funding', 'training'].includes(type)) {
      query = query.eq('opportunity_type', type);
    }

    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      query = query.eq('extraction_status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching extracted opportunities:', error);
      return NextResponse.json({ error: 'Failed to fetch extracted opportunities' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      total: count,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Error in GET /api/admin/extract-opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
