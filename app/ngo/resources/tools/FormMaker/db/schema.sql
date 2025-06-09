-- Table for storing form templates
CREATE TABLE forms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' or 'published'
  sections JSONB NOT NULL, -- Store form sections and questions as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID -- Reference to the user who created the form (if you have auth)
);

-- Add new columns to forms_templates table
ALTER TABLE forms_templates ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE forms_templates ADD COLUMN IF NOT EXISTS publish_link TEXT;

-- Table for storing form header images
CREATE TABLE form_pictures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms_templates(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookup
CREATE INDEX idx_form_pictures_form_id ON form_pictures(form_id);

-- Table for storing form responses (optional - for future use)
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms_templates(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_by UUID, -- Optional: user who submitted the form
  ip_address VARCHAR(45) -- Optional: store IP address of submission
);

-- Enable Row Level Security if using with Supabase Auth
ALTER TABLE forms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Policies (examples - adjust based on your auth requirements)
CREATE POLICY "Users can view their own forms" 
  ON forms_templates FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own forms" 
  ON forms_templates FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own forms" 
  ON forms_templates FOR UPDATE 
  USING (user_id = auth.uid());

-- Trigger for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forms_templates_timestamp
BEFORE UPDATE ON forms_templates
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_form_pictures_timestamp
BEFORE UPDATE ON form_pictures
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 