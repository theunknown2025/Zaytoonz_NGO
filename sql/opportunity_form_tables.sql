-- Ensure uuid extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function for automatically updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create opportunities table first
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  location text,
  requirements text,
  start_date date,
  end_date date,
  hours text,
  skills text,
  categories text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Add update timestamp trigger for opportunities
CREATE TRIGGER update_opportunity_timestamp
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create forms_templates table if not exists
CREATE TABLE IF NOT EXISTS public.forms_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'draft',
  published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Table for storing form template choices when "Use Form Template" is selected
CREATE TABLE public.opportunity_form_choice (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  form_id uuid NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  
  -- Foreign key to opportunities table
  CONSTRAINT fk_opportunity
    FOREIGN KEY(opportunity_id)
    REFERENCES public.opportunities(id)
    ON DELETE CASCADE,
    
  -- Foreign key to forms_templates table
  CONSTRAINT fk_form_template
    FOREIGN KEY(form_id)
    REFERENCES public.forms_templates(id)
    ON DELETE CASCADE,
    
  -- Foreign key to users table
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX idx_opportunity_form_choice_opportunity_id ON public.opportunity_form_choice(opportunity_id);

-- Add update timestamp trigger
CREATE TRIGGER update_opportunity_form_choice_timestamp
BEFORE UPDATE ON opportunity_form_choice
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Table for storing email contacts when "Via Email" is selected
CREATE TABLE public.opportunity_form_email (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  contact_emails text[] NOT NULL DEFAULT '{}',
  reference_codes text[] NOT NULL DEFAULT '{}',
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  
  -- Foreign key to opportunities table
  CONSTRAINT fk_opportunity
    FOREIGN KEY(opportunity_id)
    REFERENCES public.opportunities(id)
    ON DELETE CASCADE,
    
  -- Foreign key to users table
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX idx_opportunity_form_email_opportunity_id ON public.opportunity_form_email(opportunity_id);

-- Add update timestamp trigger
CREATE TRIGGER update_opportunity_form_email_timestamp
BEFORE UPDATE ON opportunity_form_email
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Helper function to check if opportunity has an application method configured
CREATE OR REPLACE FUNCTION public.opportunity_has_application_method(opportunity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  has_form boolean;
  has_email boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM opportunity_form_choice WHERE opportunity_id = $1) INTO has_form;
  SELECT EXISTS(SELECT 1 FROM opportunity_form_email WHERE opportunity_id = $1) INTO has_email;
  
  RETURN has_form OR has_email;
END;
$$; 