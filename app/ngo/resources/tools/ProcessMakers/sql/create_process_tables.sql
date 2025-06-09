-- Create process_templates table
CREATE TABLE process_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NULL
);

-- Create process_steps table to store steps for each process template
CREATE TABLE process_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_template_id UUID REFERENCES process_templates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status_options JSONB NOT NULL, -- Store array of possible status values
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create process_instances table to track actual process instances
CREATE TABLE process_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_template_id UUID REFERENCES process_templates(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NULL
);

-- Create process_step_instances to track progress of each step in a process instance
CREATE TABLE process_step_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_instance_id UUID REFERENCES process_instances(id) ON DELETE CASCADE,
  process_step_id UUID REFERENCES process_steps(id),
  current_status VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_step_instances ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Public read access for process_templates" 
  ON process_templates FOR SELECT USING (true);

-- Modified policy to allow any insert without authentication check
CREATE POLICY "Anyone can create process_templates" 
  ON process_templates FOR INSERT WITH CHECK (true);

-- Modified policy to allow updates without strict user check
CREATE POLICY "Anyone can update process_templates" 
  ON process_templates FOR UPDATE USING (true);

-- Similar policies for the other tables
CREATE POLICY "Public read access for process_steps" 
  ON process_steps FOR SELECT USING (true);

-- Modified policy to allow anyone to manage process steps
CREATE POLICY "Anyone can manage process_steps" 
  ON process_steps FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_process_steps_template_id ON process_steps(process_template_id);
CREATE INDEX idx_process_instances_template_id ON process_instances(process_template_id);
CREATE INDEX idx_process_step_instances_instance_id ON process_step_instances(process_instance_id); 