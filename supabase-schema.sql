-- Create users table to store user information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('Personne', 'NGO', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create additional table for NGO-specific information
CREATE TABLE ngo_details (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create additional table for individual-specific information
CREATE TABLE personne_details (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE personne_details ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users are viewable by themselves only" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Policies for ngo_details table
CREATE POLICY "NGO details are viewable by owners" 
  ON ngo_details FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "NGOs can insert their own details" 
  ON ngo_details FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "NGOs can update their own details" 
  ON ngo_details FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for personne_details table
CREATE POLICY "Person details are viewable by owners" 
  ON personne_details FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Persons can insert their own details" 
  ON personne_details FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Persons can update their own details" 
  ON personne_details FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create or replace function to handle password hashing
CREATE OR REPLACE FUNCTION hash_password() RETURNS TRIGGER AS $$
BEGIN
  -- In a production environment, use a proper password hashing function
  -- For this example, we'll just represent it with a placeholder
  -- In real implementation, use pgcrypto's crypt() function or similar
  NEW.password_hash = 'hashed_' || NEW.password_hash;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically hash passwords
CREATE TRIGGER hash_password_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION hash_password();

-- NGO Profile Tables for Zaytoonz NGO Platform

-- Main NGO profile table
CREATE TABLE ngo_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  year_created TEXT NOT NULL,
  legal_rep_name TEXT NOT NULL,
  legal_rep_email TEXT NOT NULL,
  legal_rep_phone TEXT NOT NULL,
  legal_rep_function TEXT NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional information items
CREATE TABLE additional_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES ngo_profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'link', 'social', 'other'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document records
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES ngo_profile(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage Buckets
-- You need to create these in the Supabase dashboard or with the Supabase CLI
-- Execute the following using Supabase CLI:
-- supabase storage create ngo-profile-pictures
-- supabase storage create ngo-profile-documents

-- Create security policies (RLS) to restrict access
-- Allow authenticated users to select their own profile data
CREATE POLICY "Users can view their own NGO profile"
ON ngo_profile FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own NGO profile"
ON ngo_profile FOR UPDATE
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own NGO profile"
ON ngo_profile FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Similar policies for additional info
CREATE POLICY "Users can view their own additional info"
ON additional_info FOR SELECT
USING (profile_id IN (SELECT id FROM ngo_profile WHERE user_id = auth.uid()));

CREATE POLICY "Users can modify their own additional info"
ON additional_info FOR ALL
USING (profile_id IN (SELECT id FROM ngo_profile WHERE user_id = auth.uid()));

-- Similar policies for documents
CREATE POLICY "Users can view their own documents"
ON documents FOR SELECT
USING (profile_id IN (SELECT id FROM ngo_profile WHERE user_id = auth.uid()));

CREATE POLICY "Users can modify their own documents"
ON documents FOR ALL
USING (profile_id IN (SELECT id FROM ngo_profile WHERE user_id = auth.uid()));

-- Enable row level security
ALTER TABLE ngo_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY; 