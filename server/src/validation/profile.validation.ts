import { HttpError } from '../errors/http-error.js';
import type { FieldErrors, Profile } from '../types/profile.js';

type Field = { key: string; label: string; max?: number; required?: boolean; kind?: 'email' | 'url' | 'date' | 'list' };

const basicsScalarFields: Field[] = [
  { key: 'name', label: 'Name', max: 120, required: true },
  { key: 'label', label: 'Professional title', max: 120 },
  { key: 'image', label: 'Profile image', kind: 'url' },
  { key: 'email', label: 'Email', max: 254, kind: 'email' },
  { key: 'phone', label: 'Phone', max: 50 },
  { key: 'url', label: 'Website', kind: 'url' },
  { key: 'summary', label: 'Summary', max: 5000 },
];

const locationFields: Field[] = [
  { key: 'address', label: 'Address', max: 500 },
  { key: 'postalCode', label: 'Postal code', max: 50 },
  { key: 'city', label: 'City' },
  { key: 'countryCode', label: 'Country code', max: 10 },
  { key: 'region', label: 'Region' },
];

const socialProfileFields: Field[] = [
  { key: 'network', label: 'Network', required: true },
  { key: 'username', label: 'Username' },
  { key: 'url', label: 'Profile URL', kind: 'url' },
];

const dateFields: Field[] = [
  { key: 'startDate', label: 'Start date', kind: 'date' },
  { key: 'endDate', label: 'End date', kind: 'date' },
];
const urlField: Field = { key: 'url', label: 'Website', kind: 'url' };

const sections = {
  work: [
    { key: 'name', label: 'Company', required: true },
    { key: 'position', label: 'Position', required: true }, urlField, ...dateFields,
    { key: 'summary', label: 'Summary', max: 5000 },
    { key: 'highlights', label: 'Highlights', kind: 'list' },
  ],
  volunteer: [
    { key: 'organization', label: 'Organization', required: true },
    { key: 'position', label: 'Position' }, urlField, ...dateFields,
    { key: 'summary', label: 'Summary', max: 5000 },
    { key: 'highlights', label: 'Highlights', kind: 'list' },
  ],
  education: [
    { key: 'institution', label: 'Institution', required: true }, urlField,
    { key: 'area', label: 'Area of study' }, { key: 'studyType', label: 'Degree' }, ...dateFields,
    { key: 'score', label: 'Score', max: 50 }, { key: 'courses', label: 'Courses', kind: 'list' },
  ],
  awards: [
    { key: 'title', label: 'Award title', required: true },
    { key: 'date', label: 'Date', kind: 'date' },
    { key: 'awarder', label: 'Awarder' },
    { key: 'summary', label: 'Summary', max: 5000 },
  ],
  certificates: [
    { key: 'name', label: 'Certificate name', required: true },
    { key: 'date', label: 'Date', kind: 'date' }, { key: 'issuer', label: 'Issuer' }, urlField,
  ],
  publications: [
    { key: 'name', label: 'Publication name', required: true },
    { key: 'publisher', label: 'Publisher' },
    { key: 'releaseDate', label: 'Release date', kind: 'date' },
    urlField,
    { key: 'summary', label: 'Summary', max: 5000 },
  ],
  skills: [
    { key: 'name', label: 'Skill group', required: true }, { key: 'level', label: 'Level' },
    { key: 'keywords', label: 'Keywords', kind: 'list' },
  ],
  languages: [
    { key: 'language', label: 'Language', required: true },
    { key: 'fluency', label: 'Fluency' },
  ],
  interests: [
    { key: 'name', label: 'Interest', required: true },
    { key: 'keywords', label: 'Keywords', kind: 'list' },
  ],
  references: [
    { key: 'name', label: 'Name', required: true },
    { key: 'reference', label: 'Reference', max: 5000 },
  ],
  projects: [
    { key: 'name', label: 'Project name', required: true },
    { key: 'description', label: 'Description', max: 5000 }, urlField, ...dateFields,
    { key: 'highlights', label: 'Highlights', kind: 'list' },
    { key: 'roles', label: 'Roles', kind: 'list' },
    { key: 'type', label: 'Type' },
  ],
} satisfies Record<string, Field[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// JSON Resume allows a year, a year/month, or a full calendar date.
function validDate(value: string): boolean {
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || (month !== undefined && (month < 1 || month > 12))) return false;
  if (day === undefined) return true;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1];
}

