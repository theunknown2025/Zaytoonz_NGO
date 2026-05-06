-- Link extracted scraper rows to an NGO for public listing and NGO profile pages
ALTER TABLE public.extracted_opportunity_content
  ADD COLUMN IF NOT EXISTS ngo_profile_id UUID REFERENCES public.ngo_profile(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_extracted_content_ngo_profile_id
  ON public.extracted_opportunity_content(ngo_profile_id);

COMMENT ON COLUMN public.extracted_opportunity_content.ngo_profile_id IS
  'NGO this extracted listing is attributed to (seeker list + public NGO profile)';
