export const FAVORITE_OPPORTUNITIES_KEY = 'favorite_opportunities';
export const FAVORITES_CHANGED_EVENT = 'zaytoonz-favorites-changed';

export function readFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITE_OPPORTUNITIES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeFavoriteIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITE_OPPORTUNITIES_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}

export function toggleFavoriteId(opportunityId: string): { ids: string[]; saved: boolean } {
  const current = readFavoriteIds();
  const saved = !current.includes(opportunityId);
  const ids = saved
    ? Array.from(new Set([...current, opportunityId]))
    : current.filter((id) => id !== opportunityId);
  writeFavoriteIds(ids);
  return { ids, saved };
}
