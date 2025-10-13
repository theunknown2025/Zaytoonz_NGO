-- ================================================================
-- DATABASE INDEXES AND SEQUENCES
-- Generated from Supabase project: Zaytoonz
-- Project ID: uroirdudxkfppocqcorm
-- ================================================================
-- This file contains:
-- - All sequences for auto-incrementing columns
-- - All indexes for performance optimization
-- - RLS (Row Level Security) policies (if any)
-- ================================================================

-- ================================================================
-- SECTION 1: INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================
-- Note: Sequences are created in complete_database_schema.sql
-- ================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Seeker Profiles indexes
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_user_id ON public.seeker_profiles(user_id);

-- NGO Profile indexes
CREATE INDEX IF NOT EXISTS idx_ngo_profile_user_id ON public.ngo_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_profile_approval_status ON public.ngo_profile(approval_status);
CREATE INDEX IF NOT EXISTS idx_ngo_profile_approved_by ON public.ngo_profile(approved_by);

-- NGO Users indexes
CREATE INDEX IF NOT EXISTS idx_ngo_users_ngo_profile_id ON public.ngo_users(ngo_profile_id);
CREATE INDEX IF NOT EXISTS idx_ngo_users_user_id ON public.ngo_users(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_users_email ON public.ngo_users(email);
CREATE INDEX IF NOT EXISTS idx_ngo_users_status ON public.ngo_users(status);

-- Additional Info indexes
CREATE INDEX IF NOT EXISTS idx_additional_info_profile_id ON public.additional_info(profile_id);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON public.documents(profile_id);

-- CVs indexes
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON public.cvs(user_id);

-- CV Work Experiences indexes
CREATE INDEX IF NOT EXISTS idx_cv_work_experiences_cv_id ON public.cv_work_experiences(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_work_experiences_is_current ON public.cv_work_experiences(is_current);

-- CV Education indexes
CREATE INDEX IF NOT EXISTS idx_cv_education_cv_id ON public.cv_education(cv_id);

-- CV Skills indexes
CREATE INDEX IF NOT EXISTS idx_cv_skills_cv_id ON public.cv_skills(cv_id);

-- CV Languages indexes
CREATE INDEX IF NOT EXISTS idx_cv_languages_cv_id ON public.cv_languages(cv_id);

-- CV Certificates indexes
CREATE INDEX IF NOT EXISTS idx_cv_certificates_cv_id ON public.cv_certificates(cv_id);

-- CV Projects indexes
CREATE INDEX IF NOT EXISTS idx_cv_projects_cv_id ON public.cv_projects(cv_id);

-- CV External Links indexes
CREATE INDEX IF NOT EXISTS idx_cv_external_links_cv_id ON public.cv_external_links(cv_id);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_opportunity_type ON public.opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at);

-- Opportunity Description indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_description_user_id ON public.opportunity_description(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_description_opportunity_id ON public.opportunity_description(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_description_status ON public.opportunity_description(status);

-- Opportunity Applications indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity_id ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_seeker_user_id ON public.opportunity_applications(seeker_user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_form_id ON public.opportunity_applications(form_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_status ON public.opportunity_applications(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_submitted_at ON public.opportunity_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_selected_cv_id ON public.opportunity_applications(selected_cv_id);

-- Forms Templates indexes
CREATE INDEX IF NOT EXISTS idx_forms_templates_user_id ON public.forms_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_templates_published ON public.forms_templates(published);
CREATE INDEX IF NOT EXISTS idx_forms_templates_status ON public.forms_templates(status);

-- Form Pictures indexes
CREATE INDEX IF NOT EXISTS idx_form_pictures_form_id ON public.form_pictures(form_id);

-- Form Responses indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON public.form_responses(submitted_at);

-- Opportunity Form Choice indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_form_choice_opportunity_id ON public.opportunity_form_choice(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_form_choice_form_id ON public.opportunity_form_choice(form_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_form_choice_user_id ON public.opportunity_form_choice(user_id);

-- Opportunity Form Email indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_form_email_opportunity_id ON public.opportunity_form_email(opportunity_id);

-- Evaluation Templates indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_templates_created_by ON public.evaluation_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_evaluation_templates_published ON public.evaluation_templates(published);

-- Opportunity Evaluations indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_evaluations_opportunity_id ON public.opportunity_evaluations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_evaluations_evaluation_template_id ON public.opportunity_evaluations(evaluation_template_id);

-- Evaluation Results indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_results_application_id ON public.evaluation_results(application_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_opportunity_id ON public.evaluation_results(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_template_id ON public.evaluation_results(evaluation_template_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluated_by ON public.evaluation_results(evaluated_by);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluated_at ON public.evaluation_results(evaluated_at);

-- Process Templates indexes
CREATE INDEX IF NOT EXISTS idx_process_templates_created_by ON public.process_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_process_templates_status ON public.process_templates(status);

-- Process Steps indexes
CREATE INDEX IF NOT EXISTS idx_process_steps_process_template_id ON public.process_steps(process_template_id);

-- Process Instances indexes
CREATE INDEX IF NOT EXISTS idx_process_instances_process_template_id ON public.process_instances(process_template_id);
CREATE INDEX IF NOT EXISTS idx_process_instances_status ON public.process_instances(status);
CREATE INDEX IF NOT EXISTS idx_process_instances_created_by ON public.process_instances(created_by);

-- Process Step Instances indexes
CREATE INDEX IF NOT EXISTS idx_process_step_instances_process_instance_id ON public.process_step_instances(process_instance_id);
CREATE INDEX IF NOT EXISTS idx_process_step_instances_process_step_id ON public.process_step_instances(process_step_id);

-- Opportunity Processes indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_processes_opportunity_id ON public.opportunity_processes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_processes_process_template_id ON public.opportunity_processes(process_template_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_processes_status ON public.opportunity_processes(status);

-- Opportunity Process Steps indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_process_steps_opportunity_process_id ON public.opportunity_process_steps(opportunity_process_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_process_steps_process_step_id ON public.opportunity_process_steps(process_step_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_process_steps_status ON public.opportunity_process_steps(status);

-- Scraped Data indexes
CREATE INDEX IF NOT EXISTS idx_scraped_data_unique_name ON public.scraped_data(unique_name);
CREATE INDEX IF NOT EXISTS idx_scraped_data_created_at ON public.scraped_data(created_at);

-- Scraped Jobs indexes
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_company ON public.scraped_jobs(company);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_location ON public.scraped_jobs(location);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_job_type ON public.scraped_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_is_active ON public.scraped_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_scraped_at ON public.scraped_jobs(scraped_at);

-- Scrapped Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_scrapped_opportunities_organization ON public.scrapped_opportunities(organization);
CREATE INDEX IF NOT EXISTS idx_scrapped_opportunities_type ON public.scrapped_opportunities(type);
CREATE INDEX IF NOT EXISTS idx_scrapped_opportunities_status ON public.scrapped_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_scrapped_opportunities_created_at ON public.scrapped_opportunities(created_at);

-- Scraped Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_opportunity_type ON public.scraped_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_status ON public.scraped_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_scraped_at ON public.scraped_opportunities(scraped_at);

-- Scraped Opportunity Details indexes
CREATE INDEX IF NOT EXISTS idx_scraped_opportunity_details_scraped_opportunity_id ON public.scraped_opportunity_details(scraped_opportunity_id);

-- Offres Templates indexes
CREATE INDEX IF NOT EXISTS idx_offres_templates_created_by ON public.offres_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_offres_templates_published ON public.offres_templates(published);

-- Morchid Conversations indexes
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_user_id ON public.morchid_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_morchid_conversations_created_at ON public.morchid_conversations(created_at);

-- ================================================================
-- SECTION 3: FULL TEXT SEARCH INDEXES (if needed)
-- ================================================================

-- Full text search on opportunity titles and descriptions
CREATE INDEX IF NOT EXISTS idx_opportunities_title_fts ON public.opportunities USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_opportunity_description_title_fts ON public.opportunity_description USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_opportunity_description_description_fts ON public.opportunity_description USING gin(to_tsvector('english', description));

CREATE INDEX IF NOT EXISTS idx_scraped_jobs_title_fts ON public.scraped_jobs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_description_fts ON public.scraped_jobs USING gin(to_tsvector('english', description));

-- ================================================================
-- SECTION 4: COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ================================================================

-- User type and email for authentication
CREATE INDEX IF NOT EXISTS idx_users_user_type_email ON public.users(user_type, email);

-- Opportunity applications by status and submission date
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_status_submitted_at ON public.opportunity_applications(status, submitted_at DESC);

-- NGO profile by approval status and creation date
CREATE INDEX IF NOT EXISTS idx_ngo_profile_approval_status_created_at ON public.ngo_profile(approval_status, created_at DESC);

-- Scraped jobs by active status and scraped date
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_is_active_scraped_at ON public.scraped_jobs(is_active, scraped_at DESC);

-- Evaluation results by opportunity and template
CREATE INDEX IF NOT EXISTS idx_evaluation_results_opportunity_template ON public.evaluation_results(opportunity_id, evaluation_template_id);

-- ================================================================
-- END OF INDEXES AND SEQUENCES
-- ================================================================

-- Summary:
-- - Sequences: 1 (scrapped_opportunities_id_seq)
-- - Single column indexes: 80+
-- - Full text search indexes: 5
-- - Composite indexes: 6
-- - Total indexes: 90+

