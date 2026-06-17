/**
 * Normalizes messy opportunity organization strings to a single canonical name.
 * Used for display and filter dropdowns so "UNICEF", "Unicef", and linked profile names dedupe.
 */

const GENERIC_ORG = /^(external organization|organization|unknown organization|not\s+specified|unspecified|n\/a|na|unknown|tbd|—|-)$/i;

export type OrganizationSource = {
  organization?: string;
  organizationProfile?: { id?: string; name: string };
  ngoProfileId?: string | null;
};

function normalizeOrganizationKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[.,''"®™]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGenericOrganization(name: string | null | undefined): boolean {
  if (!name?.trim()) return true;
  return GENERIC_ORG.test(name.trim());
}

function pickDisplayLabel(candidates: string[]): string | null {
  const valid = candidates.filter((name) => name?.trim() && !isGenericOrganization(name));
  if (valid.length === 0) return null;

  const score = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 4) return 0;
    if (/^[A-Z]/.test(trimmed)) return 2;
    return 1;
  };

  return [...valid].sort((a, b) => score(b) - score(a) || b.length - a.length)[0].trim();
}

function collectOrganizationCandidates(opp: OrganizationSource): string[] {
  const candidates: string[] = [];
  const display = displayOpportunityOrganization(opp);
  if (display) candidates.push(display);
  if (opp.organizationProfile?.name?.trim()) candidates.push(opp.organizationProfile.name.trim());
  if (opp.organization?.trim()) candidates.push(opp.organization.trim());
  return candidates;
}

/** Stable key for grouping duplicate organization labels. */
export function organizationGroupKey(opp: OrganizationSource): string | null {
  const profileId = opp.organizationProfile?.id ?? opp.ngoProfileId;
  if (profileId) return `profile:${profileId}`;

  const display = displayOpportunityOrganization(opp);
  if (!display) return null;
  return normalizeOrganizationKey(display);
}

/** Canonical organization name for UI, or null to hide generic/unknown values. */
export function displayOpportunityOrganization(opp: OrganizationSource): string | null {
  const profileId = opp.organizationProfile?.id ?? opp.ngoProfileId;
  const profileName = opp.organizationProfile?.name?.trim();

  if (profileId && profileName && !isGenericOrganization(profileName)) {
    return profileName;
  }

  const orgName = opp.organization?.trim();
  if (orgName && !isGenericOrganization(orgName)) {
    return orgName;
  }

  if (profileName && !isGenericOrganization(profileName)) {
    return profileName;
  }

  return null;
}

/** Map group keys to one canonical label for filters and display. */
export function buildOrganizationCanonicalMap(
  opportunities: OrganizationSource[]
): Map<string, string> {
  const groups = new Map<string, string[]>();

  for (const opp of opportunities) {
    const key = organizationGroupKey(opp);
    if (!key) continue;

    const candidates = groups.get(key) ?? [];
    candidates.push(...collectOrganizationCandidates(opp));
    groups.set(key, candidates);
  }

  const map = new Map<string, string>();
  for (const [key, candidates] of Array.from(groups.entries())) {
    const label = pickDisplayLabel(candidates);
    if (label) map.set(key, label);
  }
  return map;
}

/** Canonical organization name for one opportunity (deduped across the listing). */
export function canonicalOrganizationName(
  opp: OrganizationSource,
  canonicalMap: Map<string, string>
): string | null {
  const key = organizationGroupKey(opp);
  if (!key) return displayOpportunityOrganization(opp);
  return canonicalMap.get(key) ?? displayOpportunityOrganization(opp);
}

/** Unique sorted organization list for filter dropdowns. */
export function uniqueOrganizationsFromOpportunities(opportunities: OrganizationSource[]): string[] {
  const map = buildOrganizationCanonicalMap(opportunities);
  return Array.from(new Set(map.values())).sort((a, b) => a.localeCompare(b));
}

/** Compare opportunity organization against selected filter values. */
export function organizationMatchesFilter(
  opp: OrganizationSource,
  selectedOrganizations: string[],
  canonicalMap: Map<string, string>
): boolean {
  if (selectedOrganizations.length === 0) return true;
  const name = canonicalOrganizationName(opp, canonicalMap);
  if (!name) return false;
  return selectedOrganizations.includes(name);
}

/** Resolved organization string for opportunity records (with generic fallback). */
export function resolveOpportunityOrganization(
  raw: string | null | undefined,
  profile?: { id?: string; name: string } | null,
  ngoProfileId?: string | null
): string {
  const display = displayOpportunityOrganization({
    organization: raw ?? undefined,
    organizationProfile: profile ?? undefined,
    ngoProfileId,
  });
  if (display) return display;

  const fallback = profile?.name?.trim() || raw?.trim();
  return fallback && !isGenericOrganization(fallback) ? fallback : 'Organization';
}
