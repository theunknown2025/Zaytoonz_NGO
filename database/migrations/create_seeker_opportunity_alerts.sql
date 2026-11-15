-- Saved seeker opportunity alerts (criteria filters per job / funding / training)

CREATE TABLE IF NOT EXISTS public.seeker_opportunity_alerts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    opportunity_type text NOT NULL CHECK (opportunity_type IN ('job', 'funding', 'training')),
    filters jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT seeker_opportunity_alerts_pkey PRIMARY KEY (id),
    CONSTRAINT seeker_opportunity_alerts_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seeker_opportunity_alerts_user_id
    ON public.seeker_opportunity_alerts(user_id);

ALTER TABLE public.seeker_opportunity_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read seeker_opportunity_alerts" ON public.seeker_opportunity_alerts;
CREATE POLICY "Public read seeker_opportunity_alerts" ON public.seeker_opportunity_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public manage seeker_opportunity_alerts" ON public.seeker_opportunity_alerts;
CREATE POLICY "Public manage seeker_opportunity_alerts" ON public.seeker_opportunity_alerts FOR ALL USING (true);

COMMENT ON TABLE public.seeker_opportunity_alerts IS 'Seeker-defined opportunity alerts. filters stores the desired criteria values for the chosen opportunity type.';
COMMENT ON COLUMN public.seeker_opportunity_alerts.filters IS 'Selected criteria values (contractType, level, sector, country, fundingType, and the other Opportunity Description filters). Empty arrays are omitted; an empty object matches every open opportunity of that type.';
