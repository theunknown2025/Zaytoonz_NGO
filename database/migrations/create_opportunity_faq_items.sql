-- FAQ items for opportunities (question, icon, answer)

CREATE TABLE IF NOT EXISTS public.opportunity_faq_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL,
    faq_order integer NOT NULL DEFAULT 0,
    question text NOT NULL,
    answer text NOT NULL,
    icon text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_faq_items_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_faq_items_opportunity_id_fkey FOREIGN KEY (opportunity_id)
        REFERENCES public.opportunities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunity_faq_items_opportunity_id
    ON public.opportunity_faq_items(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_faq_items_order
    ON public.opportunity_faq_items(opportunity_id, faq_order);

ALTER TABLE public.opportunity_faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read opportunity_faq_items" ON public.opportunity_faq_items;
CREATE POLICY "Public read opportunity_faq_items" ON public.opportunity_faq_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage opportunity_faq_items" ON public.opportunity_faq_items;
CREATE POLICY "Public manage opportunity_faq_items" ON public.opportunity_faq_items FOR ALL USING (true);
