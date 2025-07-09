-- Migration: Create tables for scraped opportunities
-- These tables are separate from user-created opportunities to avoid conflicts with user_id constraints

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create main scraped_opportunities table
CREATE TABLE IF NOT EXISTS scraped_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('job', 'funding', 'training')),
  source_url VARCHAR(1000) NOT NULL,
  scraper_config JSONB, -- Store the scraper field configuration used
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create detailed information table for scraped opportunities
CREATE TABLE IF NOT EXISTS scraped_opportunity_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scraped_opportunity_id UUID NOT NULL REFERENCES scraped_opportunities(id) ON DELETE CASCADE,
  description TEXT,
  location VARCHAR(255),
  company VARCHAR(255),
  hours VARCHAR(100),
  deadline DATE,
  requirements TEXT,
  benefits TEXT,
  salary_range VARCHAR(255),
  contact_info TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}', -- Store all additional scraped fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_type ON scraped_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_source ON scraped_opportunities(source_url);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_scraped_at ON scraped_opportunities(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_status ON scraped_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunity_details_scraped_id ON scraped_opportunity_details(scraped_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunity_details_company ON scraped_opportunity_details(company);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunity_details_location ON scraped_opportunity_details(location);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_scraped_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_scraped_opportunities_timestamp
    BEFORE UPDATE ON scraped_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_scraped_opportunities_updated_at();

CREATE TRIGGER update_scraped_opportunity_details_timestamp
    BEFORE UPDATE ON scraped_opportunity_details
    FOR EACH ROW
    EXECUTE FUNCTION update_scraped_opportunities_updated_at();

-- Add comments for documentation
COMMENT ON TABLE scraped_opportunities IS 'Main table for opportunities scraped from external websites';
COMMENT ON TABLE scraped_opportunity_details IS 'Detailed information for scraped opportunities';
COMMENT ON COLUMN scraped_opportunities.source_url IS 'Original URL where the opportunity was scraped from';
COMMENT ON COLUMN scraped_opportunities.scraper_config IS 'Configuration used by scraper (field mappings, selectors, etc.)';
COMMENT ON COLUMN scraped_opportunity_details.metadata IS 'Additional scraped fields that don''t fit in standard columns';

-- Create view for easy querying of complete scraped opportunity information
CREATE OR REPLACE VIEW scraped_opportunities_complete AS
SELECT 
    so.id,
    so.title,
    so.opportunity_type,
    so.source_url,
    so.status,
    so.scraped_at,
    so.created_at,
    so.updated_at,
    sod.description,
    sod.location,
    sod.company,
    sod.hours,
    sod.deadline,
    sod.requirements,
    sod.benefits,
    sod.salary_range,
    sod.contact_info,
    sod.tags,
    sod.metadata,
    so.scraper_config
FROM scraped_opportunities so
LEFT JOIN scraped_opportunity_details sod ON so.id = sod.scraped_opportunity_id; 