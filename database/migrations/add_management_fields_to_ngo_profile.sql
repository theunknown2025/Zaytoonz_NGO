-- Add management fields to ngo_profile table
-- This migration adds fields for NGO management features like lock and pause status

-- Add lock and pause management fields
ALTER TABLE ngo_profile 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS paused_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS lock_reason TEXT,
ADD COLUMN IF NOT EXISTS pause_reason TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ngo_profile_is_locked ON ngo_profile(is_locked);
CREATE INDEX IF NOT EXISTS idx_ngo_profile_is_paused ON ngo_profile(is_paused);

-- Add comments for documentation
COMMENT ON COLUMN ngo_profile.is_locked IS 'Whether the NGO account is locked';
COMMENT ON COLUMN ngo_profile.is_paused IS 'Whether the NGO account is paused';
COMMENT ON COLUMN ngo_profile.locked_at IS 'Timestamp when the NGO was locked';
COMMENT ON COLUMN ngo_profile.paused_at IS 'Timestamp when the NGO was paused';
COMMENT ON COLUMN ngo_profile.locked_by IS 'Admin user ID who locked the NGO';
COMMENT ON COLUMN ngo_profile.paused_by IS 'Admin user ID who paused the NGO';
COMMENT ON COLUMN ngo_profile.lock_reason IS 'Reason for locking the NGO account';
COMMENT ON COLUMN ngo_profile.pause_reason IS 'Reason for pausing the NGO account';
