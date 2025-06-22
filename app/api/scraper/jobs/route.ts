import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobData, scrapeJobDataAdvanced, JobData, JobListResult } from '../../../lib/scraper';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { url, advanced = false } = await request.json();
    
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

    // Scrape the job data - use advanced scraper if requested
    console.log(`🚀 Starting ${advanced ? 'ADVANCED' : 'BASIC'} scraping for: ${url}`);
    const scrapedData = advanced ? 
      await scrapeJobDataAdvanced(url) : 
      await scrapeJobData(url);
    
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