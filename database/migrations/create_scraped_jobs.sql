-- Create scraped_jobs table
CREATE TABLE IF NOT EXISTS scraped_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255),
  location VARCHAR(255),
  job_type VARCHAR(100), -- Full-time, Part-time, Contract, etc.
  salary_range VARCHAR(255),
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  application_deadline DATE,
  source_url VARCHAR(1000) NOT NULL,
  scraped_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  tags TEXT[], -- Array of tags/keywords
  experience_level VARCHAR(100), -- Entry, Mid, Senior, etc.
  remote_work BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_title ON scraped_jobs(title);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_company ON scraped_jobs(company);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_location ON scraped_jobs(location);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_scraped_at ON scraped_jobs(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_is_active ON scraped_jobs(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scraped_jobs_updated_at 
    BEFORE UPDATE ON scraped_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 