-- Add approval status columns to ngo_details table
ALTER TABLE ngo_details 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS year_created TEXT,
ADD COLUMN IF NOT EXISTS legal_rep_name TEXT,
ADD COLUMN IF NOT EXISTS legal_rep_email TEXT,
ADD COLUMN IF NOT EXISTS legal_rep_phone TEXT,
ADD COLUMN IF NOT EXISTS legal_rep_function TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_ngo_details_approval_status ON ngo_details(approval_status);

-- Add comments for documentation
COMMENT ON COLUMN ngo_details.approval_status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN ngo_details.approved_at IS 'Timestamp when the NGO was approved';
COMMENT ON COLUMN ngo_details.approved_by IS 'Admin user ID who approved the NGO';
COMMENT ON COLUMN ngo_details.admin_notes IS 'Admin notes about the approval decision';
