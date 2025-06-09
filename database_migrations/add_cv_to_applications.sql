-- Migration: Add CV fields to opportunity_applications table
-- This migration adds columns to store CV information with application submissions

-- Add CV fields to opportunity_applications table
ALTER TABLE opportunity_applications 
ADD COLUMN IF NOT EXISTS selected_cv_id UUID REFERENCES cvs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS selected_cv_name TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_cv_id ON opportunity_applications(selected_cv_id);

-- Add comment to document the purpose
COMMENT ON COLUMN opportunity_applications.selected_cv_id IS 'Reference to the CV selected by the applicant for this application';
COMMENT ON COLUMN opportunity_applications.selected_cv_name IS 'Name of the CV at the time of application submission (for historical reference)'; 