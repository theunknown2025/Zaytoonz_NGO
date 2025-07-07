import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Define types locally to avoid dependency on the legacy scraper
interface JobData {
  title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  salary_range?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  tags?: string[];
  experience_level?: string;
  remote_work?: boolean;
  source_url?: string;
  scraped_at?: string;
  id?: string;
}

interface JobListResult {
  jobs: JobData[];
  summary: {
    totalFound: number;
    source: string;
    pageTitle: string;
  };
}

// Function to scrape job data using the new simple scraper API
async function scrapeJobDataWithSimpleAPI(url: string): Promise<JobData | JobListResult | null> {
  try {
    // Define common job fields for scraping
    const jobFields = [
      { id: '1', name: 'title', selector: 'h1, .job-title, .title, [class*="title"]', type: 'text' as const, required: true },
      { id: '2', name: 'company', selector: '.company, .employer, [class*="company"]', type: 'text' as const, required: false },
      { id: '3', name: 'location', selector: '.location, .city, [class*="location"]', type: 'text' as const, required: false },
      { id: '4', name: 'description', selector: '.description, .content, [class*="description"]', type: 'text' as const, required: false },
      { id: '5', name: 'job_type', selector: '.job-type, .type, [class*="type"]', type: 'text' as const, required: false },
      { id: '6', name: 'salary_range', selector: '.salary, .pay, [class*="salary"]', type: 'text' as const, required: false }
    ];

    // Call the simple scraper API
    const response = await fetch('/api/scraper/zaytoonz-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        fields: jobFields,
        itemSelector: 'article, .job, .position, .listing'
      }),
    });

    if (!response.ok) {
      console.error('Simple scraper API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Convert to expected format
    if (data.items.length === 1) {
      // Single job
      const job = data.items[0];
      return {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        job_type: job.job_type,
        salary_range: job.salary_range,
        source_url: url,
        scraped_at: new Date().toISOString()
      } as JobData;
    } else {
      // Multiple jobs
      const jobs = data.items.map((item: any) => ({
        title: item.title,
        company: item.company,
        location: item.location,
        description: item.description,
        job_type: item.job_type,
        salary_range: item.salary_range,
        source_url: url,
        scraped_at: new Date().toISOString()
      }));

      return {
        jobs,
        summary: {
          totalFound: jobs.length,
          source: url,
          pageTitle: data.debug?.pageTitle || 'Scraped Jobs'
        }
      } as JobListResult;
    }
  } catch (error) {
    console.error('Error calling simple scraper API:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Scrape the job data using the new simple scraper API
    const scrapedData = await scrapeJobDataWithSimpleAPI(url);
    
    if (!scrapedData) {
      return NextResponse.json(
        { error: 'Failed to scrape job data from the provided URL' },
        { status: 422 }
      );
    }

    // Check if we got multiple jobs (JobListResult) or single job (JobData)
    if ('jobs' in scrapedData) {
      // Multiple jobs found
      const jobListResult = scrapedData as JobListResult;
      const jobsWithMetadata = jobListResult.jobs.map((job: JobData, index: number) => ({
        ...job,
        source_url: url,
        scraped_at: new Date().toISOString(),
        id: `temp-${Date.now()}-${index}` // Temporary ID for display
      }));

      return NextResponse.json({
        success: true,
        jobs: jobsWithMetadata, // Return multiple jobs
        summary: jobListResult.summary,
        message: `Found ${jobListResult.summary.totalFound} job opportunities from: ${url}`,
        debug: {
          originalUrl: url,
          totalFound: jobListResult.summary.totalFound,
          source: jobListResult.summary.source
        }
      });
    } else {
      // Single job found
      const jobData = scrapedData as JobData;
      return NextResponse.json({
        success: true,
        job: {
          ...jobData,
          source_url: url,
          scraped_at: new Date().toISOString(),
          id: `temp-${Date.now()}` // Temporary ID for display
        },
        message: `Job data scraped successfully from: ${url}`,
        debug: {
          originalUrl: url,
          extractedTitle: jobData.title,
          extractedCompany: jobData.company
        }
      });
    }

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Internal server error while scraping' },
      { status: 500 }
    );
  }
}

// GET route to fetch saved jobs from database
export async function GET() {
  try {
    const { data: jobs, error } = await supabase
      .from('scraped_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || []
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT route to save multiple jobs to database
export async function PUT(request: NextRequest) {
  try {
    const { jobs } = await request.json();
    
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: 'Jobs array is required' },
        { status: 400 }
      );
    }

    // Prepare jobs for database insertion
    const jobsForDB = jobs.map(job => ({
      title: job.title || 'Untitled',
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      job_type: job.job_type || 'Not specified',
      salary_range: job.salary_range || '',
      description: job.description || '',
      source_url: job.source_url || '',
      remote_work: job.remote_work || false,
      tags: job.tags || [],
      experience_level: job.experience_level || 'Not specified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert jobs into database
    const { data, error } = await supabase
      .from('scraped_jobs')
      .insert(jobsForDB)
      .select();

    if (error) {
      console.error('Database insertion error:', error);
      return NextResponse.json(
        { error: 'Failed to save jobs to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${data.length} jobs to database`,
      savedJobs: data
    });

  } catch (error) {
    console.error('Error saving jobs to database:', error);
    return NextResponse.json(
      { error: 'Internal server error while saving jobs' },
      { status: 500 }
    );
  }
} 