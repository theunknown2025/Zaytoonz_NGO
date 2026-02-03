-- Add banner, logo, and mission statement columns to ngo_profile table
-- This migration adds fields for NGO branding and mission information

-- Add banner, logo, and mission statement fields
ALTER TABLE ngo_profile 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS mission_statement TEXT;

-- Add comments for documentation
COMMENT ON COLUMN ngo_profile.banner_url IS 'URL to the NGO banner image';
COMMENT ON COLUMN ngo_profile.logo_url IS 'URL to the NGO logo image';
COMMENT ON COLUMN ngo_profile.mission_statement IS 'Mission statement of the NGO';
