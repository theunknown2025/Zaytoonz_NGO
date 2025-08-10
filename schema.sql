-- Create the profiles table with a type column to distinguish between Personnes and NGOs
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('Personne', 'NGO', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for NGO-specific information
CREATE TABLE ngo_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Personne-specific information
CREATE TABLE personne_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personne_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for ngo_profiles table
CREATE POLICY "Public NGO profiles are viewable by everyone"
  ON ngo_profiles FOR SELECT
  USING (true);

CREATE POLICY "NGOs can insert their own profile"
  ON ngo_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "NGOs can update their own profile"
  ON ngo_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for personne_profiles table
CREATE POLICY "Public Personne profiles are viewable by everyone"
  ON personne_profiles FOR SELECT
  USING (true);

CREATE POLICY "Personnes can insert their own profile"
  ON personne_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Personnes can update their own profile"
  ON personne_profiles FOR UPDATE
  USING (auth.uid() = id); 