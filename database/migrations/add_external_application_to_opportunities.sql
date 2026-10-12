-- External opportunities: applicants are sent to an NGO-provided URL instead of
-- the Zaytoonz application form / email flow.

ALTER TABLE public.opportunities
    ADD COLUMN IF NOT EXISTS is_external boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS external_application_url text;
