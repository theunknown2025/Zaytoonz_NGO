-- Add latest_job_title column to seeker_profiles table
ALTER TABLE seeker_profiles 
ADD COLUMN latest_job_title TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN seeker_profiles.latest_job_title IS 'The most recent job title of the seeker'; 