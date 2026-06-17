-- Manual opportunity process steps (inline per opportunity, not template-based)

CREATE TABLE IF NOT EXISTS public.opportunity_flow_steps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    deadline date,
    step_order integer NOT NULL DEFAULT 0,
    icon text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_flow_steps_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_flow_steps_opportunity_id_fkey FOREIGN KEY (opportunity_id)
        REFERENCES public.opportunities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunity_flow_steps_opportunity_id
    ON public.opportunity_flow_steps(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_flow_steps_order
    ON public.opportunity_flow_steps(opportunity_id, step_order);

ALTER TABLE public.opportunity_flow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read opportunity_flow_steps" ON public.opportunity_flow_steps;
CREATE POLICY "Public read opportunity_flow_steps" ON public.opportunity_flow_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage opportunity_flow_steps" ON public.opportunity_flow_steps;
CREATE POLICY "Public manage opportunity_flow_steps" ON public.opportunity_flow_steps FOR ALL USING (true);
