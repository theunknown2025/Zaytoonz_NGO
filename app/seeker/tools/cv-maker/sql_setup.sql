-- CV Maker Database Schema
-- This file creates all necessary tables for storing CV data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main CVs table
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- For now using TEXT, can be changed to UUID if you implement proper auth
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sections TEXT[] DEFAULT ARRAY['general', 'work', 'education'], -- Active sections
  available_sections TEXT[] DEFAULT ARRAY['skills', 'languages', 'summary', 'certificates', 'projects', 'volunteering', 'publications', 'references', 'additional'], -- Available sections to add
  
  -- General information (embedded as JSONB for flexibility)
  general_info JSONB DEFAULT '{
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "address": "",
    "nationality": "",
    "birthDate": "",
    "gender": ""
  }'::jsonb,
  
  -- Simple text fields
  summary TEXT DEFAULT '',
  additional TEXT DEFAULT ''
);

-- Work experiences table
CREATE TABLE cv_work_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  position VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE cv_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE cv_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Languages table
CREATE TABLE cv_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  language VARCHAR(255) NOT NULL,
  proficiency VARCHAR(50) DEFAULT 'intermediate', -- beginner, intermediate, advanced, native
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table
CREATE TABLE cv_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  issue_date DATE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE cv_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  start_date DATE,
  end_date DATE,
  description TEXT,
  url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cv_work_experiences_cv_id ON cv_work_experiences(cv_id);
CREATE INDEX idx_cv_education_cv_id ON cv_education(cv_id);
CREATE INDEX idx_cv_skills_cv_id ON cv_skills(cv_id);
CREATE INDEX idx_cv_languages_cv_id ON cv_languages(cv_id);
CREATE INDEX idx_cv_certificates_cv_id ON cv_certificates(cv_id);
CREATE INDEX idx_cv_projects_cv_id ON cv_projects(cv_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to cvs table
CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON cvs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_projects ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this based on user authentication later)
CREATE POLICY "Allow all operations on cvs" ON cvs FOR ALL USING (true);
CREATE POLICY "Allow all operations on cv_work_experiences" ON cv_work_experiences FOR ALL USING (true);
CREATE POLICY "Allow all operations on cv_education" ON cv_education FOR ALL USING (true);
CREATE POLICY "Allow all operations on cv_skills" ON cv_skills FOR ALL USING (true);
CREATE POLICY "Allow all operations on cv_languages" ON cv_languages FOR ALL USING (true);
CREATE POLICY "Allow all operations on cv_certificates" ON cv_certificates FOR ALL USING (true);
CREATE POLICY "Allow all operations on cv_projects" ON cv_projects FOR ALL USING (true); 