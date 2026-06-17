-- Training program schedule for training-type opportunities (days + activities)

CREATE TABLE IF NOT EXISTS public.opportunity_training_days (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL,
    day_order integer NOT NULL DEFAULT 0,
    title text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_training_days_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_training_days_opportunity_id_fkey FOREIGN KEY (opportunity_id)
        REFERENCES public.opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.opportunity_training_activities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    training_day_id uuid NOT NULL,
    activity_order integer NOT NULL DEFAULT 0,
    name text NOT NULL,
    duration text,
    format text,
    icon text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_training_activities_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_training_activities_training_day_id_fkey FOREIGN KEY (training_day_id)
        REFERENCES public.opportunity_training_days(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunity_training_days_opportunity_id
    ON public.opportunity_training_days(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_training_days_order
    ON public.opportunity_training_days(opportunity_id, day_order);

CREATE INDEX IF NOT EXISTS idx_opportunity_training_activities_day_id
    ON public.opportunity_training_activities(training_day_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_training_activities_order
    ON public.opportunity_training_activities(training_day_id, activity_order);

ALTER TABLE public.opportunity_training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_training_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read opportunity_training_days" ON public.opportunity_training_days;
CREATE POLICY "Public read opportunity_training_days" ON public.opportunity_training_days FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage opportunity_training_days" ON public.opportunity_training_days;
CREATE POLICY "Public manage opportunity_training_days" ON public.opportunity_training_days FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read opportunity_training_activities" ON public.opportunity_training_activities;
CREATE POLICY "Public read opportunity_training_activities" ON public.opportunity_training_activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage opportunity_training_activities" ON public.opportunity_training_activities;
CREATE POLICY "Public manage opportunity_training_activities" ON public.opportunity_training_activities FOR ALL USING (true);
