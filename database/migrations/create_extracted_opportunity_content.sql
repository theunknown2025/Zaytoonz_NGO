-- Migration: Create table for storing extracted opportunity content
-- This table stores the full content extracted from opportunity URLs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for extracted opportunity content
CREATE TABLE IF NOT EXISTS extracted_opportunity_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scraped_opportunity_id UUID REFERENCES scraped_opportunities(id) ON DELETE SET NULL,
  -- Basic info
  title VARCHAR(500) NOT NULL,
  opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('job', 'funding', 'training')),
  source_url VARCHAR(1000) NOT NULL UNIQUE,
  
  -- Extracted content
  raw_content TEXT, -- Full raw text content from the page
  structured_content JSONB, -- AI-structured content with all extracted fields
  
  -- Common extracted fields (for easy querying)
  description TEXT,
  company VARCHAR(255),
  location VARCHAR(255),
  salary_range VARCHAR(255),
  job_type VARCHAR(100),
  deadline DATE,
  requirements TEXT,
  benefits TEXT,
  responsibilities TEXT,
  qualifications TEXT,
  application_instructions TEXT,
  contact_info TEXT,
  
  -- Metadata
  extraction_status VARCHAR(20) DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_error TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE,
  model_used VARCHAR(100),
  extraction_cost DECIMAL(10, 6),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_extracted_content_source_url ON extracted_opportunity_content(source_url);
CREATE INDEX IF NOT EXISTS idx_extracted_content_type ON extracted_opportunity_content(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_extracted_content_status ON extracted_opportunity_content(extraction_status);
CREATE INDEX IF NOT EXISTS idx_extracted_content_scraped_id ON extracted_opportunity_content(scraped_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_extracted_content_created_at ON extracted_opportunity_content(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_extracted_opportunity_content_timestamp
    BEFORE UPDATE ON extracted_opportunity_content
    FOR EACH ROW
    EXECUTE FUNCTION update_scraped_opportunities_updated_at();

-- Add comments for documentation
COMMENT ON TABLE extracted_opportunity_content IS 'Stores full extracted content from opportunity source URLs';
COMMENT ON COLUMN extracted_opportunity_content.raw_content IS 'Full raw text content extracted from the page';
COMMENT ON COLUMN extracted_opportunity_content.structured_content IS 'AI-processed structured content with all extracted fields';
COMMENT ON COLUMN extracted_opportunity_content.extraction_status IS 'Status of the extraction process';
COMMENT ON COLUMN extracted_opportunity_content.model_used IS 'AI model used for content extraction';

