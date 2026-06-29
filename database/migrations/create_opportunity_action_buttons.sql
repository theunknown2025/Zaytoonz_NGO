-- Action buttons for opportunities (title, icon, link)

CREATE TABLE IF NOT EXISTS public.opportunity_action_buttons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL,
    button_order integer NOT NULL DEFAULT 0,
    title text NOT NULL,
    icon text,
    icon_url text,
    link_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_action_buttons_pkey PRIMARY KEY (id),
    CONSTRAINT opportunity_action_buttons_opportunity_id_fkey FOREIGN KEY (opportunity_id)
        REFERENCES public.opportunities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunity_action_buttons_opportunity_id
    ON public.opportunity_action_buttons(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_action_buttons_order
    ON public.opportunity_action_buttons(opportunity_id, button_order);

ALTER TABLE public.opportunity_action_buttons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read opportunity_action_buttons" ON public.opportunity_action_buttons;
CREATE POLICY "Public read opportunity_action_buttons" ON public.opportunity_action_buttons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage opportunity_action_buttons" ON public.opportunity_action_buttons;
CREATE POLICY "Public manage opportunity_action_buttons" ON public.opportunity_action_buttons FOR ALL USING (true);

-- Storage bucket for custom action button icons
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'opportunity-action-button-icons',
    'opportunity-action-button-icons',
    true,
    2097152,
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read opportunity action button icons" ON storage.objects;
CREATE POLICY "Public read opportunity action button icons"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'opportunity-action-button-icons');

DROP POLICY IF EXISTS "Public upload opportunity action button icons" ON storage.objects;
CREATE POLICY "Public upload opportunity action button icons"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'opportunity-action-button-icons');

DROP POLICY IF EXISTS "Public update opportunity action button icons" ON storage.objects;
CREATE POLICY "Public update opportunity action button icons"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'opportunity-action-button-icons');

DROP POLICY IF EXISTS "Public delete opportunity action button icons" ON storage.objects;
CREATE POLICY "Public delete opportunity action button icons"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'opportunity-action-button-icons');
