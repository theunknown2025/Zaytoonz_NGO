-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES AND TRIGGERS
-- Generated from Supabase project: Zaytoonz
-- Project ID: uroirdudxkfppocqcorm
-- ================================================================
-- This file contains:
-- - Row Level Security policies
-- - Database triggers
-- - Functions and stored procedures
-- ================================================================

-- ================================================================
-- SECTION 1: ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on tables that have it
ALTER TABLE IF EXISTS public.cv_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.morchid_conversations ENABLE ROW LEVEL SECURITY;

-- Note: The actual RLS policies need to be defined based on your security requirements.
-- Below are example policies that you may want to implement:

-- ================================================================
-- SECTION 2: EXAMPLE RLS POLICIES
-- ================================================================

-- CVs policies
-- Users can only see and modify their own CVs
-- CREATE POLICY "Users can view their own CVs" ON public.cvs
--     FOR SELECT
--     USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own CVs" ON public.cvs
--     FOR INSERT
--     WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can update their own CVs" ON public.cvs
--     FOR UPDATE
--     USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can delete their own CVs" ON public.cvs
--     FOR DELETE
--     USING (auth.uid()::text = user_id);

-- CV Work Experiences policies
-- CREATE POLICY "Users can view their own work experiences" ON public.cv_work_experiences
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.cvs
--             WHERE cvs.id = cv_work_experiences.cv_id
--             AND cvs.user_id = auth.uid()::text
--         )
--     );

-- CREATE POLICY "Users can insert work experiences for their CVs" ON public.cv_work_experiences
--     FOR INSERT
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM public.cvs
--             WHERE cvs.id = cv_work_experiences.cv_id
--             AND cvs.user_id = auth.uid()::text
--         )
--     );

-- CREATE POLICY "Users can update their own work experiences" ON public.cv_work_experiences
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.cvs
--             WHERE cvs.id = cv_work_experiences.cv_id
--             AND cvs.user_id = auth.uid()::text
--         )
--     );

-- CREATE POLICY "Users can delete their own work experiences" ON public.cv_work_experiences
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.cvs
--             WHERE cvs.id = cv_work_experiences.cv_id
--             AND cvs.user_id = auth.uid()::text
--         )
--     );

-- Similar policies should be created for:
-- - cv_education
-- - cv_skills
-- - cv_languages
-- - cv_certificates
-- - cv_projects
-- - cv_external_links

-- Seeker Profiles policies
-- CREATE POLICY "Users can view their own seeker profile" ON public.seeker_profiles
--     FOR SELECT
--     USING (user_id = auth.uid());

-- CREATE POLICY "Users can insert their own seeker profile" ON public.seeker_profiles
--     FOR INSERT
--     WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Users can update their own seeker profile" ON public.seeker_profiles
--     FOR UPDATE
--     USING (user_id = auth.uid());

-- CREATE POLICY "Users can delete their own seeker profile" ON public.seeker_profiles
--     FOR DELETE
--     USING (user_id = auth.uid());

-- Morchid Conversations policies
-- CREATE POLICY "Users can view their own conversations" ON public.morchid_conversations
--     FOR SELECT
--     USING (user_id = auth.uid());

-- CREATE POLICY "Users can insert their own conversations" ON public.morchid_conversations
--     FOR INSERT
--     WITH CHECK (user_id = auth.uid());

-- ================================================================
-- SECTION 3: TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeker_profiles_updated_at BEFORE UPDATE ON public.seeker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ngo_profile_updated_at BEFORE UPDATE ON public.ngo_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ngo_users_updated_at BEFORE UPDATE ON public.ngo_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON public.cvs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_external_links_updated_at BEFORE UPDATE ON public.cv_external_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_description_updated_at BEFORE UPDATE ON public.opportunity_description
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_applications_updated_at BEFORE UPDATE ON public.opportunity_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_templates_updated_at BEFORE UPDATE ON public.forms_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_pictures_updated_at BEFORE UPDATE ON public.form_pictures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_form_choice_updated_at BEFORE UPDATE ON public.opportunity_form_choice
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_form_email_updated_at BEFORE UPDATE ON public.opportunity_form_email
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_templates_updated_at BEFORE UPDATE ON public.evaluation_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_results_updated_at BEFORE UPDATE ON public.evaluation_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_templates_updated_at BEFORE UPDATE ON public.process_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_instances_updated_at BEFORE UPDATE ON public.process_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_step_instances_updated_at BEFORE UPDATE ON public.process_step_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_processes_updated_at BEFORE UPDATE ON public.opportunity_processes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_process_steps_updated_at BEFORE UPDATE ON public.opportunity_process_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraped_opportunities_updated_at BEFORE UPDATE ON public.scraped_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraped_opportunity_details_updated_at BEFORE UPDATE ON public.scraped_opportunity_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrapped_opportunities_updated_at BEFORE UPDATE ON public.scrapped_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraped_jobs_updated_at BEFORE UPDATE ON public.scraped_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offres_templates_updated_at BEFORE UPDATE ON public.offres_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_morchid_conversations_updated_at BEFORE UPDATE ON public.morchid_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECTION 4: ADDITIONAL HELPER FUNCTIONS
-- ================================================================

