-- Migration: Update user_type constraint to include 'Admin'
-- This migration updates the existing constraint to allow 'Admin' as a valid user type

-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;

-- Add the new constraint that includes 'Admin'
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
  CHECK (user_type IN ('Personne', 'NGO', 'Admin'));

-- Add a comment to document the change
COMMENT ON CONSTRAINT users_user_type_check ON users IS 
  'Ensures user_type is one of: Personne, NGO, or Admin';
