/**
 * Normalizes messy opportunity location strings to a single canonical country name.
 * Used for display and filter dropdowns so "England", "UK", and "United Kingdom" dedupe.
 */

const COUNTRY_ALIASES: Record<string, string> = {
  // United Kingdom & constituents
  uk: 'United Kingdom',
  'u.k.': 'United Kingdom',
  'u.k': 'United Kingdom',
  'great britain': 'United Kingdom',
  gb: 'United Kingdom',
  england: 'United Kingdom',
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  'northern ireland': 'United Kingdom',
  'united kingdom': 'United Kingdom',

  // United States
  us: 'United States',
  usa: 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'united states of america': 'United States',
  'united states': 'United States',

  // Middle East & Africa
  jordan: 'Jordan',
  morocco: 'Morocco',
  tunisia: 'Tunisia',
  algeria: 'Algeria',
  egypt: 'Egypt',
  kenya: 'Kenya',
  nigeria: 'Nigeria',
  ghana: 'Ghana',
  senegal: 'Senegal',
  ethiopia: 'Ethiopia',
  uganda: 'Uganda',
  tanzania: 'Tanzania',
  zambia: 'Zambia',
  zimbabwe: 'Zimbabwe',
  mozambique: 'Mozambique',
  malawi: 'Malawi',
  rwanda: 'Rwanda',
  sudan: 'Sudan',
  'south sudan': 'South Sudan',
  somalia: 'Somalia',
  libya: 'Libya',
  lebanon: 'Lebanon',
  syria: 'Syria',
  iraq: 'Iraq',
  yemen: 'Yemen',
  palestine: 'Palestine',
  'west bank': 'Palestine',
  gaza: 'Palestine',

  drc: 'Democratic Republic of the Congo',
  'democratic republic of congo': 'Democratic Republic of the Congo',
  'democratic republic of the congo': 'Democratic Republic of the Congo',
  'dr congo': 'Democratic Republic of the Congo',
  congo: 'Republic of the Congo',
  'republic of the congo': 'Republic of the Congo',
  'south africa': 'South Africa',

  // Europe
  denmark: 'Denmark',
  sweden: 'Sweden',
  norway: 'Norway',
  finland: 'Finland',
  iceland: 'Iceland',
  ireland: 'Ireland',
  france: 'France',
  germany: 'Germany',
  spain: 'Spain',
  portugal: 'Portugal',
  italy: 'Italy',
  netherlands: 'Netherlands',
  holland: 'Netherlands',
  belgium: 'Belgium',
  switzerland: 'Switzerland',
  austria: 'Austria',
  poland: 'Poland',
  'czech republic': 'Czech Republic',
  czechia: 'Czech Republic',
  slovakia: 'Slovakia',
  hungary: 'Hungary',
  romania: 'Romania',
  bulgaria: 'Bulgaria',
  greece: 'Greece',
  turkey: 'Turkey',
  ukraine: 'Ukraine',
  belarus: 'Belarus',
  serbia: 'Serbia',
  croatia: 'Croatia',
  slovenia: 'Slovenia',
  'bosnia and herzegovina': 'Bosnia and Herzegovina',
  albania: 'Albania',
  'north macedonia': 'North Macedonia',
  macedonia: 'North Macedonia',
  montenegro: 'Montenegro',
  kosovo: 'Kosovo',
  luxembourg: 'Luxembourg',
  malta: 'Malta',
  cyprus: 'Cyprus',
  estonia: 'Estonia',
  latvia: 'Latvia',
  lithuania: 'Lithuania',

  // Americas
  canada: 'Canada',
  mexico: 'Mexico',
  guatemala: 'Guatemala',
  honduras: 'Honduras',
  'el salvador': 'El Salvador',
  nicaragua: 'Nicaragua',
  'costa rica': 'Costa Rica',
  panama: 'Panama',
  colombia: 'Colombia',
  venezuela: 'Venezuela',
  ecuador: 'Ecuador',
  peru: 'Peru',
  bolivia: 'Bolivia',
  brazil: 'Brazil',
  chile: 'Chile',
  argentina: 'Argentina',
  uruguay: 'Uruguay',
  paraguay: 'Paraguay',
  haiti: 'Haiti',
  'dominican republic': 'Dominican Republic',
  jamaica: 'Jamaica',
  cuba: 'Cuba',

  // Asia & Pacific
  india: 'India',
  pakistan: 'Pakistan',
  bangladesh: 'Bangladesh',
  nepal: 'Nepal',
  'sri lanka': 'Sri Lanka',
  afghanistan: 'Afghanistan',
  china: 'China',
  japan: 'Japan',
  'south korea': 'South Korea',
  korea: 'South Korea',
  'north korea': 'North Korea',
  indonesia: 'Indonesia',
  malaysia: 'Malaysia',
  singapore: 'Singapore',
  thailand: 'Thailand',
  vietnam: 'Vietnam',
  philippines: 'Philippines',
  cambodia: 'Cambodia',
  laos: 'Laos',
  myanmar: 'Myanmar',
  burma: 'Myanmar',
  mongolia: 'Mongolia',
  taiwan: 'Taiwan',
  'hong kong': 'Hong Kong',
  'new zealand': 'New Zealand',
  australia: 'Australia',
  fiji: 'Fiji',
  'papua new guinea': 'Papua New Guinea',

  // Remote / virtual (optional bucket — excluded from country filters by default)
  remote: 'Remote',
  worldwide: 'Remote',
  global: 'Remote',
  international: 'Remote',
};

