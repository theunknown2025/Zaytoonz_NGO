export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  source_url: string;
  scraped_at: string;
  is_active: boolean;
  tags?: string[];
  experience_level?: string;
  remote_work: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScrapeJobRequest {
  url: string;
}

export interface ScrapeJobResponse {
  success: boolean;
  job?: ScrapedJob;
  error?: string;
  message?: string;
}

export interface GetJobsResponse {
  success: boolean;
  jobs: ScrapedJob[];
  error?: string;
} 