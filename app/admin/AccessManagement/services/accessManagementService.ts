import { supabase } from '@/app/lib/supabase';
import { SOCIAL_LINKS, mergeSocialLinks, type SocialLink } from '@/app/lib/socialLinks';

const QR_BUCKET = 'social-media-qr-codes';
const ACCESS_GATE_KEY = 'access_gate_enabled';

export type EditableSocialLink = SocialLink;

export async function getSocialMediaLinks(): Promise<EditableSocialLink[]> {
  const { data, error } = await supabase
    .from('social_media_links')
    .select('key, href, qr_url, sort_order')
    .order('sort_order', { ascending: true });

  if (error || !data?.length) {
    if (error) console.error('Error loading social_media_links:', error);
    return SOCIAL_LINKS;
  }

  return mergeSocialLinks(data);
}

export async function updateSocialMediaLink(
  key: string,
  updates: { href: string; qr_url: string }
): Promise<{ error: string | null }> {
  const sortOrder = Math.max(
    0,
    SOCIAL_LINKS.findIndex((link) => link.key === key)
  );
  const { error } = await supabase
    .from('social_media_links')
    .upsert(
      {
        key,
        href: updates.href.trim(),
        qr_url: updates.qr_url.trim(),
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

  if (error) {
    console.error('Error updating social_media_links:', error);
    return { error: error.message };
  }
  return { error: null };
}

export async function uploadSocialQrCode(
  key: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${key}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

  const { error } = await supabase.storage.from(QR_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Error uploading QR code:', error);
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage.from(QR_BUCKET).getPublicUrl(filePath);
  return { url: urlData?.publicUrl || null, error: null };
}

export async function getAccessGateEnabled(): Promise<boolean> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', ACCESS_GATE_KEY)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error loading access gate setting:', error);
    return process.env.NEXT_PUBLIC_ACCESS_GATE_ENABLED !== 'false';
  }

  if (data?.value === undefined || data?.value === null) return true;
  const raw = data.value;
  return typeof raw === 'boolean' ? raw : String(raw) === 'true';
}

export async function setAccessGateEnabled(
  enabled: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('platform_settings').upsert(
    {
      key: ACCESS_GATE_KEY,
      value: enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );

  if (error) {
    console.error('Error updating access gate setting:', error);
    return { error: error.message };
  }

  return { error: null };
}
