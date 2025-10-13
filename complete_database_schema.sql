-- ================================================================
-- COMPLETE DATABASE SCHEMA FOR ZAYTOONZ NGO PLATFORM
-- Generated from Supabase project: Zaytoonz
-- Project ID: uroirdudxkfppocqcorm
-- ================================================================
-- This file contains the complete database schema including:
-- - All table definitions with columns and data types
-- - Primary keys
-- - Foreign key constraints
-- - Unique constraints
-- - Check constraints
-- - Default values
--
-- IMPORTANT: Tables are ordered by dependency to ensure proper creation
-- ================================================================

-- ================================================================
-- SECTION 0: SEQUENCES (Must be created before tables that use them)
-- ================================================================

-- Sequence for scrapped_opportunities table
CREATE SEQUENCE IF NOT EXISTS public.scrapped_opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ================================================================
-- TIER 1: FOUNDATION TABLES (No Dependencies)
-- ================================================================

-- Users table (main authentication table)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text,
    user_type text NOT NULL CHECK (user_type IN ('Personne', 'NGO', 'Admin', 'admin_ngo', 'assistant_ngo')),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    auth_provider character varying(50) DEFAULT 'email',
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.users IS 'Main user authentication table';
COMMENT ON COLUMN public.users.password_hash IS 'NULL for OAuth users, hashed password for email/password users';
COMMENT ON COLUMN public.users.user_type IS 'User type: Personne, NGO, Admin, admin_ngo (approved NGO administrators), or assistant_ngo (NGO team members)';

-- CVs table (no FK dependencies - user_id is text)
CREATE TABLE IF NOT EXISTS public.cvs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id text NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    sections text[] DEFAULT ARRAY['general', 'work', 'education'],
    available_sections text[] DEFAULT ARRAY['skills', 'languages', 'summary', 'certificates', 'projects', 'volunteering', 'publications', 'references', 'additional'],
    general_info jsonb DEFAULT '{"email": "", "phone": "", "gender": "", "address": "", "lastName": "", "birthDate": "", "firstName": "", "nationality": ""}'::jsonb,
    summary text DEFAULT '',
    additional text DEFAULT '',
    CONSTRAINT cvs_pkey PRIMARY KEY (id)
);

-- Opportunities table (main opportunities table)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    opportunity_type text CHECK (opportunity_type IN ('job', 'funding', 'training')),
    CONSTRAINT opportunities_pkey PRIMARY KEY (id)
);

COMMENT ON COLUMN public.opportunities.opportunity_type IS 'Type of opportunity: job, funding, or training';

-- Scraped Data table (raw scraper data)
CREATE TABLE IF NOT EXISTS public.scraped_data (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    unique_name text NOT NULL,
    url text,
    raw_data jsonb,
    formatted_data jsonb,
    pagination_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT scraped_data_pkey PRIMARY KEY (id)
);

-- Scraped Jobs table
CREATE TABLE IF NOT EXISTS public.scraped_jobs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title character varying(500) NOT NULL,
    company character varying(255),
    location character varying(255),
    job_type character varying(100),
    salary_range character varying(255),
    description text,
    requirements text,
    benefits text,
    application_deadline date,
    source_url character varying(1000) NOT NULL,
    scraped_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    tags text[],
    experience_level character varying(100),
    remote_work boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT scraped_jobs_pkey PRIMARY KEY (id)
);

-- Scrapped Opportunities table (legacy)
CREATE TABLE IF NOT EXISTS public.scrapped_opportunities (
    id integer NOT NULL DEFAULT nextval('scrapped_opportunities_id_seq'::regclass),
    title text NOT NULL,
    organization text NOT NULL,
    type text NOT NULL,
    description text,
    requirements text[],
    location text,
    deadline text,
    salary_range text,
    application_url text NOT NULL,
    tags text[],
    source_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'filled', 'archived')),
    CONSTRAINT scrapped_opportunities_pkey PRIMARY KEY (id)
);

-- Set sequence ownership
ALTER SEQUENCE IF EXISTS public.scrapped_opportunities_id_seq OWNED BY public.scrapped_opportunities.id;