-- Function to generate UUID if not provided
CREATE OR REPLACE FUNCTION generate_uuid_if_null()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL THEN
        NEW.id = gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to validate email format
CREATE OR REPLACE FUNCTION validate_email(email text)
RETURNS boolean AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ language 'plpgsql';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id
        AND user_type IN ('Admin', 'admin_ngo')
    );
END;
$$ language 'plpgsql';

-- Function to check if user is NGO
CREATE OR REPLACE FUNCTION is_ngo(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id
        AND user_type IN ('NGO', 'admin_ngo', 'assistant_ngo')
    );
END;
$$ language 'plpgsql';

-- Function to check if user is seeker
CREATE OR REPLACE FUNCTION is_seeker(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id
        AND user_type = 'Personne'
    );
END;
$$ language 'plpgsql';

-- ================================================================
-- SECTION 5: VIEWS FOR COMMON QUERIES
-- ================================================================

-- View for active opportunities with descriptions
CREATE OR REPLACE VIEW public.active_opportunities_view AS
SELECT 
    o.id,
    o.title,
    o.opportunity_type,
    o.created_at,
    o.updated_at,
    od.description,
    od.location,
    od.hours,
    od.status,
    od.criteria
FROM public.opportunities o
LEFT JOIN public.opportunity_description od ON o.id = od.opportunity_id
WHERE od.status = 'published';

-- View for user applications with opportunity details
CREATE OR REPLACE VIEW public.user_applications_view AS
SELECT 
    oa.id as application_id,
    oa.seeker_user_id,
    oa.status as application_status,
    oa.submitted_at,
    oa.selected_cv_name,
    o.id as opportunity_id,
    o.title as opportunity_title,
    o.opportunity_type,
    od.description,
    od.location
FROM public.opportunity_applications oa
JOIN public.opportunities o ON oa.opportunity_id = o.id
LEFT JOIN public.opportunity_description od ON o.id = od.opportunity_id;

-- View for NGO opportunities with application counts
CREATE OR REPLACE VIEW public.ngo_opportunities_view AS
SELECT 
    o.id,
    o.title,
    o.opportunity_type,
    o.created_at,
    od.status,
    od.location,
    COUNT(oa.id) as application_count
FROM public.opportunities o
LEFT JOIN public.opportunity_description od ON o.id = od.opportunity_id
LEFT JOIN public.opportunity_applications oa ON o.id = oa.opportunity_id
GROUP BY o.id, o.title, o.opportunity_type, o.created_at, od.status, od.location;

-- View for seeker profile with latest job title
CREATE OR REPLACE VIEW public.seeker_profile_complete AS
SELECT 
    sp.*,
    u.email,
    u.full_name,
    u.created_at as account_created_at
FROM public.seeker_profiles sp
JOIN public.users u ON sp.user_id = u.id;

-- ================================================================
-- SECTION 6: MATERIALIZED VIEWS (if needed for performance)
-- ================================================================

-- Materialized view for active scrapped opportunities
CREATE MATERIALIZED VIEW IF NOT EXISTS public.active_scrapped_opportunities_mat AS
SELECT 
    id,
    title,
    organization,
    type,
    description,
    requirements,
    location,
    deadline,
    salary_range,
    application_url,
    tags,
    source_url,
    created_at,
    updated_at,
    status
FROM public.scrapped_opportunities
WHERE status = 'active';

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_active_scrapped_opportunities_mat_created_at 
    ON public.active_scrapped_opportunities_mat(created_at DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_active_scrapped_opportunities()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.active_scrapped_opportunities_mat;
END;
$$ language 'plpgsql';

-- ================================================================
-- SECTION 7: NOTIFICATION TRIGGERS (if needed)
-- ================================================================

-- Function to notify on new application
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_application', json_build_object(
        'application_id', NEW.id,
        'opportunity_id', NEW.opportunity_id,
        'seeker_user_id', NEW.seeker_user_id,
        'submitted_at', NEW.submitted_at
    )::text);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for new application notifications
CREATE TRIGGER notify_on_new_application
    AFTER INSERT ON public.opportunity_applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_application();

-- ================================================================
-- END OF RLS POLICIES AND TRIGGERS
-- ================================================================

-- Summary:
-- - RLS enabled on: 10 tables
-- - Example RLS policies provided (commented out - uncomment and customize as needed)
-- - Updated_at triggers: 24 tables
-- - Helper functions: 5
-- - Views: 4
-- - Materialized views: 1
-- - Notification triggers: 1

