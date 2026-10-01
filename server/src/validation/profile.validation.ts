import { HttpError } from '../errors/http-error.js';
import type { FieldErrors, Profile } from '../types/profile.js';

type Field = { key: string; label: string; max?: number; required?: boolean; kind?: 'email' | 'url' | 'date' | 'list' };

const basicsFields: Field[] = [
  { key: 'name', label: 'Name', max: 120, required: true },
  { key: 'label', label: 'Professional title', max: 120 },
  { key: 'email', label: 'Email', max: 254, kind: 'email' },
  { key: 'phone', label: 'Phone', max: 50 },
  { key: 'url', label: 'Website', kind: 'url' },
  { key: 'summary', label: 'Summary', max: 5000 },
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
  education: [
    { key: 'institution', label: 'Institution', required: true }, urlField,
    { key: 'area', label: 'Area of study' }, { key: 'studyType', label: 'Degree' }, ...dateFields,
    { key: 'score', label: 'Score', max: 50 }, { key: 'courses', label: 'Courses', kind: 'list' },
  ],
  skills: [
    { key: 'name', label: 'Skill group', required: true }, { key: 'level', label: 'Level' },
    { key: 'keywords', label: 'Keywords', kind: 'list' },
  ],
  projects: [
    { key: 'name', label: 'Project name', required: true },
    { key: 'description', label: 'Description', max: 5000 }, urlField, ...dateFields,
    { key: 'highlights', label: 'Highlights', kind: 'list' },
  ],
  certificates: [
    { key: 'name', label: 'Certificate name', required: true },
    { key: 'date', label: 'Date', kind: 'date' }, { key: 'issuer', label: 'Issuer' }, urlField,
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
  if (Object.keys(value).some((key) => key !== 'basics' && !Object.hasOwn(sections, key))) {
    throw new HttpError(400, 'The profile contains an unsupported section.');
  }

  const errors: FieldErrors = {};
  const result: Record<string, unknown> = { basics: validateEntry(value.basics, basicsFields, '', errors) };
  for (const [section, fields] of Object.entries(sections)) {
    const entries = value[section];
    result[section] = [];
    if (entries === undefined) continue; // V1.1 basics-only requests still work.
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