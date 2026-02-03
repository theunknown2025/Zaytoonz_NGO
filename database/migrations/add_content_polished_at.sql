-- Migration: Add content_polished_at column to track when content was polished/cleaned
-- This allows us to skip AI polishing if content has already been cleaned

ALTER TABLE extracted_opportunity_content
ADD COLUMN IF NOT EXISTS content_polished_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_extracted_content_polished_at 
ON extracted_opportunity_content(content_polished_at);

-- Add comment
COMMENT ON COLUMN extracted_opportunity_content.content_polished_at IS 
'Timestamp when content was polished/cleaned with AI. NULL means content has not been polished yet.';
