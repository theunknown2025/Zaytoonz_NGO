import { supabase } from './supabase';
import type { Opportunity } from './opportunities';
import { normalizeLocationToCountries } from './locationNormalize';

/** Same country list as the opportunity description form, so alert filters match stored criteria. */
export const OPPORTUNITY_COUNTRIES = [
  'Global',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Brazzaville)', 'Congo (Kinshasa)', 'Costa Rica', 'Cote d\'Ivoire',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
  'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

export type OpportunityAlertType = 'job' | 'funding' | 'training';

export type AlertFilterKey =
  | 'contractType'
  | 'level'
  | 'sector'
  | 'location'
  | 'country'
  | 'fundingType'
  | 'eligibility'
  | 'amountRange'
  | 'purpose'
  | 'format'
  | 'duration'
  | 'certification'
  | 'cost';

export type AlertFilters = Partial<Record<AlertFilterKey, string[]>>;

export interface AlertCriterion {
  key: AlertFilterKey;
  label: string;
  options: string[];
  searchable?: boolean;
}

/**
 * Criteria per opportunity type, matching the filters on the opportunity description form.
 * Country is included for every type because the description form collects it for all of them.
 */
export const ALERT_CRITERIA: Record<OpportunityAlertType, AlertCriterion[]> = {
  job: [
    {
      key: 'contractType',
      label: 'Contract Type',
      options: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Temporary'],
    },
    {
      key: 'level',
      label: 'Level',
      options: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
    },
    {
      key: 'sector',
      label: 'Sector/Industry',
      options: ['Tech', 'Education', 'Health', 'Arts', 'Environment', 'Social Services', 'Finance', 'Marketing', 'Other'],
    },
    {
      key: 'location',
      label: 'Location',
      options: ['Onsite', 'Remote', 'Hybrid'],
    },
    {
      key: 'country',
      label: 'Country',
      options: OPPORTUNITY_COUNTRIES,
      searchable: true,
    },
  ],
  funding: [
    {
      key: 'fundingType',
      label: 'Type',
      options: ['Grant', 'Prize', 'Scholarship', 'Seed funding', 'VC investment'],
    },
    {
      key: 'eligibility',
      label: 'Eligibility',
      options: ['Individuals', 'NGOs', 'Startups', 'Students', 'Researchers'],
    },
    {
      key: 'amountRange',
      label: 'Amount Range',
      options: ['Under €1,000', '€1,000 - €5,000', '€5,000 - €10,000', '€10,000 - €25,000', '€25,000 - €50,000', 'Over €50,000'],
    },
    {
      key: 'purpose',
      label: 'Purpose',
      options: ['Research', 'Entrepreneurship', 'Community development', 'Education', 'Innovation', 'Social impact'],
    },
    {
      key: 'country',
      label: 'Country',
      options: OPPORTUNITY_COUNTRIES,
      searchable: true,
    },
  ],
  training: [
    {
      key: 'format',
      label: 'Format',
      options: ['Online', 'Offline', 'Hybrid'],
    },
    {
      key: 'duration',
      label: 'Duration',
      options: ['Short course', 'Bootcamp', 'Multi-month program'],
    },
    {
      key: 'level',
      label: 'Level',
      options: ['Beginner', 'Intermediate', 'Advanced'],
    },
    {
      key: 'certification',
      label: 'Certification',
      options: ['Yes', 'No'],
    },
    {
      key: 'cost',
      label: 'Cost',
      options: ['Free', 'Partial funding', 'Paid'],
    },
    {
      key: 'country',
      label: 'Country',
      options: OPPORTUNITY_COUNTRIES,
      searchable: true,
    },
  ],
};

export const ALERT_TYPE_LABELS: Record<OpportunityAlertType, string> = {
  job: 'Job',
  funding: 'Funding',
  training: 'Training',
};

export interface SeekerOpportunityAlert {
  id: string;
  userId: string;
  name: string;
  opportunityType: OpportunityAlertType;
  filters: AlertFilters;
  createdAt: string;
  updatedAt: string;
}

export interface AlertDraft {
  name: string;
  opportunityType: OpportunityAlertType;
  filters: AlertFilters;
}

const LOCAL_KEY = 'seeker_opportunity_alerts_v1';
const TABLE = 'seeker_opportunity_alerts';

let preferLocalStorage = false;

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('could not find the table')
  );
}

