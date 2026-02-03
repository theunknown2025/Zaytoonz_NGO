-- Migration: Add launchingstatus column to ngo_profile table
-- This column tracks whether the approval success screen has been shown to the NGO
-- Run this in your Supabase SQL Editor

-- Add launchingstatus column to ngo_profile table if it doesn't exist
DO $$ 
BEGIN
    -- Check if the column exists, if not, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ngo_profile' 
        AND column_name = 'launchingstatus'
    ) THEN
        ALTER TABLE ngo_profile 
        ADD COLUMN launchingstatus TEXT DEFAULT 'not_shown' 
        CHECK (launchingstatus IN ('not_shown', 'shown'));
        
        RAISE NOTICE 'Column launchingstatus added successfully';
    ELSE
        RAISE NOTICE 'Column launchingstatus already exists';
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ngo_profile_launchingstatus ON ngo_profile(launchingstatus);

-- Add comment to document the field
COMMENT ON COLUMN ngo_profile.launchingstatus IS 'Tracks whether the approval success screen has been shown: not_shown (default) or shown';

-- Set default for existing records that might have NULL values
UPDATE ngo_profile 
SET launchingstatus = 'not_shown' 
WHERE launchingstatus IS NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ngo_profile' 
AND column_name = 'launchingstatus';
