import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    console.log('Fetching opportunities with type:', type);

    // Get opportunities from both internal and scraped sources
    const [internalResult, scrapedResult] = await Promise.all([
      getInternalOpportunities(type),
      getScrapedOpportunities(type)
    ]);

    let allOpportunities: any[] = [];

    // Add internal opportunities
    if (internalResult.opportunities) {
      allOpportunities.push(...internalResult.opportunities);
    }

    // Add scraped opportunities
    if (scrapedResult.opportunities) {
      allOpportunities.push(...scrapedResult.opportunities);
    }

    console.log(`Found ${allOpportunities.length} total opportunities (${internalResult.opportunities?.length || 0} internal, ${scrapedResult.opportunities?.length || 0} scraped)`);

    return NextResponse.json(allOpportunities);
  } catch (error) {
    console.error('Error in opportunities API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getInternalOpportunities(type: string | null) {
  try {
    // Build the query to get opportunities with their descriptions and application counts
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        opportunity_description (
          id,
          title,
          description,
          location,
          hours,
          status,
          metadata,
          created_at,
          updated_at
        )
      `);

    // Filter by opportunity type if provided
    if (type) {
      query = query.eq('opportunity_type', type);
    }

    // Get both published and completed opportunities for admin view
    query = query.in('opportunity_description.status', ['published', 'completed']);

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Error fetching internal opportunities:', error);
      return { opportunities: [], error: error.message };
    }

    // Get application counts for each opportunity
    const opportunityIds = opportunities?.map(opp => opp.id) || [];
    let applicationCounts: Record<string, number> = {};
    
    if (opportunityIds.length > 0) {
      const { data: applications, error: appError } = await supabase
        .from('opportunity_applications')
        .select('opportunity_id')
        .in('opportunity_id', opportunityIds);
      
      if (!appError && applications) {
        applicationCounts = applications.reduce((acc: Record<string, number>, app: any) => {
          acc[app.opportunity_id] = (acc[app.opportunity_id] || 0) + 1;
          return acc;
        }, {});
      }
    }

    // Transform the data to match the frontend interface
    const transformedOpportunities = opportunities?.map((opp: any) => {
      const description = opp.opportunity_description?.[0];
      const deadline = extractDeadlineFromDescription(description?.description);
      const status = getOpportunityStatus(description?.status, deadline);
      
      return {
        id: opp.id,
        title: description?.title || opp.title,
        description: description?.description || '',
        category: opp.opportunity_type,
        organization: 'Zaytoonz NGO',
        location: description?.location || 'Not specified',
        compensation: extractCompensationFromDescription(description?.description) || 'Competitive',
        type: getOpportunityTypeLabel(opp.opportunity_type),
        deadline: deadline,
        posted: formatTimeAgo(description?.created_at || opp.created_at),
        status: status,
        applicants: applicationCounts[opp.id] || 0,
        ngoProfileId: '9fc76e85-7c8a-4d93-bf83-42b662f4b75f', // Using the existing NGO profile
        metadata: description?.metadata || {}
      };
    }) || [];

    return { opportunities: transformedOpportunities, error: null };
  } catch (error) {
    console.error('Error fetching internal opportunities:', error);
    return { opportunities: [], error: 'Failed to fetch internal opportunities' };
  }
}

async function getScrapedOpportunities(type: string | null) {
  try {
    // Build the query to get scraped opportunities with their details
    let query = supabase
      .from('scraped_opportunities')
      .select(`
        *,
        scraped_opportunity_details (
          *
        )
      `);

    // Filter by opportunity type if provided
    if (type) {
      query = query.eq('opportunity_type', type);
    }

    // Only get active scraped opportunities
    query = query.eq('status', 'active');

    const { data: scrapedOpportunities, error } = await query;

    if (error) {
      console.error('Error fetching scraped opportunities:', error);
      return { opportunities: [], error: error.message };
    }

    // Transform scraped opportunities to match the frontend interface
    const transformedScrapedOpportunities = scrapedOpportunities?.map((opp: any) => {
      const details = opp.scraped_opportunity_details?.[0];
      const deadline = details?.deadline ? new Date(details.deadline).toLocaleDateString() : undefined;
      
      return {
        id: `scraped_${opp.id}`, // Prefix to distinguish from internal opportunities
        title: opp.title,
        description: details?.description || '',
        category: opp.opportunity_type,
        organization: details?.company || 'External Organization',
        location: details?.location || 'Not specified',
        compensation: details?.salary_range || 'Competitive',
        type: getOpportunityTypeLabel(opp.opportunity_type),
        deadline: deadline,
        posted: formatTimeAgo(opp.created_at),
        status: 'active',
        applicants: 0, // Scraped opportunities don't have applications yet
        metadata: details?.metadata || {},
        isScraped: true,
        sourceUrl: opp.source_url
      };
    }) || [];

    return { opportunities: transformedScrapedOpportunities, error: null };
  } catch (error) {
    console.error('Error fetching scraped opportunities:', error);
    return { opportunities: [], error: 'Failed to fetch scraped opportunities' };
  }
}

function getOpportunityTypeLabel(type: string): string {
  switch (type) {
    case 'job': return 'Full-time';
    case 'funding': return 'Grant';
    case 'training': return 'Course';
    default: return 'Opportunity';
  }
}

function extractDeadlineFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  // Look for deadline patterns in the description
  const deadlineMatch = description.match(/\*\*deadline\*\*\s*\n?([^\n*]+)/i);
  if (deadlineMatch) {
    return deadlineMatch[1].trim();
  }
  
  return undefined;
}

function extractCompensationFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  // Look for compensation/salary patterns in the description
  const compensationMatch = description.match(/\*\*(salary|compensation|pay|budget|amount)\*\*\s*\n?([^\n*]+)/i);
  if (compensationMatch) {
    return compensationMatch[2].trim();
  }
  
  return undefined;
}

function getOpportunityStatus(dbStatus: string, deadline?: string): 'active' | 'suspended' | 'expired' {
  if (!deadline) {
    return dbStatus === 'published' ? 'active' : 'suspended';
  }
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  
  if (deadlineDate < now) {
    return 'expired';
  }
  
  return dbStatus === 'published' ? 'active' : 'suspended';
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
} 