-- Scraped Opportunities table (new)
CREATE TABLE IF NOT EXISTS public.scraped_opportunities (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title character varying(500) NOT NULL,
    opportunity_type character varying(20) NOT NULL CHECK (opportunity_type IN ('job', 'funding', 'training')),
    source_url character varying(1000) NOT NULL,
    scraper_config jsonb,
    status character varying(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    scraped_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT scraped_opportunities_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.scraped_opportunities IS 'Main table for opportunities scraped from external websites';
COMMENT ON COLUMN public.scraped_opportunities.source_url IS 'Original URL where the opportunity was scraped from';
COMMENT ON COLUMN public.scraped_opportunities.scraper_config IS 'Configuration used by scraper (field mappings, selectors, etc.)';

-- Scraped Opportunities Complete table (view/combined data)
CREATE TABLE IF NOT EXISTS public.scraped_opportunities_complete (
    id uuid,
    title character varying(500),
    opportunity_type character varying(20),
    source_url character varying(1000),
    status character varying(20),
    scraped_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    description text,
    location character varying(255),
    company character varying(255),
    hours character varying(100),
    deadline date,
    requirements text,
    benefits text,
    salary_range character varying(255),
    contact_info text,
    tags text[],
    metadata jsonb,
    scraper_config jsonb
);

-- Active Scrapped Opportunities table (view)
CREATE TABLE IF NOT EXISTS public.active_scrapped_opportunities (
    id integer,
    title text,
    organization text,
    type text,
    description text,
    requirements text[],
    location text,
    deadline text,
    salary_range text,
    application_url text,
    tags text[],
    source_url text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    status text
);

-- Offres Templates table
CREATE TABLE IF NOT EXISTS public.offres_templates (
    id uuid NOT NULL,
    title text NOT NULL,
    description text,
    fields jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    published boolean DEFAULT false,
    created_by uuid,
    is_admin_template boolean DEFAULT false,
    CONSTRAINT offres_templates_pkey PRIMARY KEY (id),
    CONSTRAINT offres_templates_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION
);

-- ================================================================
-- TIER 2: TABLES THAT DEPEND ON TIER 1
-- ================================================================

-- Seeker Profiles table (depends on: users)
CREATE TABLE IF NOT EXISTS public.seeker_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    first_name character varying(100),
    last_name character varying(100),
    date_of_birth date,
    nationality character varying(100),
    years_of_experience integer,
    fields_of_experience text[],
    about_me text,
    profile_picture_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    latest_job_title text,
    CONSTRAINT seeker_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT seeker_profiles_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE
);

COMMENT ON COLUMN public.seeker_profiles.latest_job_title IS 'The most recent job title of the seeker';

-- NGO Profile table (depends on: users)
CREATE TABLE IF NOT EXISTS public.ngo_profile (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    year_created text NOT NULL,
    legal_rep_name text NOT NULL,
    legal_rep_email text NOT NULL,
    legal_rep_phone text NOT NULL,
    legal_rep_function text NOT NULL,
    profile_image_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    admin_notes text,
    approved_at timestamp with time zone,
    approved_by uuid,
    CONSTRAINT ngo_profile_pkey PRIMARY KEY (id),
    CONSTRAINT ngo_profile_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT ngo_profile_approved_by_fkey FOREIGN KEY (approved_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION
);

COMMENT ON COLUMN public.ngo_profile.approval_status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN public.ngo_profile.admin_notes IS 'Admin notes about the approval decision';
COMMENT ON COLUMN public.ngo_profile.approved_at IS 'Timestamp when the NGO was approved';
COMMENT ON COLUMN public.ngo_profile.approved_by IS 'Admin user ID who approved the NGO';

-- Forms Templates table (depends on: users)
CREATE TABLE IF NOT EXISTS public.forms_templates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title character varying(255) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'draft',
    sections jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    published boolean DEFAULT false,
    publish_link text,
    is_admin_template boolean DEFAULT false,
    CONSTRAINT forms_templates_pkey PRIMARY KEY (id),
    CONSTRAINT fk_forms_templates_user FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE SET NULL
);

-- Evaluation Templates table (depends on: users)
CREATE TABLE IF NOT EXISTS public.evaluation_templates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    description text,
    scale integer NOT NULL DEFAULT 10,
    criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    published boolean DEFAULT false,
    is_admin_template boolean DEFAULT false,
    CONSTRAINT evaluation_templates_pkey PRIMARY KEY (id),
    CONSTRAINT evaluation_templates_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION
);

