-- Migration: Create table for storing saved opportunity sources
-- This table stores URLs and configurations for opportunity sources that can be reused

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for saved sources
CREATE TABLE IF NOT EXISTS saved_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Source information
  name VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  description TEXT,
  
  -- Configuration
  opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('job', 'funding', 'training')),
  fields JSONB DEFAULT '[]'::jsonb, -- Array of field names to extract
  use_pagination BOOLEAN DEFAULT false,
  pagination_details TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scrape_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_sources_opportunity_type ON saved_sources(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_saved_sources_is_active ON saved_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_saved_sources_created_at ON saved_sources(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_saved_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_sources_timestamp
    BEFORE UPDATE ON saved_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_sources_updated_at();

-- Add comments for documentation
COMMENT ON TABLE saved_sources IS 'Stores saved opportunity source URLs and their scraping configurations';
COMMENT ON COLUMN saved_sources.fields IS 'JSON array of field names to extract when scraping this source';
COMMENT ON COLUMN saved_sources.opportunity_type IS 'Type of opportunities found at this source';
COMMENT ON COLUMN saved_sources.scrape_count IS 'Number of times this source has been scraped';