function readLocal(userId: string): SeekerOpportunityAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') as Record<string, SeekerOpportunityAlert[]>;
    const rows = all[userId];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeLocal(userId: string, alerts: SeekerOpportunityAlert[]) {
  if (typeof window === 'undefined') return;
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') as Record<string, SeekerOpportunityAlert[]>;
  all[userId] = alerts;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

function mapRow(row: any): SeekerOpportunityAlert {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    opportunityType: row.opportunity_type,
    filters: sanitizeFilters(row.opportunity_type, row.filters || {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sanitizeFilters(type: OpportunityAlertType, filters: AlertFilters | null | undefined): AlertFilters {
  const allowed = new Set(ALERT_CRITERIA[type].map((criterion) => criterion.key));
  const next: AlertFilters = {};
  if (!filters || typeof filters !== 'object') return next;

  for (const [key, values] of Object.entries(filters)) {
    if (!allowed.has(key as AlertFilterKey) || !Array.isArray(values)) continue;
    const clean = Array.from(
      new Set(
        values
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter(Boolean)
      )
    );
    if (clean.length > 0) next[key as AlertFilterKey] = clean;
  }

  return next;
}

export function describeAlertFilters(filters: AlertFilters): string[] {
  return (Object.entries(filters) as [AlertFilterKey, string[] | undefined][])
    .filter((entry): entry is [AlertFilterKey, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
    .map(([key, values]) => {
      const label =
        ALERT_CRITERIA.job.find((item) => item.key === key)?.label ||
        ALERT_CRITERIA.funding.find((item) => item.key === key)?.label ||
        ALERT_CRITERIA.training.find((item) => item.key === key)?.label ||
        key;
      return `${label}: ${values.join(', ')}`;
    });
}

function endOfLocalDay(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
}

/** Last instant the opportunity is still eligible. Null when the deadline cannot be read. */
export function deadlineCutoff(raw: string): number | null {
  const value = raw.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return endOfLocalDay(Number(dateOnly[1]), Number(dateOnly[2]), Number(dateOnly[3]));
  }

  const midnight = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.000)?(?:Z|[+-]00:00)?$/.exec(value);
  if (midnight) {
    return endOfLocalDay(Number(midnight[1]), Number(midnight[2]), Number(midnight[3]));
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;

  if (!/\d{1,2}:\d{2}/.test(value)) {
    const date = new Date(parsed);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
  }

  return parsed;
}

/** An opportunity stays in alert results through the end of its deadline, then drops out. */
export function isOpportunityBeforeDeadline(deadline: string | null | undefined, now = Date.now()): boolean {
  if (!deadline || !deadline.trim()) return true;
  const cutoff = deadlineCutoff(deadline);
  if (cutoff === null) return true;
  return now <= cutoff;
}

export function formatAlertDeadline(deadline: string | null | undefined): string {
  if (!deadline || !deadline.trim()) return 'No deadline';
  const cutoff = deadlineCutoff(deadline);
  if (cutoff === null) return deadline;
  return new Date(cutoff).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function shortOpportunityDescription(description: string | null | undefined, maxLength = 180): string {
  const text = (description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text || text.toLowerCase() === 'no description available') return 'No description available';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function criteriaRecord(opp: Opportunity): Record<string, unknown> {
  return (opp.criteria || {}) as Record<string, unknown>;
}

function rawCountryValues(opp: Opportunity): string[] {
  const country = criteriaRecord(opp).country;
  if (Array.isArray(country)) {
    return country.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));
  }
  if (typeof country === 'string' && country.trim()) {
    return country.split(',').map((value) => value.trim()).filter(Boolean);
  }
  return [];
}

function canonicalCountries(values: string[]): string[] {
  const found = new Set<string>();
  for (const value of values) {
    const normalized = normalizeLocationToCountries(value);
    if (normalized.length > 0) normalized.forEach((country) => found.add(country));
    else if (value.trim()) found.add(value.trim());
  }
  return Array.from(found);
}

function matchesSelectedValue(actual: string | undefined, selected: string[]): boolean {
  if (!actual) return false;
  const needle = actual.trim().toLowerCase();
  return selected.some((value) => value.trim().toLowerCase() === needle);
}

function matchesCountry(opp: Opportunity, selected: string[]): boolean {
  if (selected.length === 0) return true;
  if (selected.some((value) => value.trim().toLowerCase() === 'global')) return true;

  const stored = rawCountryValues(opp);
  if (stored.some((value) => value.trim().toLowerCase() === 'global')) return true;

  const opportunityCountries = canonicalCountries([...stored, opp.location || '']);
  if (opportunityCountries.some((value) => value.toLowerCase() === 'global')) return true;
  if (stored.length === 0 && opportunityCountries.length === 0) return false;

  if (stored.some((value) => matchesSelectedValue(value, selected))) return true;
  const wanted = canonicalCountries(selected);
  return wanted.some((country) => opportunityCountries.includes(country));
}

function matchesCriterion(opp: Opportunity, key: AlertFilterKey, selected: string[]): boolean {
  if (selected.length === 0) return true;
  if (key === 'country') return matchesCountry(opp, selected);

  const raw = criteriaRecord(opp)[key];
  const actual = typeof raw === 'string' ? raw : undefined;
  if (matchesSelectedValue(actual, selected)) return true;

  if (key === 'location' && matchesSelectedValue(opp.location, selected)) return true;
  return false;
}

export function opportunityMatchesAlert(
  opportunity: Opportunity,
  alert: Pick<SeekerOpportunityAlert, 'opportunityType' | 'filters'>,
  now = Date.now()
): boolean {
  if (opportunity.category !== alert.opportunityType) return false;
  if (opportunity.isClosed) return false;
  if (!isOpportunityBeforeDeadline(opportunity.deadline, now)) return false;

  const filters = alert.filters || {};
  for (const criterion of ALERT_CRITERIA[alert.opportunityType]) {
    const selected = filters[criterion.key];
    if (!selected || selected.length === 0) continue;
    if (!matchesCriterion(opportunity, criterion.key, selected)) return false;
  }

  return true;
}

export function matchingOpportunities(
  alert: SeekerOpportunityAlert,
  opportunities: Opportunity[],
  now = Date.now()
): Opportunity[] {
  return opportunities
    .filter((opportunity) => opportunityMatchesAlert(opportunity, alert, now))
    .sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));
}

function alertToRow(userId: string, alert: SeekerOpportunityAlert) {
  return {
    id: alert.id,
    user_id: userId,
    name: alert.name,
    opportunity_type: alert.opportunityType,
    filters: alert.filters,
    created_at: alert.createdAt,
    updated_at: alert.updatedAt,
  };
}

function sortAlerts(alerts: SeekerOpportunityAlert[]): SeekerOpportunityAlert[] {
  return [...alerts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function loadSeekerAlerts(userId: string): Promise<{ alerts: SeekerOpportunityAlert[]; storedLocally: boolean }> {
  if (preferLocalStorage) {
    return { alerts: sortAlerts(readLocal(userId)), storedLocally: true };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    if (isMissingTable(error)) {
      preferLocalStorage = true;
      return { alerts: sortAlerts(readLocal(userId)), storedLocally: true };
    }
    throw new Error(error.message || 'Could not load alerts');
  }

  let alerts = (data || []).map(mapRow);
  const local = readLocal(userId);
  const remoteIds = new Set(alerts.map((alert) => alert.id));
  const pending = local.filter((alert) => !remoteIds.has(alert.id));

  if (pending.length > 0) {
    const { error: upsertError } = await supabase.from(TABLE).upsert(pending.map((alert) => alertToRow(userId, alert)));
    if (!upsertError) {
      writeLocal(userId, []);
      const refreshed = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (!refreshed.error && refreshed.data) alerts = refreshed.data.map(mapRow);
    }
  } else if (local.length > 0) {
    writeLocal(userId, []);
  }

  return { alerts, storedLocally: false };
}

export async function saveSeekerAlert(
  userId: string,
  draft: AlertDraft,
  alertId?: string
): Promise<SeekerOpportunityAlert> {
  const now = new Date().toISOString();
  const filters = sanitizeFilters(draft.opportunityType, draft.filters);
  const name = draft.name.trim();

  if (preferLocalStorage) {
    const current = readLocal(userId);
    const alert: SeekerOpportunityAlert = {
      id: alertId || crypto.randomUUID(),
      userId,
      name,
      opportunityType: draft.opportunityType,
      filters,
      createdAt: current.find((item) => item.id === alertId)?.createdAt || now,
      updatedAt: now,
    };
    const next = alertId
      ? current.map((item) => (item.id === alertId ? alert : item))
      : [alert, ...current];
    writeLocal(userId, sortAlerts(next));
    return alert;
  }

  if (alertId) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        name,
        opportunity_type: draft.opportunityType,
        filters,
        updated_at: now,
      })
      .eq('id', alertId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new Error(error.message || 'Could not update the alert');
    return mapRow(data);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      name,
      opportunity_type: draft.opportunityType,
      filters,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Could not save the alert');
  return mapRow(data);
}

export async function deleteSeekerAlert(userId: string, alertId: string): Promise<void> {
  if (preferLocalStorage) {
    writeLocal(userId, readLocal(userId).filter((alert) => alert.id !== alertId));
    return;
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', alertId).eq('user_id', userId);
  if (error) throw new Error(error.message || 'Could not delete the alert');
}
