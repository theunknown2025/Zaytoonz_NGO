-- SQL for creating the opportunity process related tables
-- These tables should be created in your Supabase project

-- Table to store the relationship between opportunities and process templates
CREATE TABLE IF NOT EXISTS public.opportunity_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL,
    process_template_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    FOREIGN KEY (process_template_id) REFERENCES public.process_templates(id) ON DELETE CASCADE,
    -- Uncomment and adjust if you have an opportunities table
    -- FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE,
    -- Uncomment and adjust if you have a users table
    -- FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_opportunity_processes_opportunity_id ON public.opportunity_processes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_processes_template_id ON public.opportunity_processes(process_template_id);

-- Table to store the status of each process step for an opportunity
CREATE TABLE IF NOT EXISTS public.opportunity_process_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_process_id UUID NOT NULL,
    process_step_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID,
    FOREIGN KEY (opportunity_process_id) REFERENCES public.opportunity_processes(id) ON DELETE CASCADE,
    FOREIGN KEY (process_step_id) REFERENCES public.process_steps(id) ON DELETE CASCADE
    -- Uncomment and adjust if you have a users table
    -- FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_opportunity_process_steps_process_id ON public.opportunity_process_steps(opportunity_process_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_process_steps_step_id ON public.opportunity_process_steps(process_step_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER set_timestamp_opportunity_processes
BEFORE UPDATE ON public.opportunity_processes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_opportunity_process_steps
BEFORE UPDATE ON public.opportunity_process_steps
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add Row Level Security (RLS) policies if needed
-- Example:
/*
ALTER TABLE public.opportunity_processes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization's opportunity processes" 
ON public.opportunity_processes FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.organization_members 
  WHERE organization_id = (
    SELECT organization_id FROM public.opportunities WHERE id = opportunity_id
  )
));

ALTER TABLE public.opportunity_process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization's opportunity process steps" 
ON public.opportunity_process_steps FOR SELECT 
USING (opportunity_process_id IN (
  SELECT id FROM public.opportunity_processes WHERE opportunity_id IN (
    SELECT id FROM public.opportunities WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  )
));
*/ 