function validateEntry(input: Record<string, unknown>, fields: Field[], prefix: string, errors: FieldErrors) {
  const result: Record<string, string | string[]> = {};
  if (Object.keys(input).some((key) => !fields.some((field) => field.key === key))) {
    errors[prefix ? prefix.slice(0, -1) : 'basics'] = 'This entry contains an unsupported field.';
  }

  for (const field of fields) {
    const path = `${prefix}${field.key}`;
    const raw = input[field.key];
    if (field.kind === 'list') {
      result[field.key] = [];
      if (raw === undefined) continue;
      if (!Array.isArray(raw) || raw.some((item) => typeof item !== 'string')) {
        errors[path] = `${field.label} must be a list of text values.`;
      } else if (raw.length > 50 || raw.some((item) => item.trim().length > 500)) {
        errors[path] = `${field.label} allows up to 50 items, each at most 500 characters.`;
      } else {
        result[field.key] = raw.map((item: string) => item.trim()).filter(Boolean);
      }
      continue;
    }

    const text = typeof raw === 'string' ? raw.trim() : '';
    result[field.key] = text;
    if (raw !== undefined && typeof raw !== 'string') {
      errors[path] = `${field.label} must be text.`;
      continue;
    }
    const max = field.max ?? (field.kind === 'url' ? 2048 : field.kind === 'date' ? 10 : 120);
    if (text.length > max) {
      errors[path] = `${field.label} must be ${max} characters or fewer.`;
    } else if (field.required && !text) {
      errors[path] = `${field.label} is required.`;
    } else if (text && field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      errors[path] = 'Enter a valid email address.';
    } else if (text && field.kind === 'date' && !validDate(text)) {
      errors[path] = 'Enter a real date as YYYY, YYYY-MM, or YYYY-MM-DD.';
    } else if (text && field.kind === 'url') {
      try {
        const url = new URL(text);
        if (!/^https?:\/\//i.test(text) || !['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
      } catch {
        errors[path] = 'Enter a full website URL starting with http:// or https://.';
      }
    }
  }

  const start = result.startDate;
  const end = result.endDate;
  // Compare ranges of partial dates; overlapping months/years remain valid.
  if (typeof start === 'string' && typeof end === 'string' && start && end &&
      !errors[`${prefix}startDate`] && !errors[`${prefix}endDate`]) {
    const earliestStart = start.length === 4 ? `${start}-01-01` : start.length === 7 ? `${start}-01` : start;
    const latestEnd = end.length === 4 ? `${end}-12-31` : end.length === 7 ? `${end}-31` : end;
    if (latestEnd < earliestStart) errors[`${prefix}endDate`] = 'End date must be on or after start date.';
  }
  return result;
}

// Validate all sections before the service can replace any saved data.
export function validateProfile(value: unknown): Profile {
  if (!isRecord(value) || !isRecord(value.basics)) {
    throw new HttpError(400, 'Send a profile object containing a basics object.');
  }
  // Strip $schema and meta — they are JSON Resume file metadata, not profile data.
  const knownTopKeys = new Set(['basics', '$schema', 'meta', ...Object.keys(sections)]);
  if (Object.keys(value).some((key) => !knownTopKeys.has(key))) {
    throw new HttpError(400, 'The profile contains an unsupported section.');
  }

  const errors: FieldErrors = {};
  const basicsInput = value.basics as Record<string, unknown>;

  // Check for unsupported basics fields
  const allowedBasicsKeys = new Set([...basicsScalarFields.map((f) => f.key), 'location', 'profiles']);
  if (Object.keys(basicsInput).some((key) => !allowedBasicsKeys.has(key))) {
    errors['basics'] = 'This entry contains an unsupported field.';
  }

  // Validate scalar basics fields using only the scalar subset of the input
  const basicsScalarInput: Record<string, unknown> = {};
  for (const f of basicsScalarFields) basicsScalarInput[f.key] = basicsInput[f.key];
  const basicsResult = validateEntry(basicsScalarInput, basicsScalarFields, '', errors);
  // Clear the 'basics' unsupported-field error from validateEntry (we checked it above)
  // validateEntry sets errors['basics'] when it finds unsupported keys — but basicsScalarInput
  // only has scalar keys so validateEntry won't find unsupported keys in basicsScalarInput.

  // Validate basics.location
  const locationInput = basicsInput.location;
  let locationResult: Record<string, string | string[]>;
  if (locationInput === undefined) {
    locationResult = { address: '', postalCode: '', city: '', countryCode: '', region: '' };
  } else if (!isRecord(locationInput)) {
    errors['location'] = 'Location must be an object.';
    locationResult = { address: '', postalCode: '', city: '', countryCode: '', region: '' };
  } else {
    locationResult = validateEntry(locationInput, locationFields, 'location.', errors);
  }

  // Validate basics.profiles
  const profilesInput = basicsInput.profiles;
  let profilesResult: Record<string, string | string[]>[];
  if (profilesInput === undefined) {
    profilesResult = [];
  } else if (!Array.isArray(profilesInput) || profilesInput.length > 20) {
    errors['profiles'] = 'Use a list containing at most 20 profiles.';
    profilesResult = [];
  } else {
    profilesResult = profilesInput.map((entry, index) => {
      if (!isRecord(entry)) {
        errors[`profiles.${index}`] = 'Each profile must be an object.';
        return { network: '', username: '', url: '' };
      }
      return validateEntry(entry, socialProfileFields, `profiles.${index}.`, errors);
    });
  }

  const result: Record<string, unknown> = {
    basics: {
      ...basicsResult,
      location: locationResult,
      profiles: profilesResult,
    },
  };

  for (const [section, fields] of Object.entries(sections)) {
    const entries = value[section];
    result[section] = [];
    if (entries === undefined) continue; // Backward compatible: missing sections default to [].
    if (!Array.isArray(entries) || entries.length > 50) {
      errors[section] = 'Use a list containing at most 50 entries.';
      continue;
    }
    result[section] = entries.map((entry, index) => {
      if (!isRecord(entry)) {
        errors[`${section}.${index}`] = 'Each entry must be an object.';
        return {};
      }
      return validateEntry(entry, fields, `${section}.${index}.`, errors);
    });
  }
  if (Object.keys(errors).length) throw new HttpError(400, 'Please fix the highlighted fields.', errors);
  return result as unknown as Profile;
}