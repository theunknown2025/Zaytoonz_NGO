import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

interface ScrapedJob {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salary_range?: string;
  job_type?: string;
  deadline?: string;
  url?: string;
  link?: string;
  href?: string;
  apply_url?: string;
  detail_url?: string;
  application_url?: string;
  job_url?: string;
  opportunity_url?: string;
  source_url?: string;
  tags?: string[];
  [key: string]: unknown;
}

// Helper function to extract URL from job data
function extractJobUrl(job: ScrapedJob): string | null {
  // Check standard fields first
  const standardFields = ['url', 'link', 'href', 'apply_url', 'detail_url', 'application_url', 'job_url', 'opportunity_url', 'source_url'];
  for (const field of standardFields) {
    const val = job[field];
    if (val && typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
      return val;
    }
  }
  
  // Search all keys for url/link patterns
  const keys = Object.keys(job);
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('url') || lowerKey.includes('link') || lowerKey.includes('href')) {
      const val = job[key];
      if (val && typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
        return val;
      }
    }
  }
  
  // Check for any string that looks like a URL
  for (const key of keys) {
    const val = job[key];
    if (val && typeof val === 'string' && val.startsWith('http')) {
      return val;
    }
  }
  
  return null;
}

interface BulkSaveRequest {
  opportunities: ScrapedJob[];
  opportunity_type: 'job' | 'funding' | 'training';
  source_url: string;
}

interface BulkDeleteRequest {
  ids: string[];
}

// POST - Bulk save scraped opportunities
export async function POST(request: NextRequest) {
  try {
    const body: BulkSaveRequest = await request.json();
    const { opportunities, opportunity_type, source_url } = body;

    if (!opportunities || !Array.isArray(opportunities) || opportunities.length === 0) {
      return NextResponse.json({ error: 'Opportunities array is required' }, { status: 400 });
    }

    if (!opportunity_type || !['job', 'funding', 'training'].includes(opportunity_type)) {
      return NextResponse.json({ error: 'Valid opportunity_type is required (job, funding, training)' }, { status: 400 });
    }

    if (!source_url) {
      return NextResponse.json({ error: 'Source URL is required' }, { status: 400 });
    }

    const savedOpportunities = [];
    const errors = [];

    for (const job of opportunities) {
      try {
        // Get the specific opportunity URL using smart extraction
        const opportunityUrl = extractJobUrl(job) || source_url;

        // Insert into scraped_opportunities table
        const { data: mainRecord, error: mainError } = await supabase
          .from('scraped_opportunities')
          .insert({
            title: job.title || 'Untitled Opportunity',
            opportunity_type,
            source_url: opportunityUrl,
            status: 'active',
            scraped_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (mainError) {
          errors.push({ title: job.title, error: mainError.message });
          continue;
        }

        // Parse deadline if present
        let deadlineDate = null;
        if (job.deadline) {
          const parsed = new Date(job.deadline);
          if (!isNaN(parsed.getTime())) {
            deadlineDate = parsed.toISOString().split('T')[0];
          }
        }

        // Insert details into scraped_opportunity_details table
        const { error: detailsError } = await supabase
          .from('scraped_opportunity_details')
          .insert({
            scraped_opportunity_id: mainRecord.id,
            description: job.description || null,
            location: job.location || null,
            company: job.company || null,
            deadline: deadlineDate,
            requirements: job.requirements || null,
            benefits: job.benefits || null,
            salary_range: job.salary_range || null,
            tags: job.tags || null,
            metadata: {
              job_type: job.job_type,
              link: opportunityUrl,
              original_data: job,
            },
          });

        if (detailsError) {
          // Rollback main record if details fail
          await supabase.from('scraped_opportunities').delete().eq('id', mainRecord.id);
          errors.push({ title: job.title, error: detailsError.message });
          continue;
        }

        savedOpportunities.push({ id: mainRecord.id, title: job.title });
      } catch (err) {
        errors.push({ title: job.title, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      saved: savedOpportunities.length,
      total: opportunities.length,
      savedOpportunities,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/scraped-opportunities/bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Bulk delete scraped opportunities
export async function DELETE(request: NextRequest) {
  try {
    const body: BulkDeleteRequest = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('scraped_opportunities')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error bulk deleting scraped opportunities:', error);
      return NextResponse.json({ error: 'Failed to delete opportunities' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error('Error in DELETE /api/admin/scraped-opportunities/bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

