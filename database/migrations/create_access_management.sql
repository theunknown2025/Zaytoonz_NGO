-- Access Management: social media links (href + QR) and landing-page access lock.

CREATE TABLE IF NOT EXISTS public.social_media_links (
    key text NOT NULL,
    href text NOT NULL,
    qr_url text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT social_media_links_pkey PRIMARY KEY (key)
);

CREATE INDEX IF NOT EXISTS idx_social_media_links_sort_order
    ON public.social_media_links(sort_order);

ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read social_media_links" ON public.social_media_links;
CREATE POLICY "Public read social_media_links" ON public.social_media_links FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage social_media_links" ON public.social_media_links;
CREATE POLICY "Public manage social_media_links" ON public.social_media_links FOR ALL USING (true);

INSERT INTO public.social_media_links (key, href, qr_url, sort_order) VALUES
    ('whatsapp', 'https://chat.whatsapp.com/GlJyFL0Cxvm3AYUQRP4b9G', '/sm/zz-whatsapp.png', 0),
    ('telegram', 'https://t.me/zaytoonz', '/sm/zz-telegram.png', 1),
    ('facebook', 'https://www.facebook.com/zaytoonz/', '/sm/zz-facebook.png', 2),
    ('linkedin', 'https://www.linkedin.com/company/zaytoonz/', '/sm/zz-linkedin.png', 3),
    ('facebook-group', 'https://www.facebook.com/groups/654692163266122', '/sm/zz-facebookgroupe.png', 4),
    ('linkedin-group', 'https://www.linkedin.com/groups/12864122/', '/sm/zz-linkedin.png', 5)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.platform_settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT platform_settings_pkey PRIMARY KEY (key)
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read platform_settings" ON public.platform_settings;
CREATE POLICY "Public read platform_settings" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage platform_settings" ON public.platform_settings;
CREATE POLICY "Public manage platform_settings" ON public.platform_settings FOR ALL USING (true);

INSERT INTO public.platform_settings (key, value)
VALUES ('access_gate_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Storage bucket for social media QR codes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'social-media-qr-codes',
    'social-media-qr-codes',
    true,
    2097152,
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read social media qr codes" ON storage.objects;
CREATE POLICY "Public read social media qr codes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'social-media-qr-codes');

DROP POLICY IF EXISTS "Public upload social media qr codes" ON storage.objects;
CREATE POLICY "Public upload social media qr codes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'social-media-qr-codes');

DROP POLICY IF EXISTS "Public update social media qr codes" ON storage.objects;
CREATE POLICY "Public update social media qr codes"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'social-media-qr-codes');

DROP POLICY IF EXISTS "Public delete social media qr codes" ON storage.objects;
CREATE POLICY "Public delete social media qr codes"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'social-media-qr-codes');
