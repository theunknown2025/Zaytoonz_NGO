-- Migration: Update profiles table user_type constraint to include 'Admin'
-- This migration updates the existing constraint to allow 'Admin' as a valid user type

-- First, drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Add the new constraint that includes 'Admin'
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type IN ('Personne', 'NGO', 'Admin'));

-- Add a comment to document the change
COMMENT ON CONSTRAINT profiles_user_type_check ON profiles IS 
  'Ensures user_type is one of: Personne, NGO, or Admin';
