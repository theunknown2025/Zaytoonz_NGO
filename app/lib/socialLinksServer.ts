import { createClient } from '@supabase/supabase-js';
import { SOCIAL_LINKS, mergeSocialLinks, type SocialLink, type SocialLinkOverride } from './socialLinks';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key || url.includes('placeholder') || key.includes('your_')) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  return createClient(url, key);
}

/** Server-side fetch of social links with static fallbacks. */
export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const supabase = getSupabase();
  if (!supabase) return SOCIAL_LINKS;

  try {
    const { data, error } = await supabase
      .from('social_media_links')
      .select('key, href, qr_url, sort_order')
      .order('sort_order', { ascending: true });

    if (error || !data?.length) return SOCIAL_LINKS;
    return mergeSocialLinks(data as SocialLinkOverride[]);
  } catch {
    return SOCIAL_LINKS;
  }
}
