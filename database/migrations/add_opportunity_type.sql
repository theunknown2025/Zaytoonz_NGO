-- Migration: Add opportunity_type column to opportunities table
-- Run this SQL command in your Supabase SQL editor or database management tool

-- Add opportunity_type column to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN opportunity_type text;

-- Add a check constraint to ensure only valid opportunity types are allowed
ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_type_check 
CHECK (opportunity_type IN ('job', 'funding', 'training'));

-- Add comment to document the column
COMMENT ON COLUMN public.opportunities.opportunity_type IS 'Type of opportunity: job, funding, or training';

-- Optional: Set a default value if needed
-- ALTER TABLE public.opportunities 
-- ALTER COLUMN opportunity_type SET DEFAULT 'job';

-- Update the updated_at timestamp when opportunity_type changes
-- (This is already handled by the existing update_opportunity_timestamp trigger)

-- If you want to add an index for better query performance on opportunity_type:
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(opportunity_type); 