/** Longest aliases first so "democratic republic of the congo" wins over "congo". */
const SORTED_ALIAS_KEYS = Object.keys(COUNTRY_ALIASES).sort((a, b) => b.length - a.length);

const UNSPECIFIED = /^(not\s+specified|unspecified|n\/a|na|unknown|tbd|—|-)$/i;

function cleanSegment(segment: string): string {
  return segment
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchCountryToken(token: string): string | null {
  const cleaned = cleanSegment(token);
  if (!cleaned || UNSPECIFIED.test(cleaned)) return null;

  const lower = cleaned.toLowerCase();

  if (COUNTRY_ALIASES[lower]) {
    return COUNTRY_ALIASES[lower];
  }

  for (const alias of SORTED_ALIAS_KEYS) {
    if (lower === alias) {
      return COUNTRY_ALIASES[alias];
    }
    // Whole-token or trailing match: "Panama City" won't match Panama unless exact
    const re = new RegExp(`(?:^|[\\s,/(\\-–—])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[\\s,/)\\-–—])`, 'i');
    if (re.test(` ${lower} `)) {
      return COUNTRY_ALIASES[alias];
    }
  }

  return null;
}

function splitLocationParts(raw: string): string[] {
  return raw
    .split(/\s*[,/|]\s*|\s+[-–—]\s+/)
    .map(cleanSegment)
    .filter((part) => part && !UNSPECIFIED.test(part));
}

/**
 * Extract a canonical country from a free-text location string.
 * Returns null when no country can be determined.
 */
export function normalizeLocationToCountry(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const text = raw.trim();
  if (!text || UNSPECIFIED.test(text)) return null;

  const withoutParens = text.replace(/\([^)]*\)/g, '').trim();
  const parts = splitLocationParts(withoutParens);
  if (parts.length === 0) return null;

  // "City, Country" — country is usually last
  for (let i = parts.length - 1; i >= 0; i--) {
    const match = matchCountryToken(parts[i]);
    if (match) return match;
  }

  // "Country - City" — country is usually first
  for (let i = 0; i < parts.length; i++) {
    const match = matchCountryToken(parts[i]);
    if (match) return match;
  }

  return matchCountryToken(withoutParens);
}

/** Country string safe for UI, or null to hide the row. */
export function displayOpportunityCountry(raw: string | null | undefined): string | null {
  return normalizeLocationToCountry(raw);
}

/** Unique sorted country list for filter dropdowns. */
export function uniqueCountriesFromLocations(locations: Array<string | null | undefined>): string[] {
  const countries = new Set<string>();
  for (const loc of locations) {
    const country = normalizeLocationToCountry(loc);
    if (country) countries.add(country);
  }
  return Array.from(countries).sort((a, b) => a.localeCompare(b));
}

/** Compare opportunity location against a selected country filter value. */
export function locationMatchesCountryFilter(
  rawLocation: string | null | undefined,
  selectedCountry: string
): boolean {
  if (!selectedCountry || selectedCountry === 'all') return true;
  return normalizeLocationToCountry(rawLocation) === selectedCountry;
}
