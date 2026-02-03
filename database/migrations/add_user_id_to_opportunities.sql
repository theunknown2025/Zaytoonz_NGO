-- Migration: Add user_id column to opportunities table
-- This migration adds a user_id field to link opportunities to the NGO user who created them
-- All existing opportunities will be assigned to user_id: 6955fc04-b858-4c1a-ae6c-85bd37e742d0

-- Step 1: Add user_id column (nullable initially to allow updating existing records)
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Step 2: Update all existing opportunities to have the specified user_id
UPDATE public.opportunities 
SET user_id = '6955fc04-b858-4c1a-ae6c-85bd37e742d0'::uuid
WHERE user_id IS NULL;

-- Step 3: Add foreign key constraint to users table
-- Using RESTRICT to prevent deleting users who have created opportunities
ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE RESTRICT;

-- Step 4: Make user_id NOT NULL after setting all existing records
ALTER TABLE public.opportunities 
ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);

-- Step 6: Add comment to document the column
COMMENT ON COLUMN public.opportunities.user_id IS 'ID of the NGO user who created this opportunity';