-- Scraped Opportunity Details table (depends on: scraped_opportunities)
CREATE TABLE IF NOT EXISTS public.scraped_opportunity_details (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    scraped_opportunity_id uuid NOT NULL,
    description text,
    location character varying(255),
    company character varying(255),
    hours character varying(100),
    deadline date,
    requirements text,
    benefits text,
    salary_range character varying(255),
    contact_info text,
    tags text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT scraped_opportunity_details_pkey PRIMARY KEY (id),
    CONSTRAINT scraped_opportunity_details_scraped_opportunity_id_fkey FOREIGN KEY (scraped_opportunity_id) 
        REFERENCES public.scraped_opportunities(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.scraped_opportunity_details IS 'Detailed information for scraped opportunities';
COMMENT ON COLUMN public.scraped_opportunity_details.metadata IS 'Additional scraped fields that don''t fit in standard columns';

-- ================================================================
-- TIER 3: TABLES THAT DEPEND ON TIER 2
-- ================================================================

-- NGO Users table (depends on: users, ngo_profile)
CREATE TABLE IF NOT EXISTS public.ngo_users (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    ngo_profile_id uuid NOT NULL,
    user_id uuid,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    status character varying(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ngo_users_pkey PRIMARY KEY (id),
    CONSTRAINT ngo_users_ngo_profile_id_fkey FOREIGN KEY (ngo_profile_id) 
        REFERENCES public.ngo_profile(id) ON DELETE CASCADE,
    CONSTRAINT ngo_users_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT ngo_users_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION,
    CONSTRAINT ngo_users_ngo_profile_id_email_key UNIQUE (ngo_profile_id, email)
);

COMMENT ON TABLE public.ngo_users IS 'Additional users who have access to the same NGO account for team management';
COMMENT ON COLUMN public.ngo_users.ngo_profile_id IS 'Reference to the NGO profile this user belongs to';
COMMENT ON COLUMN public.ngo_users.user_id IS 'Reference to the main users table (nullable for pending invitations)';
COMMENT ON COLUMN public.ngo_users.password_hash IS 'Hashed password for this team member';
COMMENT ON COLUMN public.ngo_users.role IS 'Role within the NGO: admin, member, or viewer';
COMMENT ON COLUMN public.ngo_users.status IS 'Status of the user: active, inactive, or pending';
COMMENT ON COLUMN public.ngo_users.created_by IS 'User who created this team member';

-- Additional Info table (depends on: ngo_profile)
CREATE TABLE IF NOT EXISTS public.additional_info (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    profile_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT additional_info_pkey PRIMARY KEY (id),
    CONSTRAINT additional_info_profile_id_fkey FOREIGN KEY (profile_id) 
        REFERENCES public.ngo_profile(id) ON DELETE CASCADE
);

-- Documents table (depends on: ngo_profile)
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    profile_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT documents_pkey PRIMARY KEY (id),
    CONSTRAINT documents_profile_id_fkey FOREIGN KEY (profile_id) 
        REFERENCES public.ngo_profile(id) ON DELETE CASCADE
);

-- CV Work Experiences table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_work_experiences (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    position character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    location character varying(255),
    start_date date,
    end_date date,
    is_current boolean DEFAULT false,
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_work_experiences_pkey PRIMARY KEY (id),
    CONSTRAINT cv_work_experiences_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

-- CV Education table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_education (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    degree character varying(255) NOT NULL,
    institution character varying(255) NOT NULL,
    location character varying(255),
    start_date date,
    end_date date,
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_education_pkey PRIMARY KEY (id),
    CONSTRAINT cv_education_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

-- CV Skills table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_skills (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    name character varying(255) NOT NULL,
    level character varying(50) DEFAULT 'intermediate',
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_skills_pkey PRIMARY KEY (id),
    CONSTRAINT cv_skills_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

-- CV Languages table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_languages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    language character varying(255) NOT NULL,
    proficiency character varying(50) DEFAULT 'intermediate',
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_languages_pkey PRIMARY KEY (id),
    CONSTRAINT cv_languages_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

-- CV Certificates table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_certificates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    name character varying(255) NOT NULL,
    issuer character varying(255),
    issue_date date,
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_certificates_pkey PRIMARY KEY (id),
    CONSTRAINT cv_certificates_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

-- CV Projects table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_projects (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    title character varying(255) NOT NULL,
    role character varying(255),
    start_date date,
    end_date date,
    description text,
    url character varying(500),
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_projects_pkey PRIMARY KEY (id),
    CONSTRAINT cv_projects_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

-- CV External Links table (depends on: cvs)
CREATE TABLE IF NOT EXISTS public.cv_external_links (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    cv_id uuid,
    platform character varying NOT NULL,
    url character varying NOT NULL,
    display_name character varying,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_external_links_pkey PRIMARY KEY (id),
    CONSTRAINT cv_external_links_cv_id_fkey FOREIGN KEY (cv_id) 
        REFERENCES public.cvs(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.cv_external_links IS 'External profile links associated with CVs (LinkedIn, GitHub, etc.)';

-- Opportunity Description table (depends on: users, opportunities)
CREATE TABLE IF NOT EXISTS public.opportunity_description (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    opportunity_id uuid,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255),
    hours character varying(100),
    status character varying(50) DEFAULT 'draft',
    step character varying(50) DEFAULT 'description',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    criteria jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT opportunity_description_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_description_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_opportunity_description_opportunity FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE
);

COMMENT ON COLUMN public.opportunity_description.criteria IS 'Stores opportunity criteria including standard filters (contractType, level, sector, etc.) and custom filters as key-value pairs';

-- Form Pictures table (depends on: forms_templates)
CREATE TABLE IF NOT EXISTS public.form_pictures (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    form_id uuid NOT NULL,
    file_path text NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT form_pictures_pkey PRIMARY KEY (id),
    CONSTRAINT form_pictures_form_id_fkey FOREIGN KEY (form_id) 
        REFERENCES public.forms_templates(id) ON DELETE CASCADE
);

-- Form Responses table (depends on: forms_templates)
CREATE TABLE IF NOT EXISTS public.form_responses (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    form_id uuid NOT NULL,
    response_data jsonb NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    submitted_by uuid,
    ip_address character varying(45),
    CONSTRAINT form_responses_pkey PRIMARY KEY (id),
    CONSTRAINT form_responses_form_id_fkey FOREIGN KEY (form_id) 
        REFERENCES public.forms_templates(id) ON DELETE CASCADE
);

-- Opportunity Form Choice table (depends on: opportunities, forms_templates, users)
CREATE TABLE IF NOT EXISTS public.opportunity_form_choice (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    opportunity_id uuid NOT NULL,
    form_id uuid NOT NULL,
    user_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_form_choice_pkey PRIMARY KEY (id),
    CONSTRAINT fk_opportunity FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_form_template FOREIGN KEY (form_id) 
        REFERENCES public.forms_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE SET NULL
);

-- Opportunity Form Email table (depends on: opportunities, users)
CREATE TABLE IF NOT EXISTS public.opportunity_form_email (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    opportunity_id uuid NOT NULL,
    contact_emails text[] NOT NULL DEFAULT '{}',
    reference_codes text[] NOT NULL DEFAULT '{}',
    user_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_form_email_pkey PRIMARY KEY (id),
    CONSTRAINT fk_opportunity FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE SET NULL
);

-- Opportunity Evaluations table (depends on: opportunities, evaluation_templates, users)
CREATE TABLE IF NOT EXISTS public.opportunity_evaluations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    opportunity_id uuid NOT NULL,
    evaluation_template_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT opportunity_evaluations_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_evaluations_opportunity_id_fkey FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_evaluations_evaluation_template_id_fkey FOREIGN KEY (evaluation_template_id) 
        REFERENCES public.evaluation_templates(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_evaluations_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION,
    CONSTRAINT opportunity_evaluations_opportunity_id_evaluation_template__key 
        UNIQUE (opportunity_id, evaluation_template_id)
);

-- ================================================================
-- TIER 4: TABLES THAT DEPEND ON TIER 3
-- ================================================================

-- Opportunity Applications table (depends on: opportunities, users, forms_templates, cvs)
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    opportunity_id uuid NOT NULL,
    seeker_user_id uuid NOT NULL,
    form_id uuid NOT NULL,
    application_data jsonb NOT NULL,
    status character varying(50) DEFAULT 'submitted',
    submitted_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    selected_cv_id uuid,
    selected_cv_name text,
    CONSTRAINT opportunity_applications_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_applications_opportunity_id_fkey FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_applications_seeker_user_id_fkey FOREIGN KEY (seeker_user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_applications_form_id_fkey FOREIGN KEY (form_id) 
        REFERENCES public.forms_templates(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_applications_selected_cv_id_fkey FOREIGN KEY (selected_cv_id) 
        REFERENCES public.cvs(id) ON DELETE SET NULL,
    CONSTRAINT opportunity_applications_opportunity_id_seeker_user_id_form_key 
        UNIQUE (opportunity_id, seeker_user_id, form_id)
);

COMMENT ON COLUMN public.opportunity_applications.selected_cv_id IS 'Reference to the CV selected by the applicant for this application';
COMMENT ON COLUMN public.opportunity_applications.selected_cv_name IS 'Name of the CV at the time of application submission (for historical reference)';

-- ================================================================
-- TIER 5: TABLES THAT DEPEND ON TIER 4
-- ================================================================

-- Evaluation Results table (depends on: opportunity_applications, opportunities, evaluation_templates, users)
CREATE TABLE IF NOT EXISTS public.evaluation_results (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    application_id uuid NOT NULL,
    opportunity_id uuid NOT NULL,
    evaluation_template_id uuid NOT NULL,
    criteria_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
    total_score numeric NOT NULL DEFAULT 0,
    max_score numeric NOT NULL DEFAULT 0,
    percentage_score numeric NOT NULL DEFAULT 0,
    notes text,
    evaluated_at timestamp with time zone DEFAULT now(),
    evaluated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT evaluation_results_pkey PRIMARY KEY (id),
    CONSTRAINT evaluation_results_application_id_fkey FOREIGN KEY (application_id) 
        REFERENCES public.opportunity_applications(id) ON DELETE CASCADE,
    CONSTRAINT evaluation_results_opportunity_id_fkey FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE,
    CONSTRAINT evaluation_results_evaluation_template_id_fkey FOREIGN KEY (evaluation_template_id) 
        REFERENCES public.evaluation_templates(id) ON DELETE CASCADE,
    CONSTRAINT evaluation_results_evaluated_by_fkey FOREIGN KEY (evaluated_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION,
    CONSTRAINT evaluation_results_application_id_evaluation_template_id_key 
        UNIQUE (application_id, evaluation_template_id)
);

-- ================================================================
-- TIER 6: PROCESS MANAGEMENT TABLES (Special Dependencies)
-- ================================================================

-- Process Templates table (depends on: auth.users)
CREATE TABLE IF NOT EXISTS public.process_templates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(100) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'draft',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    published boolean DEFAULT false,
    is_admin_template boolean DEFAULT false,
    CONSTRAINT process_templates_pkey PRIMARY KEY (id),
    CONSTRAINT process_templates_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES auth.users(id) ON DELETE NO ACTION
);

-- Process Steps table (depends on: process_templates)
CREATE TABLE IF NOT EXISTS public.process_steps (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    process_template_id uuid,
    name character varying(100) NOT NULL,
    description text,
    status_options jsonb NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT process_steps_pkey PRIMARY KEY (id),
    CONSTRAINT process_steps_process_template_id_fkey FOREIGN KEY (process_template_id) 
        REFERENCES public.process_templates(id) ON DELETE CASCADE
);

-- Process Instances table (depends on: process_templates, auth.users)
CREATE TABLE IF NOT EXISTS public.process_instances (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    process_template_id uuid,
    name character varying(100) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_by uuid,
    CONSTRAINT process_instances_pkey PRIMARY KEY (id),
    CONSTRAINT process_instances_process_template_id_fkey FOREIGN KEY (process_template_id) 
        REFERENCES public.process_templates(id) ON DELETE NO ACTION,
    CONSTRAINT process_instances_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES auth.users(id) ON DELETE NO ACTION
);

-- Process Step Instances table (depends on: process_instances, process_steps)
CREATE TABLE IF NOT EXISTS public.process_step_instances (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    process_instance_id uuid,
    process_step_id uuid,
    current_status character varying(100) NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT process_step_instances_pkey PRIMARY KEY (id),
    CONSTRAINT process_step_instances_process_instance_id_fkey FOREIGN KEY (process_instance_id) 
        REFERENCES public.process_instances(id) ON DELETE CASCADE,
    CONSTRAINT process_step_instances_process_step_id_fkey FOREIGN KEY (process_step_id) 
        REFERENCES public.process_steps(id) ON DELETE NO ACTION
);

-- Opportunity Processes table (depends on: opportunities, process_templates, users)
CREATE TABLE IF NOT EXISTS public.opportunity_processes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    opportunity_id uuid NOT NULL,
    process_template_id uuid NOT NULL,
    status character varying(50) NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    CONSTRAINT opportunity_processes_pkey PRIMARY KEY (id),
    CONSTRAINT fk_opportunity_processes_opportunity FOREIGN KEY (opportunity_id) 
        REFERENCES public.opportunities(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_processes_process_template_id_fkey FOREIGN KEY (process_template_id) 
        REFERENCES public.process_templates(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_processes_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES public.users(id) ON DELETE NO ACTION
);

-- Opportunity Process Steps table (depends on: opportunity_processes, process_steps)
CREATE TABLE IF NOT EXISTS public.opportunity_process_steps (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    opportunity_process_id uuid NOT NULL,
    process_step_id uuid NOT NULL,
    status character varying(50) NOT NULL DEFAULT 'pending',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid,
    CONSTRAINT opportunity_process_steps_pkey PRIMARY KEY (id),
    CONSTRAINT fk_opportunity_process_steps_opportunity_process FOREIGN KEY (opportunity_process_id) 
        REFERENCES public.opportunity_processes(id) ON DELETE CASCADE,
    CONSTRAINT opportunity_process_steps_process_step_id_fkey FOREIGN KEY (process_step_id) 
        REFERENCES public.process_steps(id) ON DELETE CASCADE
);

-- ================================================================
-- TIER 7: AI CONVERSATIONS TABLE
-- ================================================================

-- Morchid Conversations table (depends on: auth.users)
CREATE TABLE IF NOT EXISTS public.morchid_conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    user_message text NOT NULL,
    ai_response text NOT NULL,
    conversation_context jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT morchid_conversations_pkey PRIMARY KEY (id),
    CONSTRAINT morchid_conversations_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- Summary of Creation Order:
-- SECTION 0: Sequences - 1 sequence (scrapped_opportunities_id_seq)
-- TIER 1: Foundation tables (no dependencies) - 9 tables
-- TIER 2: Depends on Tier 1 - 7 tables
-- TIER 3: Depends on Tier 2 - 14 tables
-- TIER 4: Depends on Tier 3 - 1 table
-- TIER 5: Depends on Tier 4 - 1 table
-- TIER 6: Process Management - 6 tables
-- TIER 7: AI Conversations - 1 table
-- Total: 1 sequence + 44 tables
