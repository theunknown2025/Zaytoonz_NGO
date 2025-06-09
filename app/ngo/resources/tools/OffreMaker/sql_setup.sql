-- Create offres_templates table in Supabase
CREATE TABLE offres_templates (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE offres_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to select templates
CREATE POLICY "Users can view all templates" 
  ON offres_templates
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert their own templates
CREATE POLICY "Users can create templates" 
  ON offres_templates
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update their own templates
CREATE POLICY "Users can update their own templates" 
  ON offres_templates
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete their own templates
CREATE POLICY "Users can delete their own templates" 
  ON offres_templates
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create an index for better query performance
CREATE INDEX templates_title_idx ON offres_templates (title);

-- Enable full text search if needed
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX templates_title_trgm_idx ON offres_templates USING GIN (title gin_trgm_ops);

-- Create trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_offres_templates_updated_at
BEFORE UPDATE ON offres_templates
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 