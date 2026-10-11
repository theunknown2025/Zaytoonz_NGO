-- Qualification groups an organization defines per opportunity (e.g. Shortlisted, Waiting list, Pending).
-- Applications are sorted into these groups from Application Management.

CREATE TABLE IF NOT EXISTS public.opportunity_qualification_groups (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL,
    label text NOT NULL,
    color text,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_qualification_groups_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_qualification_groups_opportunity_id_fkey FOREIGN KEY (opportunity_id)
        REFERENCES public.opportunities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunity_qualification_groups_opportunity_id
    ON public.opportunity_qualification_groups(opportunity_id, sort_order);

ALTER TABLE public.opportunity_qualification_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read opportunity_qualification_groups" ON public.opportunity_qualification_groups;
CREATE POLICY "Public read opportunity_qualification_groups" ON public.opportunity_qualification_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage opportunity_qualification_groups" ON public.opportunity_qualification_groups;
CREATE POLICY "Public manage opportunity_qualification_groups" ON public.opportunity_qualification_groups FOR ALL USING (true);

ALTER TABLE public.opportunity_applications
    ADD COLUMN IF NOT EXISTS qualification_group_id uuid
    REFERENCES public.opportunity_qualification_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_qualification_group_id
    ON public.opportunity_applications(qualification_group_id);
