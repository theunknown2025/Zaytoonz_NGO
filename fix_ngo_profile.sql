-- Fix NGO Profile Table Structure
-- Run this script in your Supabase SQL editor to add missing columns

-- Add approval status columns to ngo_profile table
ALTER TABLE ngo_profile 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approval timestamp and admin notes
ALTER TABLE ngo_profile 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for faster approval status queries
CREATE INDEX IF NOT EXISTS idx_ngo_profile_approval_status ON ngo_profile(approval_status);

-- Add comment to document the approval workflow
COMMENT ON COLUMN ngo_profile.approval_status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN ngo_profile.approved_at IS 'Timestamp when the NGO was approved';
COMMENT ON COLUMN ngo_profile.approved_by IS 'Admin user ID who approved the NGO';
COMMENT ON COLUMN ngo_profile.admin_notes IS 'Admin notes about the approval decision';

-- Update existing records to have pending status if they don't have it
UPDATE ngo_profile 
SET approval_status = 'pending' 
WHERE approval_status IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'ngo_profile' 
ORDER BY ordinal_position;
